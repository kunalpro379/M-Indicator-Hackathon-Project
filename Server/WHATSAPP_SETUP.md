# WhatsApp Integration Setup Guide

## Overview
This guide will help you integrate WhatsApp Cloud API with your IGRS Grievance Redressal System using Meta's official WhatsApp Business Platform.

## Architecture
```
User (WhatsApp)
    ↓
Meta WhatsApp Cloud API
    ↓
Your Node Backend (Webhook)
    ↓
Agent Service (Routes to appropriate agent)
    ↓
├─ Progress Tracking Agent (Workers/Contractors)
├─ Query Analyst Agent (Citizens)
└─ DeepSeek LLM (General conversation)
    ↓
PostgreSQL + Azure Blob Storage
    ↓
Response back to WhatsApp
```

## Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Select "Business" as app type
4. Fill in app details:
   - App Name: "IGRS Grievance System"
   - Contact Email: Your email
5. Click "Create App"

## Step 2: Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Select or create a Business Account
4. You'll see the WhatsApp setup page

## Step 3: Get Your Credentials

### Phone Number ID
1. In WhatsApp setup, go to "API Setup"
2. Copy the "Phone number ID" (looks like: `123456789012345`)
3. Add to `.env`:
   ```
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   ```

### Access Token
1. In the same "API Setup" page
2. Copy the temporary access token (starts with `EAA...`)
3. For production, generate a permanent token:
   - Go to "System Users" in Business Settings
   - Create a system user
   - Generate token with `whatsapp_business_messaging` permission
4. Add to `.env`:
   ```
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   ```

### Verify Token
1. Create a secure random string (e.g., `my_secure_verify_token_12345`)
2. Add to `.env`:
   ```
   WHATSAPP_VERIFY_TOKEN=my_secure_verify_token_12345
   ```

## Step 4: Configure Webhook

### Option A: Using ngrok (Development)

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your server:
   ```bash
   npm run dev
   ```

3. In another terminal, start ngrok:
   ```bash
   ngrok http 4000
   ```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

### Option B: Production Server

Use your production domain (e.g., `https://api.igrs.gov.in`)

### Configure in Meta

1. Go to WhatsApp > Configuration
2. Click "Edit" next to Webhook
3. Enter:
   - Callback URL: `https://your-domain.com/api/whatsapp/webhook`
   - Verify Token: Same as `WHATSAPP_VERIFY_TOKEN` in `.env`
4. Click "Verify and Save"
5. Subscribe to webhook fields:
   - ✅ messages
   - ✅ message_status (optional)

## Step 5: Configure DeepSeek API

