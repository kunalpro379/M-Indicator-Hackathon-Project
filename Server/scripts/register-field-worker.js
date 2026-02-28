import pool from '../src/config/database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function registerDepartmentStaff() {
  try {
    console.log('\n👷 Department Staff WhatsApp Registration\n');

    const phone = await question('Enter phone number (with country code, e.g., +919876543210): ');
    
    // Check if user already exists
    const existingUser = await pool.query(
      `SELECT u.id, u.full_name, u.role, u.status, u.department_id, d.name as department_name,
              doff.staff_id, doff.role as staff_role
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       LEFT JOIN departmentofficers doff ON doff.user_id = u.id
       WHERE u.phone = $1`,
      [phone]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      console.log(`\n✅ User found:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.full_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Department: ${user.department_name || 'None'}`);
      console.log(`   Staff ID: ${user.staff_id || 'Not assigned'}`);
      console.log(`   Staff Role: ${user.staff_role || 'N/A'}`);
      console.log(`   Status: ${user.status}`);
      
      if (!user.staff_id) {
        console.log('\n⚠️  This user is not registered as department staff.');
        console.log('   They need to be added to the departmentofficers table first.');
      } else {
        console.log('\n✅ This staff member can now use WhatsApp with this phone number!');
      }
    } else {
      console.log('\n❌ No user found with this phone number.');
      console.log('\nTo register a staff member for WhatsApp:');
      console.log('1. First create the user in the users table');
      console.log('2. Add them to departmentofficers table with a staff_id');
      console.log('3. Update their phone number in users table');
      console.log('4. Run this script again to verify');
      
      const create = await question('\nWould you like to see existing staff members? (yes/no): ');
      if (create.toLowerCase() === 'yes') {
        const staff = await pool.query(`
          SELECT u.id, u.full_name, u.phone, u.role, d.name as department_name,
                 doff.staff_id, doff.role as staff_role, doff.status
          FROM departmentofficers doff
          JOIN users u ON u.id = doff.user_id
          LEFT JOIN departments d ON d.id = doff.department_id
          ORDER BY d.name, doff.staff_id
          LIMIT 20
        `);
        
        console.log('\n📋 Existing Department Staff:\n');
        staff.rows.forEach(s => {
          console.log(`   ${s.staff_id} - ${s.full_name}`);
          console.log(`      Phone: ${s.phone || 'NOT SET'}`);
          console.log(`      Department: ${s.department_name}`);
          console.log(`      Role: ${s.staff_role}`);
          console.log(`      Status: ${s.status}\n`);
        });
        
        const updatePhone = await question('\nEnter user ID to update phone number (or press Enter to skip): ');
        if (updatePhone.trim()) {
          await pool.query(
            'UPDATE users SET phone = $1 WHERE id = $2',
            [phone, updatePhone.trim()]
          );
          console.log('✅ Phone number updated! They can now use WhatsApp.');
        }
      }
    }

    console.log('\n📱 WhatsApp Integration Info:');
    console.log('   - Only department staff (departmentofficers) can use WhatsApp');
    console.log('   - They must have a phone number in the users table');
    console.log('   - Their status must be "active" in both tables');
    console.log('   - They will use the field worker daily reporting workflow\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

registerDepartmentStaff();
