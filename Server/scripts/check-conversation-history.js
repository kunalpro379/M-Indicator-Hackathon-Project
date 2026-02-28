import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function checkConversationHistory(phoneNumber) {
  try {
    console.log(`\n🔍 Checking conversation history for: ${phoneNumber}\n`);

    const result = await pool.query(
      `SELECT 
        id,
        user_name,
        message,
        is_bot,
        created_at
       FROM whatsapp_conversations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [phoneNumber]
    );

    if (result.rows.length === 0) {
      console.log('❌ No conversation history found');
      console.log(`   User ${phoneNumber} has not sent any messages yet\n`);
      await pool.end();
      return;
    }

    console.log(`✅ Found ${result.rows.length} messages:\n`);
    console.log('═'.repeat(80));

    // Reverse to show oldest first
    result.rows.reverse().forEach((row, idx) => {
      const timestamp = new Date(row.created_at).toLocaleString();
      const speaker = row.is_bot ? '🤖 BOT' : '👤 USER';
      const name = row.user_name || 'Unknown';
      
      console.log(`\n${idx + 1}. ${speaker} (${name}) - ${timestamp}`);
      console.log('─'.repeat(80));
      console.log(row.message);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 This proves the bot HAS memory and stores conversation history!');
    console.log('   The issue is the DeepSeek API key is invalid, so AI can\'t use this history.\n');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

const phoneNumber = process.argv[2] || '918779017300';
checkConversationHistory(phoneNumber);
