import pool from '../config/database.js';

async function createPendingRegistrationsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating pending registrations table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS pending_registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        telegram_user_id VARCHAR(255),
        whatsapp_phone VARCHAR(255),
        full_name VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL, -- 'field_worker' or 'contractor'
        department_id UUID REFERENCES departments(id),
        
        -- Contractor specific fields
        company_name VARCHAR(255),
        license_number VARCHAR(255),
        gst_number VARCHAR(255),
        category VARCHAR(255),
        
        -- Field worker specific fields
        specialization VARCHAR(255),
        zone VARCHAR(255),
        ward VARCHAR(255),
        
        -- Contact info
        email VARCHAR(255),
        phone VARCHAR(255),
        
        -- Status
        status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        reviewed_by UUID REFERENCES users(id),
        reviewed_at TIMESTAMP,
        rejection_reason TEXT,
        
        -- Metadata
        channel VARCHAR(50) NOT NULL, -- 'telegram' or 'whatsapp'
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        UNIQUE(telegram_user_id),
        UNIQUE(whatsapp_phone)
      );
    `);

    // Create index for status
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_status 
      ON pending_registrations(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_pending_registrations_department 
      ON pending_registrations(department_id);
    `);

    // Create temp data table for storing phone numbers during registration
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_temp_data (
        telegram_user_id VARCHAR(255) PRIMARY KEY,
        phone_number VARCHAR(255),
        full_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Pending registrations table created successfully');

  } catch (error) {
    console.error('Error creating pending registrations table:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default createPendingRegistrationsTable;
