import pool from '../config/database.js';

/**
 * Create fieldworker_states table for storing conversation state
 */
export async function createFieldWorkerStatesTable() {
  try {
    console.log('Creating fieldworker_states table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fieldworker_states (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(50) DEFAULT 'collecting',
        current_question VARCHAR(50),
        missing_fields TEXT[],
        report JSONB DEFAULT '{}',
        proofs TEXT[],
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, date)
      );
    `);

    console.log('✅ fieldworker_states table created successfully');

    // Create index for faster lookups
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_fieldworker_states_user_date 
      ON fieldworker_states(user_id, date);
    `);

    console.log('✅ fieldworker_states indexes created');

  } catch (error) {
    console.error('❌ Error creating fieldworker_states table:', error);
    throw error;
  }
}

export default createFieldWorkerStatesTable;
