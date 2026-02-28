import pool from '../config/database.js';

async function addAIAnalysisToReports() {
  const client = await pool.connect();
  
  try {
    console.log('Adding AI analysis fields to daily_reports...');

    // Add AI analysis columns
    await client.query(`
      ALTER TABLE daily_reports 
      ADD COLUMN IF NOT EXISTS ai_summary TEXT,
      ADD COLUMN IF NOT EXISTS ai_analysis JSONB,
      ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50),
      ADD COLUMN IF NOT EXISTS quality_score NUMERIC,
      ADD COLUMN IF NOT EXISTS tasks_completed TEXT[],
      ADD COLUMN IF NOT EXISTS materials_used TEXT[],
      ADD COLUMN IF NOT EXISTS issues_found TEXT[],
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted',
      ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
      ADD COLUMN IF NOT EXISTS channel VARCHAR(50),
      ADD COLUMN IF NOT EXISTS message_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    // Create index for status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_reports_status 
      ON daily_reports(status);
    `);

    console.log('✅ AI analysis fields added successfully');

  } catch (error) {
    console.error('Error adding AI analysis fields:', error);
    // Don't throw - columns might already exist
  } finally {
    client.release();
  }
}

export default addAIAnalysisToReports;
