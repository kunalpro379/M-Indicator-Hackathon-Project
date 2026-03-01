import pool from '../config/database.js';

async function addContractorAnalysis() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('Adding contractor analysis columns...');

    // Add AI analysis columns to contractors table
    await client.query(`
      DO $$ 
      BEGIN
        -- Add ai_analysis column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'ai_analysis'
        ) THEN
          ALTER TABLE contractors ADD COLUMN ai_analysis JSONB;
        END IF;

        -- Add analysis_score column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'analysis_score'
        ) THEN
          ALTER TABLE contractors ADD COLUMN analysis_score FLOAT CHECK (analysis_score >= 0 AND analysis_score <= 100);
        END IF;

        -- Add analyzed_at column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'analyzed_at'
        ) THEN
          ALTER TABLE contractors ADD COLUMN analyzed_at TIMESTAMP;
        END IF;

        -- Add experience_years column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'experience_years'
        ) THEN
          ALTER TABLE contractors ADD COLUMN experience_years INTEGER;
        END IF;

        -- Add specializations column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'specializations'
        ) THEN
          ALTER TABLE contractors ADD COLUMN specializations TEXT[];
        END IF;

        -- Add past_projects column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'past_projects'
        ) THEN
          ALTER TABLE contractors ADD COLUMN past_projects JSONB DEFAULT '[]'::jsonb;
        END IF;

        -- Add certifications column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'certifications'
        ) THEN
          ALTER TABLE contractors ADD COLUMN certifications TEXT[];
        END IF;

        -- Add contact_info column
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'contractors' AND column_name = 'contact_info'
        ) THEN
          ALTER TABLE contractors ADD COLUMN contact_info JSONB;
        END IF;
      END $$;
    `);

    // Create index for analysis score
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_contractors_analysis_score 
      ON contractors(analysis_score DESC NULLS LAST);
    `);

    await client.query('COMMIT');
    console.log('✅ Contractor analysis columns added successfully');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error adding contractor analysis columns:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default addContractorAnalysis;
