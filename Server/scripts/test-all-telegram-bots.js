import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

console.log('\n🤖 Testing All Telegram Bots Configuration\n');
console.log('='.repeat(60));

const bots = [
  {
    name: 'Grievance Bot (Citizens)',
    envVar: 'TELEGRAM_BOT_TOKEN',
    token: process.env.TELEGRAM_BOT_TOKEN,
    purpose: 'Citizens submit grievances'
  },
  {
    name: 'Field Worker Bot (Department Staff)',
    envVar: 'TELEGRAM_FIELDWORKER_BOT_TOKEN',
    token: process.env.TELEGRAM_FIELDWORKER_BOT_TOKEN,
    purpose: 'Field workers register and report progress'
  },
  {
    name: 'Contractor Bot',
    envVar: 'TELEGRAM_CONTRACTOR_BOT_TOKEN',
    token: process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN,
    purpose: 'Contractors register and submit documents'
  }
];

let allPassed = true;

async function testBot(botConfig) {
  console.log(`\n📱 ${botConfig.name}`);
  console.log('-'.repeat(60));
  console.log(`Purpose: ${botConfig.purpose}`);
  console.log(`Env Variable: ${botConfig.envVar}`);
  
  // Check if token exists
  if (!botConfig.token) {
    console.log('❌ Token not found in .env');
    console.log(`   Add ${botConfig.envVar}=your_token_here to .env`);
    return false;
  }
  
  // Check if token is placeholder
  if (botConfig.token.includes('your_') || botConfig.token.length < 20) {
    console.log('❌ Token is a placeholder');
    console.log(`   Current: ${botConfig.token}`);
    console.log('   Replace with real token from @BotFather');
    return false;
  }
  
  console.log(`✅ Token found: ${botConfig.token.substring(0, 10)}...${botConfig.token.substring(botConfig.token.length - 5)}`);
  
  // Test connection
  try {
    const bot = new TelegramBot(botConfig.token, { polling: false });
    const botInfo = await bot.getMe();
    
    console.log('✅ Connection successful!');
    console.log(`   Bot ID: ${botInfo.id}`);
    console.log(`   Bot Name: ${botInfo.first_name}`);
    console.log(`   Bot Username: @${botInfo.username}`);
    console.log(`\n   🔗 Test: https://t.me/${botInfo.username}`);
    
    return true;
  } catch (error) {
    console.log('❌ Connection failed');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('   → Token is invalid or revoked');
      console.log('   → Get a new token from @BotFather');
    }
    
    return false;
  }
}

async function runTests() {
  const results = [];
  
  for (const botConfig of bots) {
    const passed = await testBot(botConfig);
    results.push({ name: botConfig.name, passed });
    
    if (!passed) {
      allPassed = false;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary\n');
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  if (allPassed) {
    console.log('\n🎉 All bots are configured correctly!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your server: npm start');
    console.log('2. Test each bot by sending /start command');
    console.log('3. Try the registration flows');
  } else {
    console.log('\n⚠️  Some bots need configuration');
    console.log('\n📝 To fix:');
    console.log('1. Open Telegram and search for @BotFather');
    console.log('2. Create bots using /newbot command');
    console.log('3. Copy tokens to .env file');
    console.log('4. Run this test again');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(allPassed ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n❌ Test script error:', error);
  process.exit(1);
});
