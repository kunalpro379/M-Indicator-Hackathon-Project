import pool from '../config/database.js';

/**
 * Create user_states table for autonomous AI agent state management
 */
export async function createUserStatesTable() {
  try {
    console.log('Creating user_states table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_states (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        channel VARCHAR(50) NOT NULL DEFAULT 'telegram',
        state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, channel)
      );
    `);

    console.log('✅ user_states table created successfully');

    // Create indexes for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_states_user_channel 
      ON user_states(user_id, channel);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_states_updated 
      ON user_states(updated_at DESC);
    `);

    // Create index on workflow status for analytics
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_states_workflow_status 
      ON user_states((state_data->'workflow'->>'status'));
    `);

    console.log('✅ user_states indexes created');

  } catch (error) {
    console.error('❌ Error creating user_states table:', error);
    throw error;
  }
}

export default createUserStatesTable;
