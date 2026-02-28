# Two Telegram Bots Setup

## Overview
The system now has TWO separate Telegram bots with different purposes:

### 1. Grievance Bot (Citizens)
- **Token**: `TELEGRAM_GRIEVANCE_BOT_TOKEN`
- **Purpose**: Citizens file grievances/complaints
- **Flow**: Messages → Azure Queue → QueryAnalyst Agent (Python)
- **No AI Agent**: Direct queue-based processing (original flow)
- **File**: `telegram-grievance-bot.service.js`

### 2. Field Worker Bot (Department Staff)
- **Token**: `TELEGRAM_FIELDWORKER_BOT_TOKEN`
- **Purpose**: Field workers submit daily work reports
- **Flow**: Messages → AI Agent Service → Conversational workflow
- **With AI Agent**: Smart conversational bot for work reports
- **File**: `telegram-fieldworker-bot.service.js`

## Configuration

### Environment Variables (.env)
```env
# Grievance Bot (for citizens)
TELEGRAM_GRIEVANCE_BOT_TOKEN=8787281903:AAGWrX63lij8U8mZFTm0WOPsZcmyBIjf4rI

# Field Worker Bot (for department staff)
TELEGRAM_FIELDWORKER_BOT_TOKEN=8700077560:AAFVq-_4DtsCQ6erCFNUxweN79aL57uRVG8

# Azure Queue for Grievances
AZURE_QUEUE_QUERYANALYST_CONNECTION_STRING=...
AZURE_QUEUE_QUERYANALYST_NAME=queryanalyst
```

## Bot Behaviors

### Grievance Bot (Citizens)
```
User: "Water supply issue in my area"
Bot: ✅ Thank you for your message!
     Your grievance has been received and will be processed shortly.
     You will receive updates on the status of your complaint.

[Message queued to Azure → QueryAnalyst processes it]
```

**Features**:
- Accept text complaints
- Accept photos as evidence
- Accept location sharing
- Queue to Azure for processing
- No conversational AI

### Field Worker Bot (Department Staff)
```
User: "Hi"
Bot: Hi! Ready to submit your daily work report?
     Let's start: What work did you do today?

User: "Fixed water pipes"
Bot: Got it! 📝
     Work: Fixed water pipes
     Which site or location did you work at?

User: "Kansai section"
Bot: Perfect! 📍
     Site: Kansai section
     How many hours did you work?

[Conversational flow continues...]
```

**Features**:
- Conversational AI workflow
- Step-by-step questions
- State management
- Photo analysis
- Daily report submission

## How to Get Bot Tokens

### Create New Bot
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to create bot
4. Copy the token

### For Grievance Bot
```
Bot Name: IGRS Grievance Bot
Username: igrs_grievance_bot
Description: File and track your grievances
```

### For Field Worker Bot
```
Bot Name: IGRS Field Worker Bot
Username: igrs_fieldworker_bot
Description: Submit daily work reports
```

## Starting the Bots

Both bots start automatically when you run:
```bash
npm start
```

You'll see:
```
🔄 Starting Telegram Bots...
📱 Initializing Grievance Bot...
✅ Telegram Grievance Bot connected: @igrs_grievance_bot
👷 Initializing Field Worker Bot...
✅ Field Worker Bot connected: @igrs_fieldworker_bot
✅ Telegram bots initialization complete
```

## Testing

### Test Grievance Bot
1. Open Telegram
2. Search for your grievance bot
3. Send `/start`
4. Type a complaint: "Water supply issue"
5. Check Azure Queue for the message

### Test Field Worker Bot
1. Open Telegram
2. Search for your field worker bot
3. Send `/start`
4. Follow the conversational flow
5. Check database for saved state

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Telegram Platform                     │
└─────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐  ┌─────▼──────────────┐
        │  Grievance Bot       │  │ Field Worker Bot   │
        │  (Citizens)          │  │ (Dept Staff)       │
        └───────────┬──────────┘  └─────┬──────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐  ┌─────▼──────────────┐
        │  Azure Queue         │  │ AI Agent Service   │
        │  (queryanalyst)      │  │ (Conversational)   │
        └───────────┬──────────┘  └─────┬──────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐  ┌─────▼──────────────┐
        │  QueryAnalyst        │  │ PostgreSQL DB      │
        │  (Python Agent)      │  │ (State Storage)    │
        └──────────────────────┘  └────────────────────┘
```

## Key Differences

| Feature | Grievance Bot | Field Worker Bot |
|---------|---------------|------------------|
| Users | Citizens | Department Staff |
| Purpose | File complaints | Daily reports |
| AI | No | Yes |
| Flow | Queue-based | Conversational |
| State | Stateless | Stateful |
| Processing | Async (Python) | Sync (Node.js) |
| Photos | Evidence | Proof of work |
| Location | Complaint location | Work site |

## Troubleshooting

### Grievance Bot Not Working
1. Check `TELEGRAM_GRIEVANCE_BOT_TOKEN` in .env
2. Verify Azure Queue connection
3. Check QueryAnalyst Python worker is running

### Field Worker Bot Not Working
1. Check `TELEGRAM_FIELDWORKER_BOT_TOKEN` in .env
2. Verify database connection
3. Check `field_worker_states` table exists
4. Look for state loading/saving logs

### Both Bots Not Starting
1. Check both tokens are valid
2. Run `npm start` and check logs
3. Verify no port conflicts
4. Check network/firewall settings
