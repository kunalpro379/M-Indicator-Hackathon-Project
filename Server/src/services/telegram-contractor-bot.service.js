import TelegramBot from 'node-telegram-bot-api';
import pool from '../config/database.js';
import contractorAnalysisService from './contractor-analysis.service.js';
import autonomousAIAgent from './autonomous-ai-agent.service.js';

class TelegramContractorBot {
  constructor() {
    this.bot = null;
    this.states = new Map(); // In-memory state storage
    this.conversationHistory = new Map(); // Store conversation context
  }

  initialize() {
    const token = process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN;
    
    if (!token) {
      console.log('⚠️  Telegram Contractor Bot token not configured');
      return;
    }

    // Validate token format
    if (token.includes('your_') || token.length < 20) {
      console.log('⚠️  Invalid Telegram Contractor Bot token - please configure a real token');
      return;
    }

    try {
      this.bot = new TelegramBot(token, { polling: true });
      
      // Add error handler to prevent spam
      this.bot.on('polling_error', (error) => {
        console.error('Telegram Contractor Bot polling error:', error.code);
        // Don't stop polling on temporary errors, only on fatal ones
        if (error.code === 'EFATAL' || (error.code === 'ETELEGRAM' && error.response?.statusCode === 401)) {
          console.log('⚠️  Stopping Telegram Contractor Bot due to persistent errors');
          if (this.bot) {
            this.bot.stopPolling();
            this.bot = null;
          }
        }
      });

      this.setupHandlers();
      console.log('✅ Telegram Contractor Bot initialized');
    } catch (error) {
      console.error('Failed to initialize Telegram Contractor Bot:', error.message);
      this.bot = null;
    }
  }

  setupHandlers() {
    if (!this.bot) return;

    // Start command
    this.bot.onText(/\/start/, (msg) => this.handleStart(msg));

    // Register command
    this.bot.onText(/\/register/, (msg) => this.handleRegister(msg));

    // Status command
    this.bot.onText(/\/status/, (msg) => this.handleStatus(msg));

    // Reset command
    this.bot.onText(/\/reset/, (msg) => this.handleReset(msg));

    // Logout command
    this.bot.onText(/\/logout/, (msg) => this.handleLogout(msg));

    // Handle all messages
    this.bot.on('message', (msg) => this.handleMessage(msg));

    // Handle documents
    this.bot.on('document', (msg) => this.handleDocument(msg));
  }

  async handleStart(msg) {
    if (!this.bot) return;
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const welcomeMessage = `
🏗️ *Welcome to Contractor Registration Portal*

I'll help you register as a contractor for government projects.

*Available Commands:*
/register - Start contractor registration
/status - Check your registration status
/reset - Reset registration and start over
/logout - Clear all data and logout

Let's get started! Use /register to begin.
    `;

    await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
  }

  async handleRegister(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Check if already registered
    const existing = await this.getContractor(userId);
    
    if (existing) {
      await this.bot.sendMessage(
        chatId,
        `You're already registered!\n\nStatus: ${existing.verification_status}\nCompany: ${existing.company_name}`
      );
      return;
    }

    // Initialize registration state
    this.states.set(userId, {
      step: 'company_name',
      data: {}
    });

    await this.bot.sendMessage(
      chatId,
      '📝 Let\'s start your registration!\n\nPlease provide your *Company Name*:',
      { parse_mode: 'Markdown' }
    );
  }

  async handleStatus(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const contractor = await this.getContractor(userId);

    if (!contractor) {
      await this.bot.sendMessage(
        chatId,
        'You are not registered yet. Use /register to start registration.'
      );
      return;
    }

    let statusMessage = `
📊 *Your Registration Status*

Company: ${contractor.company_name}
License: ${contractor.license_number}
Category: ${contractor.category}
Status: *${contractor.verification_status.toUpperCase()}*
    `;

    if (contractor.ai_analysis) {
      statusMessage += `\n\n✅ *AI Analysis Complete*`;
      statusMessage += `\nScore: ${contractor.analysis_score}/100`;
      statusMessage += `\nRecommendation: ${contractor.ai_analysis.final_recommendation}`;
      statusMessage += `\nPriority: ${contractor.ai_analysis.priority_ranking}`;
    }

    await this.bot.sendMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
  }

