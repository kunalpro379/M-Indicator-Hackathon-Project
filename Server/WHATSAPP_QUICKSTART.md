# WhatsApp Integration - Quick Start

## 🚀 5-Minute Setup

### 1. Update .env
```env
# Your credentials from Meta
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=xly205dvJID4RHVWbuk4umwVVZPesbeb
WHATSAPP_VERIFY_TOKEN=my_secure_verify_token_12345

# DeepSeek (optional for AI chat)
DEEPSEEK_API_KEY=your_key_here

# Agent URLs (if running separately)
PROGRESS_AGENT_URL=http://localhost:8001
QUERY_ANALYST_URL=http://localhost:8002
```

### 2. Start Server
```bash
npm run dev
```

### 3. Expose Webhook (Development)
```bash
# In another terminal
ngrok http 4000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### 4. Configure Meta Webhook
1. Go to: https://developers.facebook.com/apps
2. Select your app → WhatsApp → Configuration
3. Click "Edit" next to Webhook
4. Enter:
   - URL: `https://abc123.ngrok.io/api/whatsapp/webhook`
   - Verify Token: `my_secure_verify_token_12345`
5. Click "Verify and Save"
6. Subscribe to: `messages`

### 5. Test It!
```bash
npm run test:whatsapp
```

Or send a WhatsApp message to your business number!

## 📱 How It Works

### For Workers/Contractors
Send: "Completed road repair work today"
Bot: Processes through Progress Tracking Agent

### For Citizens
Send: "I want to report a pothole issue"
Bot: Creates grievance through Query Analyst

### For Department Staff
Send: "Show pending grievances"
Bot: Returns list of pending items

## 🔧 Key Files

- `src/routes/whatsapp.routes.js` - Webhook endpoints
- `src/controllers/whatsapp.controller.js` - Message handling
- `src/services/whatsapp.service.js` - WhatsApp API calls
- `src/services/agent.service.js` - AI agent routing
- `src/services/whatsapp.scheduler.js` - Daily reminders

## 📅 Scheduled Features

### Daily Reports (6 PM)
Sends reminder to all workers:
```
Hi [Name]! 👋

Time for your daily progress report.

Please share:
1. Work completed today
2. Any challenges faced
3. Photos/proof of work (optional)
```

### Weekly Summaries (Friday 5 PM)
Sends analytics to department heads:
```
📊 Weekly Summary - [Department]

Total Grievances: 45
✅ Resolved: 30
🔄 In Progress: 10
⏳ Pending: 5

Resolution Rate: 66.7%
```

## 🎯 Message Types Supported

- ✅ Text messages
- ✅ Images (proof of work)
- ✅ Documents (PDFs, reports)
- ✅ Location (for grievances)
- ✅ Interactive buttons
- ✅ Lists

## 🐛 Troubleshooting

### Webhook not working?
```bash
# Check if server is running
curl http://localhost:4000/health

# Test webhook verification
curl "http://localhost:4000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_12345&hub.challenge=test"
```

### Messages not sending?
- Check `WHATSAPP_ACCESS_TOKEN` is correct
- Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure phone format: `+919892885090` (with country code)

### DeepSeek not responding?
- Check `DEEPSEEK_API_KEY` is valid
- Verify API quota

## 📚 Full Documentation

See `WHATSAPP_SETUP.md` for complete setup guide.

## 🎉 You're Ready!

Your WhatsApp bot is now connected to:
- DeepSeek LLM for AI conversations
- Progress Tracking Agent for worker reports
- Query Analyst for citizen grievances
- PostgreSQL for data storage
- Azure Blob for file storage

Send a message to your WhatsApp Business number to test!
