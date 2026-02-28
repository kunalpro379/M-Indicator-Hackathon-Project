import pool from '../src/config/database.js';

async function createTestPendingRequest() {
  try {
    console.log('Creating test pending field worker request...\n');

    const result = await pool.query(
      `INSERT INTO pending_registrations 
       (telegram_user_id, phone, full_name, user_type, channel, status, specialization, zone, created_at)
       VALUES ($1, $2, $3, 'field_worker', 'telegram', 'pending', $4, $5, NOW())
       RETURNING *`,
      [
        '123456789', // Telegram user ID
        '+919876543210', // Phone number
        'Test Field Worker', // Full name
        'Plumbing', // Specialization
        'Zone A' // Zone
      ]
    );

    console.log('✅ Test pending request created:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('\nNow refresh your dashboard to see the pending request!');

  } catch (error) {
    console.error('❌ Error creating test request:', error.message);
  } finally {
    await pool.end();
  }
}

createTestPendingRequest();
