import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkPolicies() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('CHECKING DEPARTMENT POLICIES');
    console.log('='.repeat(80) + '\n');
    
    const result = await client.query(`
      SELECT id, name, 
             CASE 
               WHEN policies IS NOT NULL THEN LENGTH(policies)
               ELSE 0
             END as policy_length,
             CASE 
               WHEN policies IS NOT NULL THEN SUBSTRING(policies, 1, 200)
               ELSE 'No policies'
             END as preview
      FROM departments
      ORDER BY name
    `);
    
    console.log(`Found ${result.rows.length} departments:\n`);
    
    result.rows.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.name}`);
      console.log(`   ID: ${row.id}`);
      console.log(`   Policy Length: ${row.policy_length} characters`);
      console.log(`   Preview: ${row.preview}...`);
      console.log('');
    });
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

checkPolicies()
  .then(() => {
    console.log('\n✅ Check completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error);
    process.exit(1);
  });
