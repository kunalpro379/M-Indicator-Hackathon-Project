# Intelligent WhatsApp Bot Setup

## Overview
The WhatsApp bot uses DeepSeek AI to understand context and intelligently route conversations. It can:
- Detect user type (contractor, field worker, citizen)
- Extract structured information from natural language
- Maintain conversation context
- Provide intelligent responses

## Setup

### 1. Get DeepSeek API Key

1. Visit https://platform.deepseek.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `sk-`)

### 2. Update .env File

Open `Server/.env` and update:
```env
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

### 3. Register Users

#### Register Contractor:
```bash
node scripts/register-contractor.js 918779017300 "Aditya Mhatre"
```

#### Register Field Worker (Department Staff):
```bash
node scripts/register-field-worker.js 919892885090 "Madhuri Iyer" "Water Supply Department"
```

### 4. Test the Bot

Send messages to the WhatsApp bot:

**Example 1: Contractor Registration**
```
User: I am a Contractor
Bot: Hi! I see you're a contractor. To register, please provide:
     1. Company name
     2. License number
     3. GST number
     4. Category (e.g., Civil, Electrical, Plumbing)

User: 1. ABC Construction
      2. LIC-12345
      3. GST-67890
      4. Plumbing
Bot: ✅ Contractor registration initiated!
     Company: ABC Construction
     License: LIC-12345
     GST: GST-67890
     Category: Plumbing
     
     Please upload your license document...
```

**Example 2: Field Worker Daily Report**
```
User: Completed road repair work
Bot: Great! Where was the work done?

User: MG Road, Andheri
Bot: How many hours did you work?

User: 6 hours
Bot: Now please send a photo of your completed work 📸
```

## How It Works

### 1. Intelligent Routing
When a new user messages the bot, the system:
1. Retrieves conversation history
2. Sends context to DeepSeek AI
3. AI analyzes intent and extracts information
4. Routes to appropriate workflow

### 2. Context Understanding
The AI understands:
- User intent (registration, reporting, inquiry)
- User type (contractor, field worker, citizen)
- Structured data (company name, license, GST, etc.)
- Conversation flow

### 3. Data Extraction
The AI can extract:
- Company details from natural language
- Work reports from casual messages
- Contact information
- Dates, times, locations

### 4. Fallback System
If AI fails or API is unavailable:
- Falls back to keyword matching
- Provides basic responses
- Logs error for debugging

## Conversation Examples

### Smart Extraction
```
User: I'm from XYZ Builders, license ABC123, GST 456789, we do electrical work
AI extracts:
- company_name: "XYZ Builders"
- license_number: "ABC123"
- gst: "456789"
- category: "Electrical"
```

### Context Awareness
```
User: I am a Contractor
Bot: Hi! To register, please provide your details...

User: XYZ Builders
Bot: Great! What's your license number?

User: ABC123
Bot: And your GST number?
```

The AI remembers the user said they're a contractor and continues the registration flow.

## Troubleshooting

### Bot Not Understanding Context

**Problem:** Bot keeps sending same message

**Solution:**
1. Check DeepSeek API key is valid
2. Check API quota/limits
3. Look for errors in server logs
4. Verify `.env` file is loaded

### API Errors

**Problem:** "Failed to get response from AI"

**Solutions:**
1. Check internet connection
2. Verify API key is correct
3. Check DeepSeek service status
4. Review API usage limits

### Extraction Not Working

**Problem:** AI not extracting data correctly

**Solutions:**
1. User should provide clearer information
2. Check prompt in `agent.service.js`
3. Adjust temperature parameter (currently 0.3)
4. Add more examples to prompt

## Configuration

### Adjust AI Behavior

Edit `Server/src/services/agent.service.js`:

```javascript
// Make AI more creative (0.0 - 1.0)
temperature: 0.7  // Higher = more creative, Lower = more focused

// Limit response length
max_tokens: 500  // Adjust as needed

// Force JSON responses
response_format: { type: 'json_object' }
```

### Customize Prompts

The system prompt in `handleNewUser()` can be customized to:
- Change tone (formal/casual)
- Add domain-specific knowledge
- Adjust extraction rules
- Add validation logic

## Monitoring

### Check Logs
```bash
# Watch server logs
npm run dev

# Look for:
✅ Agent response: ...  # Successful AI response
❌ Error in intelligent routing: ...  # AI failure
🤖 Sending to agent service...  # Message being processed
```

### Database Queries
```sql
-- Check conversation history
SELECT * FROM whatsapp_conversations 
WHERE user_id = '918779017300' 
ORDER BY created_at DESC;

-- Check contractor registrations
SELECT * FROM contractors 
WHERE phone = '918779017300';

-- Check field worker reports
SELECT * FROM daily_reports 
WHERE user_id = (SELECT id FROM users WHERE phone = '919892885090')
ORDER BY created_at DESC;
```

## Best Practices

1. **Clear Instructions**: Tell users what format to use
2. **Confirmation**: Always confirm extracted data with user
3. **Error Handling**: Provide helpful error messages
4. **Fallback**: Have keyword-based fallback for AI failures
5. **Logging**: Log all AI interactions for debugging
6. **Rate Limiting**: Monitor API usage to avoid quota issues

## Cost Optimization

DeepSeek is cost-effective, but to optimize:
1. Cache common responses
2. Use lower temperature for extraction (0.1-0.3)
3. Limit conversation history (currently 5 messages)
4. Use fallback for simple queries
5. Batch similar requests

## Security

1. **API Key**: Never commit `.env` to git
2. **User Data**: Sanitize before sending to AI
3. **PII**: Don't log sensitive information
4. **Validation**: Always validate AI-extracted data
5. **Rate Limiting**: Prevent abuse with rate limits
