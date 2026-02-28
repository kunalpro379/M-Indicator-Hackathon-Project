import pool from '../src/config/database.js';

const userId = 'c7ed0d42-9806-4765-9a2e-cadad354ab17';

async function checkUser() {
  try {
    console.log(`\n🔍 Checking user: ${userId}\n`);

    // Check users table
    const userResult = await pool.query(
      'SELECT id, email, full_name, role, status FROM users WHERE id = $1',
      [userId]
    );
    
    console.log('Users table:');
    if (userResult.rows.length > 0) {
      console.log('  ✅ User exists:', userResult.rows[0]);
    } else {
      console.log('  ❌ User NOT found');
    }

    // Check citizens table
    const citizenResult = await pool.query(
      'SELECT id, user_id, full_name, email, phone FROM citizens WHERE user_id = $1',
      [userId]
    );
    
    console.log('\nCitizens table:');
    if (citizenResult.rows.length > 0) {
      console.log('  ✅ Citizen exists:', citizenResult.rows[0]);
    } else {
      console.log('  ❌ Citizen NOT found');
      
      // Create citizen record
      console.log('\n  Creating citizen record...');
      const user = userResult.rows[0];
      if (user) {
        await pool.query(
          `INSERT INTO citizens (user_id, full_name, email, phone, is_registered, is_active, created_at)
           VALUES ($1, $2, $3, $4, true, true, NOW())`,
          [userId, user.full_name, user.email, `+91-${userId.substring(0, 10)}`]
        );
        console.log('  ✅ Citizen created!');
      }
    }

    // Check grievances for this user
    const grievanceResult = await pool.query(
      `SELECT g.id, g.grievance_id, g.status, c.id as citizen_id, c.user_id
       FROM usergrievance g
       LEFT JOIN citizens c ON g.citizen_id = c.id
       WHERE g.id = 'aa8d35ba-51b0-4e1b-b5f1-2c432908d44e'`
    );

    console.log('\nGrievance:');
    if (grievanceResult.rows.length > 0) {
      console.log('  ✅ Grievance exists:', grievanceResult.rows[0]);
      
      const grievance = grievanceResult.rows[0];
      if (!grievance.citizen_id) {
        console.log('  ⚠️  Grievance has no citizen_id!');
      } else if (grievance.user_id !== userId) {
        console.log(`  ⚠️  Grievance belongs to different user: ${grievance.user_id}`);
      }
    } else {
      console.log('  ❌ Grievance NOT found');
    }

    console.log('\n');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkUser();
