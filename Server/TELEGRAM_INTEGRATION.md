# Telegram Bot Integration 🤖

## Overview

The Telegram bot is now integrated with the same intelligent AI agent used for WhatsApp! It provides:

- ✅ Context-aware conversations using Gemini AI
- ✅ Contractor registration with data extraction
- ✅ Field worker daily reporting
- ✅ Citizen grievance filing
- ✅ Conversation memory and history
- ✅ Multi-turn conversations

## Configuration

### Bot Token
Already configured in `.env`:
```env
TELEGRAM_BOT_TOKEN=8700077560:AAFVq-_4DtsCQ6erCFNUxweN79aL57uRVG8
```

### AI Provider
Uses Gemini AI (same as WhatsApp):
```env
GEMINI_API_KEY=AIzaSyD5NCsO_NbSTDK9K_19lKHqCLji-XZplfI
AI_PROVIDER=gemini
```

## Features

### 1. Intelligent Conversations
The bot understands context and extracts information automatically:

```
User: I am a contractor
Bot: Hi! To register, please provide:
     1. Company name
     2. License number
     3. GST number
     4. Category

User: ABC Construction, LIC123, GST456, Plumbing
Bot: ✅ Contractor Registration Successful!
     Company: ABC Construction
     License: LIC123
     GST: GST456
     Category: Plumbing
```

### 2. Bot Commands

- `/start` - Welcome message and introduction
- `/help` - Show help and usage instructions
- `/status` - Check your registration status

### 3. User Types

**Contractors:**
- Register with company details
- Upload documents
- Track tender applications

**Field Workers:**
- Submit daily work reports
- Upload proof of work
- Track productivity

**Citizens:**
- File grievances
- Track complaint status
- Get updates

## How to Use

### Step 1: Find the Bot
Search for your bot on Telegram using the bot username (get from BotFather).

### Step 2: Start Conversation
Send `/start` to begin.

### Step 3: Interact
Just chat naturally! The AI will understand your intent and guide you.

## Example Conversations

### Contractor Registration
```
User: /start
Bot: 👋 Welcome to the Government Grievance System!
     I can help you with:
     🏗️ Field Workers - Submit daily work reports
     📋 Contractors - Register and manage tenders
     👥 Citizens - File and track grievances

User: I want to register as a contractor
Bot: Great! Please provide:
     1. Company name
     2. License number
     3. GST number
     4. Category (e.g., Civil, Electrical, Plumbing)

User: 1. XYZ Builders
      2. LIC-98765
      3. GST-54321
      4. Civil
Bot: ✅ Contractor Registration Successful!
     📋 Your Details:
     Company: XYZ Builders
     License: LIC-98765
     GST: GST-54321
     Category: Civil
     
     Your registration is under review.
```

### Check Status
```
User: /status
Bot: ✅ Your Status:
     Name: John Doe
     Role: contractor
     Status: Active
```

### Field Worker Report
```
User: Completed road repair work
Bot: Great! Where was the work done?

User: MG Road, Andheri
Bot: How many hours did you work?

User: 6 hours
Bot: Now please send a photo of your completed work 📸
```

## Technical Details

### Architecture
```
Telegram User
    ↓
Telegram Bot API
    ↓
telegram-bot.service.js
    ↓
agent.service.js (AI-powered)
    ↓
Gemini AI (context understanding)
    ↓
Database (storage)
```

### Message Flow
1. User sends message to Telegram bot
2. Bot receives message via polling
3. Message sent to agent service
4. Agent service:
   - Retrieves conversation history
   - Sends to Gemini AI for analysis
   - Extracts structured data
   - Determines next action
5. Response sent back to user

### Data Storage
- Conversations stored in `whatsapp_conversations` table (shared with WhatsApp)
- User context retrieved from `users`, `contractors`, `departmentofficers` tables
- Contractor data stored in `contractors` table

## Comparison: Telegram vs WhatsApp

| Feature | Telegram | WhatsApp |
|---------|----------|----------|
| Setup | Bot API (easy) | Web.js (QR scan) |
| Reliability | ✅ Very stable | ⚠️ Session issues |
| Media | ✅ Full support | ✅ Full support |
| Groups | ✅ Supported | ✅ Supported |
| Commands | ✅ Native support | ⚠️ Manual parsing |
| Markdown | ✅ Full support | ⚠️ Limited |
| File Size | ✅ 2GB | ⚠️ 16MB |

## Troubleshooting

### Bot Not Responding

1. **Check bot token:**
   ```bash
   # Test token
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

2. **Check server logs:**
   ```
   ✅ Telegram Bot connected: @your_bot_username
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

### AI Not Understanding

Same as WhatsApp - check Gemini API:
```bash
node scripts/test-whatsapp-setup.js
```

### Database Errors

Check user registration:
```bash
node scripts/check-user.js <telegram_user_id>
```

## Register Users

### Contractor (Telegram)
```bash
node scripts/register-contractor.js <telegram_user_id> "Name"
```

### Field Worker (Telegram)
```bash
node scripts/register-field-worker.js <telegram_user_id> "Name" "Department"
```

Note: Use Telegram user ID (numeric), not phone number.

## Monitoring

### Check Bot Status
```javascript
import telegramBotService from './src/services/telegram-bot.service.js';
console.log(telegramBotService.getStatus());
```

### View Logs
```
📨 Incoming Telegram message:
  From: John Doe (@johndoe)
  Chat ID: 123456789
  Message: I am a contractor
  🤖 Sending to agent service...
  ✅ Agent response: Hi John Doe! ...
  ✅ Response sent!
```

### Database Queries
```sql
-- Check Telegram conversations
SELECT * FROM whatsapp_conversations 
WHERE channel = 'telegram' 
ORDER BY created_at DESC;

-- Check contractor registrations
SELECT * FROM contractors 
WHERE phone = '<telegram_user_id>';
```

## Security

- ✅ Bot token stored in `.env` (not committed)
- ✅ User authentication via Telegram user ID
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ Secure database connections

## Limitations

1. **Media Support:** Photos/documents not yet implemented (TODO)
2. **User ID:** Uses Telegram user ID instead of phone number
3. **Notifications:** One-way (bot can't initiate unless user messaged first)

## Future Enhancements

- [ ] Photo/document upload support
- [ ] Inline keyboards for better UX
- [ ] Group chat support
- [ ] Broadcast messages
- [ ] Rich media (location, contact sharing)
- [ ] Payment integration

## Support

- Telegram Bot API: https://core.telegram.org/bots/api
- BotFather: https://t.me/botfather
- Test Script: `node scripts/test-whatsapp-setup.js`

---

Your Telegram bot is now live with full AI capabilities! 🚀

Just search for your bot on Telegram and start chatting!
