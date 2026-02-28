import pool from '../src/config/database.js';

const grievanceId = 'aa8d35ba-51b0-4e1b-b5f1-2c432908d44e';

async function checkComments() {
  try {
    console.log(`\n🔍 Checking comments for grievance: ${grievanceId}\n`);

    const result = await pool.query(
      `SELECT c.id, c.comment, c.user_id, c.is_internal, c.created_at,
              u.full_name as user_name, u.role
       FROM grievancecomments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.grievance_id = $1
       ORDER BY c.created_at DESC
       LIMIT 5`,
      [grievanceId]
    );

    console.log(`Found ${result.rows.length} comments:\n`);
    
    result.rows.forEach((comment, idx) => {
      console.log(`Comment ${idx + 1}:`);
      console.log(`  ID: ${comment.id}`);
      console.log(`  User: ${comment.user_name || 'Unknown'} (${comment.user_id})`);
      console.log(`  Role: ${comment.role || 'N/A'}`);
      console.log(`  Comment: ${comment.comment}`);
      console.log(`  Type: ${typeof comment.comment}`);
      console.log(`  Internal: ${comment.is_internal}`);
      console.log(`  Created: ${comment.created_at}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkComments();
