import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

console.log('\n🔍 Testing Telegram Contractor Bot Configuration\n');
console.log('='.repeat(50));

const token = process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN;

// Check if token exists
if (!token) {
  console.log('❌ TELEGRAM_CONTRACTOR_BOT_TOKEN not found in .env');
  console.log('\n📝 To fix:');
  console.log('1. Create a bot with @BotFather on Telegram');
  console.log('2. Add the token to .env file:');
  console.log('   TELEGRAM_CONTRACTOR_BOT_TOKEN=your_token_here');
  process.exit(1);
}

// Check if token is placeholder
if (token.includes('your_') || token.length < 20) {
  console.log('❌ TELEGRAM_CONTRACTOR_BOT_TOKEN is a placeholder');
  console.log(`   Current value: ${token}`);
  console.log('\n📝 To fix:');
  console.log('1. Open Telegram and search for @BotFather');
  console.log('2. Send /newbot and follow instructions');
  console.log('3. Copy the token BotFather gives you');
  console.log('4. Replace the placeholder in .env with your real token');
  process.exit(1);
}

console.log('✅ Token found in .env');
console.log(`   Token: ${token.substring(0, 10)}...${token.substring(token.length - 5)}`);

// Test bot connection
console.log('\n🔌 Testing connection to Telegram API...');

try {
  const bot = new TelegramBot(token, { polling: false });
  
  bot.getMe()
    .then((botInfo) => {
      console.log('✅ Successfully connected to Telegram API!');
      console.log('\n🤖 Bot Information:');
      console.log(`   Bot ID: ${botInfo.id}`);
      console.log(`   Bot Name: ${botInfo.first_name}`);
      console.log(`   Bot Username: @${botInfo.username}`);
      console.log(`   Can Join Groups: ${botInfo.can_join_groups}`);
      console.log(`   Can Read Messages: ${botInfo.can_read_all_group_messages}`);
      
      console.log('\n✅ Bot is ready to use!');
      console.log('\n📱 To test:');
      console.log(`1. Open Telegram and search for @${botInfo.username}`);
      console.log('2. Start a chat with the bot');
      console.log('3. Send /start command');
      console.log('4. Try /register to test registration flow');
      
      console.log('\n' + '='.repeat(50));
      process.exit(0);
    })
    .catch((error) => {
      console.log('❌ Failed to connect to Telegram API');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('401')) {
        console.log('\n📝 This usually means the token is invalid.');
        console.log('   Please check:');
        console.log('   1. Token is copied correctly from BotFather');
        console.log('   2. No extra spaces or characters');
        console.log('   3. Token is for the correct bot');
      }
      
      console.log('\n' + '='.repeat(50));
      process.exit(1);
    });
} catch (error) {
  console.log('❌ Error creating bot instance');
  console.log(`   Error: ${error.message}`);
  process.exit(1);
}