  async handleReset(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Clear registration state
    this.states.delete(userId);
    this.conversationHistory.delete(userId);

    await this.bot.sendMessage(
      chatId,
      '🔄 Registration reset!\n\nYou can start a fresh registration.\n\nUse /register to begin.'
    );
  }

  async handleLogout(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    // Clear all data
    this.states.delete(userId);
    this.conversationHistory.delete(userId);

    await this.bot.sendMessage(
      chatId,
      '👋 Logged out successfully!\n\nAll your conversation data has been cleared.\n\nTo start again, send /start'
    );
  }

  async handleMessage(msg) {
    if (msg.text?.startsWith('/')) return; // Ignore commands

    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const text = msg.text;

    // Get conversation history
    let history = this.conversationHistory.get(userId) || [];
    history.push({ role: 'user', message: text });
    if (history.length > 10) history = history.slice(-10);
    this.conversationHistory.set(userId, history);

    try {
      // Let autonomous AI handle everything
      const response = await autonomousAIAgent.processMessage({
        userId,
        userName: msg.from.first_name || 'User',
        message: text,
        channel: 'telegram_contractor',
        media: null,
        userContext: null,
        conversationHistory: history
      });

      await this.bot.sendMessage(chatId, response.text, { parse_mode: 'Markdown' });

      // Add bot response to history
      history.push({ role: 'bot', message: response.text });
      this.conversationHistory.set(userId, history);

    } catch (error) {
      console.error('❌ Error handling message:', error);
      await this.bot.sendMessage(
        chatId,
        'Sorry, I encountered an error. Please try again.'
      );
    }
  }

  async handleDocument(msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();
    const state = this.states.get(userId);

    if (!state || state.step !== 'documents') return;

    try {
      // Get file info
      const fileId = msg.document.file_id;
      const file = await this.bot.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_CONTRACTOR_BOT_TOKEN}/${file.file_path}`;

      // Store document URL
      if (!state.data.document_urls) {
        state.data.document_urls = [];
      }
      state.data.document_urls.push(fileUrl);

      await this.bot.sendMessage(
        chatId,
        `✅ Document received! (${state.data.document_urls.length} total)\n\nUpload more or type "done" to finish.`
      );

      this.states.set(userId, state);

    } catch (error) {
      console.error('Error handling document:', error);
      await this.bot.sendMessage(chatId, '❌ Error processing document. Please try again.');
    }
  }

  async completeRegistration(userId, chatId, data) {
    try {
      await this.bot.sendMessage(chatId, '⏳ Processing your registration...');

      // Save to database
      const result = await pool.query(
        `INSERT INTO contractors (
          user_id, company_name, license_number, gst, category,
          experience_years, specializations, certifications,
          document_urls, verification_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id`,
        [
          userId,
          data.company_name,
          data.license_number,
          data.gst,
          data.category,
          data.experience_years,
          data.specializations,
          data.certifications,
          data.document_urls || [],
          'pending_review'
        ]
      );

      const contractorId = result.rows[0].id;

      // Trigger AI analysis
      await this.bot.sendMessage(chatId, '🤖 Running AI analysis on your profile...');
      
      try {
        const analysis = await contractorAnalysisService.analyzeContractor(contractorId);

        await this.bot.sendMessage(
          chatId,
          `✅ *Registration Complete!*\n\n` +
          `Your profile has been analyzed:\n` +
          `Score: ${analysis.score}/100\n` +
          `Recommendation: ${analysis.analysis.final_recommendation}\n` +
          `Priority: ${analysis.analysis.priority_ranking}\n\n` +
          `Our team will review your application shortly.\n\n` +
          `Use /status to check your registration status anytime.`,
          { parse_mode: 'Markdown' }
        );
      } catch (analysisError) {
        console.error('Analysis error:', analysisError);
        await this.bot.sendMessage(
          chatId,
          '✅ Registration complete! Your profile will be analyzed shortly.\n\nUse /status to check your status.'
        );
      }

      // Clear state
      this.states.delete(userId);

    } catch (error) {
      console.error('Error completing registration:', error);
      await this.bot.sendMessage(
        chatId,
        '❌ Error completing registration. Please try again or contact support.'
      );
    }
  }

  async getContractor(userId) {
    const result = await pool.query(
      'SELECT * FROM contractors WHERE user_id = $1',
      [userId]
    );
    return result.rows[0];
  }
}

export default new TelegramContractorBot();
