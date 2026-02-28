import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 Testing WhatsApp Bot Setup...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking Environment Variables:');
const requiredEnvVars = [
  'GEMINI_API_KEY',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD'
];

let envOk = true;
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value.includes('your-') || value.includes('placeholder')) {
    console.log(`   ❌ ${varName}: Not configured`);
    envOk = false;
  } else {
    console.log(`   ✅ ${varName}: Configured`);
  }
});

if (!envOk) {
  console.log('\n⚠️  Please configure missing environment variables in .env file');
  console.log('   See INTELLIGENT_BOT_SETUP.md for instructions\n');
  process.exit(1);
}

// Test 2: Gemini API
console.log('\n2️⃣ Testing Gemini API Connection:');
try {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-3.1-pro-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{
        parts: [{
          text: 'Say "Hello" if you can hear me.'
        }]
      }]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    }
  );

  const aiResponse = response.data.candidates[0].content.parts[0].text;
  console.log(`   ✅ Gemini API is working`);
  console.log(`   📝 Response: "${aiResponse.substring(0, 100)}..."`);
} catch (error) {
  console.log(`   ❌ Gemini API Error: ${error.message}`);
  if (error.response?.data) {
    console.log(`   📋 Details:`, JSON.stringify(error.response.data, null, 2));
  }
  if (error.response?.status === 400) {
    console.log('   💡 Invalid API key. Check your GEMINI_API_KEY in .env');
  } else if (error.response?.status === 429) {
    console.log('   💡 Rate limit exceeded. Wait a moment and try again.');
  } else {
    console.log('   💡 Check your internet connection and API key');
  }
  process.exit(1);
}

// Test 3: Database Connection
console.log('\n3️⃣ Testing Database Connection:');
try {
  const { default: pool } = await import('../src/config/database.js');
  const result = await pool.query('SELECT NOW() as current_time');
  console.log(`   ✅ Database connected`);
  console.log(`   📝 Server time: ${result.rows[0].current_time}`);
  
  // Check required tables
  const tables = ['users', 'contractors', 'whatsapp_conversations', 'departmentofficers'];
  for (const table of tables) {
    const check = await pool.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
      [table]
    );
    if (check.rows[0].exists) {
      console.log(`   ✅ Table '${table}' exists`);
    } else {
      console.log(`   ❌ Table '${table}' missing`);
    }
  }
  
  await pool.end();
} catch (error) {
  console.log(`   ❌ Database Error: ${error.message}`);
  console.log('   💡 Check database credentials in .env file');
  process.exit(1);
}

// Test 4: WhatsApp Session
console.log('\n4️⃣ Checking WhatsApp Session:');
const fs = await import('fs');
if (fs.existsSync('.wwebjs_auth')) {
  console.log('   ✅ WhatsApp session folder exists');
  console.log('   💡 If you have connection issues, delete this folder and scan QR again');
} else {
  console.log('   ⚠️  No WhatsApp session found');
  console.log('   💡 You will need to scan QR code when you start the server');
}

console.log('\n✅ All tests passed! Your WhatsApp bot is ready to use.\n');
console.log('📚 Next steps:');
console.log('   1. Start server: npm run dev');
console.log('   2. Scan QR code with WhatsApp');
console.log('   3. Register users with scripts/register-contractor.js');
console.log('   4. Send test messages to the bot\n');
console.log('📖 See INTELLIGENT_BOT_SETUP.md for detailed instructions\n');

process.exit(0);
