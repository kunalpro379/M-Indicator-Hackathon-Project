import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function registerContractor(phoneNumber, fullName) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log(`\n🔄 Registering contractor: ${fullName} (${phoneNumber})`);

    // 1. Check if user already exists
    const existingUser = await client.query(
      'SELECT id, role FROM users WHERE phone = $1',
      [phoneNumber]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`✅ User already exists with ID: ${userId}`);
      
      // Update role to contractor if different
      if (existingUser.rows[0].role !== 'contractor') {
        await client.query(
          'UPDATE users SET role = $1 WHERE id = $2',
          ['contractor', userId]
        );
        console.log(`✅ Updated user role to contractor`);
      }
    } else {
      // 2. Create user in users table
      const userResult = await client.query(
        `INSERT INTO users (full_name, phone, role, status, password_hash)
         VALUES ($1, $2, 'contractor', 'active', 'whatsapp_user_placeholder')
         RETURNING id`,
        [fullName, phoneNumber]
      );
      userId = userResult.rows[0].id;
      console.log(`✅ Created user with ID: ${userId}`);

      // 3. Create citizen record (required for foreign key constraints)
      await client.query(
        `INSERT INTO citizens (user_id, phone, full_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO NOTHING`,
        [userId, phoneNumber, fullName]
      );
      console.log(`✅ Created citizen record`);
    }

    // 4. Create contractor profile (if not exists)
    const contractorCheck = await client.query(
      'SELECT id FROM contractors WHERE phone = $1',
      [phoneNumber]
    );

    if (contractorCheck.rows.length === 0) {
      // Generate contractor ID
      const contractorId = `CONT-${Date.now().toString().slice(-6)}`;
      
      await client.query(
        `INSERT INTO contractors (contractor_id, company_name, contact_person, phone, email, is_active)
         VALUES ($1, 'Pending Registration', $2, $3, $4, true)`,
        [contractorId, fullName, phoneNumber, `${phoneNumber}@temp.com`]
      );
      console.log(`✅ Created contractor profile (ID: ${contractorId})`);
    } else {
      console.log(`✅ Contractor profile already exists`);
    }

    await client.query('COMMIT');

    console.log(`\n✅ Contractor registered successfully!`);
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Name: ${fullName}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Status: Ready to receive WhatsApp messages`);
    console.log(`\n💬 The contractor can now message the WhatsApp bot to complete registration.`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error registering contractor:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Get phone number from command line
const phoneNumber = process.argv[2];
const fullName = process.argv[3] || 'Contractor';

if (!phoneNumber) {
  console.log('Usage: node register-contractor.js <phone_number> [full_name]');
  console.log('Example: node register-contractor.js 918779017300 "Aditya Mhatre"');
  process.exit(1);
}

registerContractor(phoneNumber, fullName)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
