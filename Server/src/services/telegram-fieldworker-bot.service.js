import TelegramBot from 'node-telegram-bot-api';
import agentService from './agent.service.js';

class TelegramFieldWorkerBotService {
  constructor() {
    this.bot = null;
    this.isInitialized = false;
  }

  /**
   * Initialize the Field Worker Telegram bot
   */
  async initialize() {
    try {
      const token = process.env.TELEGRAM_FIELDWORKER_BOT_TOKEN;
      
      if (!token) {
        console.log('⚠️  TELEGRAM_FIELDWORKER_BOT_TOKEN not configured - Field Worker bot disabled');
        return;
      }

      this.bot = new TelegramBot(token, { polling: true });
      
      // Handle incoming messages
      this.bot.on('message', async (msg) => {
        await this.handleMessage(msg);
      });

      // Handle photo messages
      this.bot.on('photo', async (msg) => {
        await this.handlePhoto(msg);
      });

      // Handle contact sharing
      this.bot.on('contact', async (msg) => {
        await this.handleContact(msg);
      });

      // Handle errors
      this.bot.on('polling_error', (error) => {
        console.error('❌ Field Worker Bot polling error:', error.message);
      });

      this.isInitialized = true;
      console.log('✅ Field Worker Telegram bot initialized successfully');
      
      // Get bot info
      const botInfo = await this.bot.getMe();
      console.log(`🤖 Field Worker Bot: @${botInfo.username}`);

    } catch (error) {
      console.error('❌ Failed to initialize Field Worker Telegram bot:', error);
      throw error;
    }
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(msg) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const userName = msg.from.first_name || 'User';
      const message = msg.text || '';

      console.log(`\n📨 Field Worker Bot - Incoming message:`);
      console.log(`From: ${userName} (@${msg.from.username || 'no_username'})`);
      console.log(`Chat ID: ${chatId}`);
      console.log(`Message: ${message}`);

      // Handle commands
      if (message.startsWith('/')) {
        await this.handleCommand(chatId, message, userName);
        return;
      }

      // Send to agent service for field worker workflow
      console.log('🤖 Sending to agent service...');
      const response = await agentService.processMessage({
        userId: userId,
        userName: userName,
        message: message,
        channel: 'telegram_fieldworker',
        messageId: msg.message_id.toString(),
        media: null,
        location: null
      });

      console.log('✅ Agent response:', response.text.substring(0, 100) + '...');

      // Send response
      await this.sendMessage(chatId, response.text, response.reply_markup);
      console.log('✅ Response sent!');

    } catch (error) {
      console.error('❌ Error handling message:', error);
      await this.sendMessage(
        msg.chat.id,
        'Sorry, I encountered an error. Please try again.'
      );
    }
  }

  /**
   * Handle contact sharing
   */
  async handleContact(msg) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const contact = msg.contact;

      console.log(`\n📱 Contact shared:`);
      console.log(`User ID: ${userId}`);
      console.log(`Phone: ${contact.phone_number}`);
      console.log(`Name: ${contact.first_name} ${contact.last_name || ''}`);

      // Store phone number
      await agentService.storeUserPhone(
        userId,
        contact.phone_number,
        `${contact.first_name} ${contact.last_name || ''}`.trim()
      );

      await this.sendMessage(
        chatId,
        `✅ Contact received!\n\nPhone: ${contact.phone_number}\n\nNow you can register as a field worker. Type "register" to continue.`
      );

    } catch (error) {
      console.error('❌ Error handling contact:', error);
      await this.sendMessage(
        chatId,
        'Sorry, I encountered an error processing your contact.'
      );
    }
  }

  /**
   * Handle photo messages
   */
  async handlePhoto(msg) {
    try {
      const chatId = msg.chat.id;
      const userId = msg.from.id.toString();
      const userName = msg.from.first_name || 'User';

      console.log(`\n📸 Field Worker Bot - Photo received:`);
      console.log(`From: ${userName} (@${msg.from.username || 'no_username'})`);
      console.log(`Chat ID: ${chatId}`);

      // Get the largest photo
      const photos = msg.photo;
      const photo = photos[photos.length - 1];
      const fileId = photo.file_id;

      console.log(`Photo file ID: ${fileId}`);

      // Get file info and download URL
      const file = await this.bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_FIELDWORKER_BOT_TOKEN}/${file.file_path}`;

      console.log(`Photo URL: ${fileUrl}`);

      // Create media object
      const media = {
        fileId: fileId,
        fileUrl: fileUrl,
        mimeType: 'image/jpeg',
        fileName: `photo_${Date.now()}.jpg`
      };

      // Send to agent service with media
      console.log('🤖 Sending photo to agent service...');
      const response = await agentService.processMessage({
        userId: userId,
        userName: userName,
        message: msg.caption || '',
        channel: 'telegram_fieldworker',
        messageId: msg.message_id.toString(),
        media: media,
        location: null
      });

      console.log('✅ Agent response:', response.text.substring(0, 100) + '...');

      // Send response
      await this.sendMessage(chatId, response.text, response.reply_markup);
      console.log('✅ Response sent!');

    } catch (error) {
      console.error('❌ Error handling photo:', error);
      await this.sendMessage(
        msg.chat.id,
        'Sorry, I encountered an error processing your photo. Please try again.'
      );
    }
  }

  /**
   * Handle bot commands
   */
  async handleCommand(chatId, command, userName) {
    try {
      switch (command.toLowerCase()) {
        case '/start':
          await this.sendMessage(
            chatId,
            `👋 Welcome to Field Worker Bot, ${userName}!\n\n` +
            `This bot is for department field workers to submit daily work reports.\n\n` +
            `Commands:\n` +
            `/start - Show this message\n` +
            `/help - Get help\n` +
            `/status - Check your registration status\n\n` +
            `To get started, just say "Hi" or start submitting your daily report!`
          );
          break;

        case '/help':
          await this.sendMessage(
            chatId,
            `📋 Field Worker Bot Help\n\n` +
            `This bot helps you submit daily work reports.\n\n` +
            `How to submit a report:\n` +
            `1. Tell me what work you did\n` +
            `2. Tell me which site/location\n` +
            `3. Tell me how many hours\n` +
            `4. Send a photo as proof\n\n` +
            `The bot will guide you step by step!\n\n` +
            `Need help? Contact your department administrator.`
          );
          break;

        case '/status':
          await this.sendMessage(
            chatId,
            `📊 Checking your status...\n\n` +
            `This feature is coming soon!`
          );
          break;

        default:
          await this.sendMessage(
            chatId,
            `Unknown command. Type /help for available commands.`
          );
      }
    } catch (error) {
      console.error('❌ Error handling command:', error);
    }
  }

  /**
   * Send message to user
   */
  async sendMessage(chatId, text, replyMarkup = null) {
    if (!this.isInitialized) {
      console.error('❌ Field Worker bot not initialized');
      return;
    }

    try {
      const options = {};
      if (replyMarkup) {
        options.reply_markup = replyMarkup;
      }

      await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send notification to field worker
   */
  async sendNotification(userId, message) {
    if (!this.isInitialized) {
      console.error('❌ Field Worker bot not initialized');
      return false;
    }

    try {
      await this.bot.sendMessage(userId, message);
      return true;
    } catch (error) {
      console.error(`❌ Error sending notification to ${userId}:`, error.message);
      return false;
    }
  }
}

export default new TelegramFieldWorkerBotService();
