import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDeepSeek() {
  console.log('\n🤖 DeepSeek API Setup\n');
  console.log('The bot needs a DeepSeek API key to understand context and extract information intelligently.\n');
  
  console.log('📋 Steps to get your API key:');
  console.log('   1. Visit: https://platform.deepseek.com/');
  console.log('   2. Sign up or log in');
  console.log('   3. Go to API Keys section');
  console.log('   4. Click "Create API Key"');
  console.log('   5. Copy the key (starts with "sk-")\n');
  
  const apiKey = await question('Paste your DeepSeek API key here: ');
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('\n❌ Invalid API key format. Key should start with "sk-"');
    console.log('   Please get a valid key from https://platform.deepseek.com/\n');
    rl.close();
    process.exit(1);
  }
  
  // Read .env file
  const envPath = path.join(__dirname, '../.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the API key
  const oldLine = 'DEEPSEEK_API_KEY=your_deepseek_api_key';
  const newLine = `DEEPSEEK_API_KEY=${apiKey}`;
  
  if (envContent.includes(oldLine)) {
    envContent = envContent.replace(oldLine, newLine);
  } else if (envContent.includes('DEEPSEEK_API_KEY=')) {
    // Replace existing key
    envContent = envContent.replace(/DEEPSEEK_API_KEY=.*/g, newLine);
  } else {
    // Add new key
    envContent += `\n${newLine}\n`;
  }
  
  // Write back to .env
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ API key saved to .env file!');
  console.log('\n🔄 Next steps:');
  console.log('   1. Restart your server (Ctrl+C and npm run dev)');
  console.log('   2. Test the setup: node scripts/test-whatsapp-setup.js');
  console.log('   3. Send a message to the bot\n');
  
  rl.close();
}

setupDeepSeek().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});
