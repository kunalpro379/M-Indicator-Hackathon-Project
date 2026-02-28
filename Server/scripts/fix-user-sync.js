import pool from '../src/config/database.js';

/**
 * Fix user synchronization issues between citizens and users tables
 * This ensures all citizens have corresponding users entries
 */
async function fixUserSync() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('🔧 Fixing user synchronization...\n');

    // 1. Find citizens without corresponding users
    const orphanedCitizens = await client.query(`
      SELECT c.id, c.user_id, c.full_name, c.email, c.phone
      FROM citizens c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.user_id IS NOT NULL AND u.id IS NULL
    `);

    console.log(`Found ${orphanedCitizens.rows.length} citizens without user entries`);

    // 2. Create missing user entries
    for (const citizen of orphanedCitizens.rows) {
      console.log(`Creating user for citizen: ${citizen.full_name} (${citizen.email})`);
      
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, 'citizen', 'active', NOW())
        ON CONFLICT (id) DO NOTHING
      `, [citizen.user_id, citizen.email, '$2b$10$synced.from.citizens.table.placeholder', citizen.full_name, citizen.phone]);
    }

    // 3. Find users who made comments but don't exist in users table
    const orphanedComments = await client.query(`
      SELECT DISTINCT gc.user_id, COUNT(*) as comment_count
      FROM grievancecomments gc
      LEFT JOIN users u ON gc.user_id = u.id
      WHERE u.id IS NULL
      GROUP BY gc.user_id
    `);

    console.log(`\nFound ${orphanedComments.rows.length} user IDs in comments without user entries`);

    // 4. Try to find these users in citizens table and create user entries
    for (const comment of orphanedComments.rows) {
      const citizen = await client.query(
        'SELECT id, user_id, full_name, email, phone FROM citizens WHERE user_id = $1',
        [comment.user_id]
      );

      if (citizen.rows.length > 0) {
        const c = citizen.rows[0];
        console.log(`Creating user from citizen data: ${c.full_name} (${comment.comment_count} comments)`);
        
        await client.query(`
          INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at)
          VALUES ($1, $2, $3, $4, $5, 'citizen', 'active', NOW())
          ON CONFLICT (id) DO NOTHING
        `, [c.user_id, c.email, '$2b$10$synced.from.citizens.for.comments', c.full_name, c.phone]);
      } else {
        console.log(`⚠️  Cannot find citizen data for user_id: ${comment.user_id} (${comment.comment_count} comments)`);
        console.log(`   Creating placeholder user...`);
        
        await client.query(`
          INSERT INTO users (id, email, password_hash, full_name, role, status, created_at)
          VALUES ($1, $2, $3, $4, 'citizen', 'active', NOW())
          ON CONFLICT (id) DO NOTHING
        `, [comment.user_id, `unknown_${comment.user_id}@placeholder.com`, '$2b$10$placeholder.for.orphaned.comments', `User ${comment.user_id.substring(0, 8)}`]);
      }
    }

    // 5. Verify the fix
    const remainingOrphans = await client.query(`
      SELECT COUNT(*) as count
      FROM grievancecomments gc
      LEFT JOIN users u ON gc.user_id = u.id
      WHERE u.id IS NULL
    `);

    await client.query('COMMIT');

    console.log('\n✅ User synchronization complete!');
    console.log(`   Remaining orphaned comments: ${remainingOrphans.rows[0].count}`);

    if (remainingOrphans.rows[0].count > 0) {
      console.log('\n⚠️  Some comments still have missing users. Manual intervention may be required.');
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error fixing user sync:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixUserSync().catch(console.error);