1. Get DeepSeek API key from [DeepSeek Platform](https://platform.deepseek.com/)
2. Add to `.env`:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
   ```

## Step 6: Configure Agent URLs

If your Python agents are running separately:

```env
PROGRESS_AGENT_URL=http://localhost:8001
QUERY_ANALYST_URL=http://localhost:8002
```

Or if deployed:
```env
PROGRESS_AGENT_URL=https://progress-agent.igrs.gov.in
QUERY_ANALYST_URL=https://query-analyst.igrs.gov.in
```

## Step 7: Update Database

The migration will run automatically when you start the server. It creates:
- `whatsapp_conversations` table
- `whatsapp_media` table
- Adds `phone` column to `users` table

## Step 8: Test the Integration

### Test Webhook Verification
```bash
curl "http://localhost:4000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_12345&hub.challenge=test123"
```
Should return: `test123`

### Send Test Message
1. Open WhatsApp on your phone
2. Send message to your WhatsApp Business number
3. Check server logs for incoming message
4. You should receive a response

## Step 9: Add Users with Phone Numbers

Update your users table to include phone numbers:

```sql
UPDATE users 
SET phone = '+919892885090' 
WHERE id = 1;
```

Phone format: Include country code with `+` (e.g., `+919892885090`)

## Features

### 1. Text Messages
Users can send text messages and get AI-powered responses.

### 2. Image Upload
Workers can send photos as proof of work:
- Take photo in WhatsApp
- Add caption describing the work
- Send to bot

### 3. Document Upload
Send PDFs, reports, or other documents.

### 4. Location Sharing
Citizens can share location when reporting grievances.

### 5. Interactive Buttons
Bot can send buttons for quick replies:
```javascript
await whatsappService.sendButtons(
  phoneNumber,
  'What would you like to do?',
  ['Submit Report', 'Check Status', 'Help']
);
```

### 6. Daily Report Reminders
Automatic reminders sent to workers at 6 PM daily.

### 7. Weekly Summaries
Department heads receive weekly analytics every Friday at 5 PM.

## Scheduled Jobs

### Daily Report Reminders
- Time: 6:00 PM daily
- Recipients: All active workers/contractors
- Customize in `index.js`:
  ```javascript
  whatsappScheduler.startDailyReportReminders(18, 0); // hour, minute
  ```

### Weekly Summaries
- Time: Friday 5:00 PM
- Recipients: Department heads
- Customize in `index.js`:
  ```javascript
  whatsappScheduler.startWeeklySummary(5, 17, 0); // day (0=Sun), hour, minute
  ```

## Message Routing Logic

### Workers/Contractors
- Keywords: "completed", "finished", "progress", "work"
- Routes to: Progress Tracking Agent
- Stores: Work updates, photos, daily reports

### Department Staff
- Keywords: "pending grievances", "report", "analytics"
- Routes to: Department management functions
- Returns: Statistics, pending items, analytics

### Citizens
- Keywords: "complaint", "issue", "problem", "grievance #123"
- Routes to: Query Analyst Agent
- Handles: New grievances, status checks, general queries

## API Endpoints

### Webhook Verification (GET)
```
GET /api/whatsapp/webhook
```

### Receive Messages (POST)
```
POST /api/whatsapp/webhook
```

## Troubleshooting

### Webhook Not Receiving Messages
1. Check ngrok is running (development)
2. Verify webhook URL in Meta dashboard
3. Check server logs for errors
4. Ensure webhook fields are subscribed

### Messages Not Sending
1. Verify `WHATSAPP_ACCESS_TOKEN` is correct
2. Check `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Ensure phone number is in correct format (+country_code)
4. Check Meta app is not in restricted mode

### DeepSeek Not Responding
1. Verify `DEEPSEEK_API_KEY` is valid
2. Check API quota/limits
3. Review error logs

### Agent Not Processing
1. Ensure Python agents are running
2. Check `PROGRESS_AGENT_URL` and `QUERY_ANALYST_URL`
3. Verify network connectivity
4. Check agent logs

## Production Checklist

- [ ] Generate permanent access token (not temporary)
- [ ] Use production domain (not ngrok)
- [ ] Enable HTTPS
- [ ] Set up proper error monitoring
- [ ] Configure rate limiting
- [ ] Set up backup webhook URL
- [ ] Test all message types
- [ ] Test scheduled jobs
- [ ] Set up logging/analytics
- [ ] Configure message templates for notifications
- [ ] Add phone numbers for all users
- [ ] Test with multiple users
- [ ] Set up alerts for webhook failures

## Rate Limits

WhatsApp Cloud API limits (Free tier):
- 1,000 conversations per month
- 250 messages per day per phone number

For production, upgrade to paid tier.

## Security Best Practices

1. Never commit `.env` file
2. Use environment variables for all secrets
3. Validate webhook signatures (implement in production)
4. Sanitize user inputs
5. Implement rate limiting
6. Use HTTPS only
7. Rotate access tokens regularly

## Support

- WhatsApp API Docs: https://developers.facebook.com/docs/whatsapp
- DeepSeek Docs: https://platform.deepseek.com/docs
- Meta Business Help: https://business.facebook.com/help

## Next Steps

1. Test basic text messaging
2. Test image upload from workers
3. Test grievance submission from citizens
4. Configure daily reminders
5. Set up monitoring and alerts
6. Train users on WhatsApp bot usage
7. Create message templates for common scenarios
