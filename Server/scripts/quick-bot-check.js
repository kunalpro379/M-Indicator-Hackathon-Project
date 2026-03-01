import dotenv from 'dotenv';
dotenv.config();

console.log('\n🚀 Quick Telegram Bots Status Check\n');

const bots = [
  { name: 'Grievance Bot', env: 'TELEGRAM_BOT_TOKEN', token: process.env.TELEGRAM_BOT_TOKEN },
  { name: 'Field Worker Bot', env: 'TELEGRAM_FIELDWORKER_BOT_TOKEN', token: process.env.TELEGRAM_FIELDWORKER_BOT_TOKEN },
  { name: 'Contractor Bot', env: 'TELEGRAM_CONTRACTOR_BOT_TOKEN', token: process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN }
];

let allGood = true;

bots.forEach(bot => {
  const hasToken = bot.token && bot.token.length > 20 && !bot.token.includes('your_');
  const status = hasToken ? '✅' : '❌';
  
  console.log(`${status} ${bot.name}`);
  
  if (!hasToken) {
    allGood = false;
    if (!bot.token) {
      console.log(`   → Missing ${bot.env} in .env`);
    } else if (bot.token.includes('your_')) {
      console.log(`   → ${bot.env} is a placeholder`);
    } else {
      console.log(`   → ${bot.env} looks invalid`);
    }
  } else {
    console.log(`   → Token: ${bot.token.substring(0, 10)}...`);
  }
  console.log();
});

if (allGood) {
  console.log('🎉 All bots configured! Run: npm start\n');
  console.log('📝 Then test each bot:');
  console.log('   node scripts/test-all-telegram-bots.js\n');
} else {
  console.log('⚠️  Some bots need setup\n');
  console.log('📝 Next steps:');
  console.log('   1. Read: ALL_TELEGRAM_BOTS_SETUP.md');
  console.log('   2. Create missing bots with @BotFather');
  console.log('   3. Update .env with tokens');
  console.log('   4. Run this script again\n');
}
