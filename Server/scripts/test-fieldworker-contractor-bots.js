import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

console.log('\n🔧 Testing Field Worker & Contractor Bots\n');
console.log('='.repeat(60));

async function testBot(name, envVar, token) {
  console.log(`\n📱 ${name}`);
  console.log('-'.repeat(60));
  
  // Check token exists
  if (!token) {
    console.log(`❌ ${envVar} not found in .env`);
    console.log(`   Add ${envVar}=your_token_here to .env`);
    return { success: false, error: 'Token not found' };
  }
  
  // Check token is not placeholder
  if (token.includes('your_') || token.length < 20) {
    console.log(`❌ ${envVar} is a placeholder`);
    console.log(`   Current: ${token}`);
    console.log(`   Get real token from @BotFather`);
    return { success: false, error: 'Placeholder token' };
  }
  
  console.log(`✅ Token found: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);
  
  // Test connection
  try {
    const bot = new TelegramBot(token, { polling: false });
    const botInfo = await bot.getMe();
    
    console.log('✅ Connection successful!');
    console.log(`   Bot ID: ${botInfo.id}`);
    console.log(`   Bot Name: ${botInfo.first_name}`);
    console.log(`   Bot Username: @${botInfo.username}`);
    console.log(`   Can Join Groups: ${botInfo.can_join_groups}`);
    
    console.log(`\n   🔗 Test on Telegram: https://t.me/${botInfo.username}`);
    console.log(`   📝 Send /start to test`);
    
    return { 
      success: true, 
      username: botInfo.username,
      botId: botInfo.id 
    };
  } catch (error) {
    console.log('❌ Connection failed');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('401')) {
      console.log('   → Token is invalid or revoked');
      console.log('   → Create new bot with @BotFather');
    } else if (error.message.includes('409')) {
      console.log('   → Bot is already running elsewhere');
      console.log('   → Stop other instances and try again');
    }
    
    return { success: false, error: error.message };
  }
}

async function runTests() {
  const fieldWorkerToken = process.env.TELEGRAM_FIELDWORKER_BOT_TOKEN;
  const contractorToken = process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN;
  
  const fieldWorkerResult = await testBot(
    'Field Worker Bot',
    'TELEGRAM_FIELDWORKER_BOT_TOKEN',
    fieldWorkerToken
  );
  
  const contractorResult = await testBot(
    'Contractor Bot',
    'TELEGRAM_CONTRACTOR_BOT_TOKEN',
    contractorToken
  );
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Results\n');
  
  const fieldWorkerStatus = fieldWorkerResult.success ? '✅' : '❌';
  const contractorStatus = contractorResult.success ? '✅' : '❌';
  
  console.log(`${fieldWorkerStatus} Field Worker Bot`);
  if (fieldWorkerResult.success) {
    console.log(`   Username: @${fieldWorkerResult.username}`);
    console.log(`   Bot ID: ${fieldWorkerResult.botId}`);
  } else {
    console.log(`   Error: ${fieldWorkerResult.error}`);
  }
  
  console.log(`\n${contractorStatus} Contractor Bot`);
  if (contractorResult.success) {
    console.log(`   Username: @${contractorResult.username}`);
    console.log(`   Bot ID: ${contractorResult.botId}`);
  } else {
    console.log(`   Error: ${contractorResult.error}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (fieldWorkerResult.success && contractorResult.success) {
    console.log('\n🎉 Both bots are working!\n');
    console.log('📝 Next steps:');
    console.log('1. Start server: npm start');
    console.log('2. Test Field Worker Bot:');
    console.log(`   - Open: https://t.me/${fieldWorkerResult.username}`);
    console.log('   - Send: /start');
    console.log('   - Try: Hi (to start registration)');
    console.log('\n3. Test Contractor Bot:');
    console.log(`   - Open: https://t.me/${contractorResult.username}`);
    console.log('   - Send: /start');
    console.log('   - Try: /register');
  } else {
    console.log('\n⚠️  Some bots need fixing\n');
    
    if (!fieldWorkerResult.success) {
      console.log('🔧 Fix Field Worker Bot:');
      console.log('1. Open Telegram → Search @BotFather');
      console.log('2. Send: /newbot');
      console.log('3. Name: IGRS Field Worker Bot');
      console.log('4. Username: igrs_fieldworker_bot');
      console.log('5. Copy token to .env:');
      console.log('   TELEGRAM_FIELDWORKER_BOT_TOKEN=your_token_here\n');
    }
    
    if (!contractorResult.success) {
      console.log('🔧 Fix Contractor Bot:');
      console.log('1. Open Telegram → Search @BotFather');
      console.log('2. Send: /newbot');
      console.log('3. Name: IGRS Contractor Bot');
      console.log('4. Username: igrs_contractor_bot');
      console.log('5. Copy token to .env:');
      console.log('   TELEGRAM_CONTRACTOR_BOT_TOKEN=your_token_here\n');
    }
  }
  
  console.log('='.repeat(60) + '\n');
  
  process.exit(fieldWorkerResult.success && contractorResult.success ? 0 : 1);
}

runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
