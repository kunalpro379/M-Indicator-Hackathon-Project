import pool from '../config/database.js';

/**
 * Sync users table with citizens table
 * Creates user entries for all citizens that don't have them
 */
async function syncUsersFromCitizens() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('🔄 Syncing users from citizens table...\n');

    // Find citizens without corresponding users (where user_id is NOT NULL)
    const orphanedCitizens = await client.query(`
      SELECT c.id, c.user_id, c.full_name, c.email, c.phone
      FROM citizens c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id IS NOT NULL AND u.id IS NULL
    `);

    console.log(`Found ${orphanedCitizens.rows.length} citizens without user entries`);

    // Create missing user entries
    for (const citizen of orphanedCitizens.rows) {
      console.log(`Creating user for: ${citizen.full_name} (${citizen.email})`);
      
      try {
        await client.query(`
          INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'citizen', 'active', NOW())
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone,
            status = 'active'
        `, [citizen.user_id, citizen.email, '$2b$10$synced.from.citizens.table.placeholder', citizen.full_name, citizen.phone]);
      } catch (err) {
        console.log(`⚠️  Skipping ${citizen.email}: ${err.message}`);
      }
    }

    // Find users in comments who don't exist in users table
    const orphanedComments = await client.query(`
      SELECT DISTINCT gc.user_id, COUNT(*) as comment_count
      FROM grievancecomments gc
      LEFT JOIN users u ON gc.user_id = u.id
      WHERE u.id IS NULL
      GROUP BY gc.user_id
    `);

    console.log(`\nFound ${orphanedComments.rows.length} user IDs in comments without user entries`);

    // Try to create users from citizens data
    for (const comment of orphanedComments.rows) {
      const citizen = await client.query(
        'SELECT id, user_id, full_name, email, phone FROM citizens WHERE user_id = $1',
        [comment.user_id]
      );

      if (citizen.rows.length > 0) {
        const c = citizen.rows[0];
        console.log(`Creating user from citizen: ${c.full_name} (${comment.comment_count} comments)`);
        
        try {
          await client.query(`
            INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at)
            VALUES ($1, $2, $3, $4, $5, 'citizen', 'active', NOW())
            ON CONFLICT (id) DO UPDATE SET
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              phone = EXCLUDED.phone,
              status = 'active'
          `, [c.user_id, c.email, '$2b$10$synced.from.citizens.table.placeholder', c.full_name, c.phone]);
        } catch (err) {
          console.log(`⚠️  Skipping ${c.email}: ${err.message}`);
        }
      } else {
        console.log(`⚠️  Creating placeholder for user_id: ${comment.user_id} (${comment.comment_count} comments)`);
        
        try {
          await client.query(`
            INSERT INTO users (id, email, password_hash, full_name, role, status, created_at)
            VALUES ($1, $2, $3, $4, 'citizen', 'active', NOW())
            ON CONFLICT (id) DO UPDATE SET status = 'active'
          `, [
            comment.user_id, 
            `user_${comment.user_id.substring(0, 8)}@placeholder.com`,
            '$2b$10$placeholder.for.orphaned.comment.user',
            `User ${comment.user_id.substring(0, 8)}`
          ]);
        } catch (err) {
          console.log(`⚠️  Skipping placeholder for ${comment.user_id}: ${err.message}`);
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n✅ User sync completed successfully!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error syncing users:', error);
    // Don't throw - allow server to continue
  } finally {
    client.release();
  }
}

export default syncUsersFromCitizens;
