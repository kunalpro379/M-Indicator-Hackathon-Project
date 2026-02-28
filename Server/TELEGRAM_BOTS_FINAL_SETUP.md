# Telegram Bots - Final Setup

## Two Separate Bots

### 1. Grievance Bot (Citizens)
- **File**: `Server/src/services/telegram.bot.service.js`
- **Token**: `TELEGRAM_BOT_TOKEN` in .env
- **Bot Token**: `8787281903:AAGWrX63lij8U8mZFTm0WOPsZcmyBIjf4rI`
- **Purpose**: Citizens submit grievances with location, description, and photo proof
- **Flow**: Registration → Location → Description → Photo → Azure Storage → Queue to QueryAnalyst

### 2. Field Worker Bot (Department Staff)
- **File**: `Server/src/services/telegram-fieldworker-bot.service.js`
- **Token**: `TELEGRAM_FIELDWORKER_BOT_TOKEN` in .env
- **Bot Token**: `8700077560:AAFVq-_4DtsCQ6erCFNUxweN79aL57uRVG8`
- **Purpose**: Field workers submit daily work reports
- **Flow**: Conversational AI → Description → Site → Hours → Photo → Database

## Environment Variables (.env)

```env
# Telegram Bot for Grievances (Citizens) - Original bot
TELEGRAM_BOT_TOKEN=8787281903:AAGWrX63lij8U8mZFTm0WOPsZcmyBIjf4rI

# Telegram Bot for Field Workers (Department Staff)
TELEGRAM_FIELDWORKER_BOT_TOKEN=8700077560:AAFVq-_4DtsCQ6erCFNUxweN79aL57uRVG8
```

## Initialization (index.js)

```javascript
// Initialize Telegram Bots
(async () => {
  try {
    console.log('\n🔄 Starting Telegram Bots...');
    
    // Initialize Grievance Bot (for citizens) - using telegram.bot.service.js
    console.log('📱 Initializing Grievance Bot...');
    await telegramBot.init();
    
    // Initialize Field Worker Bot (for department staff)
    console.log('👷 Initializing Field Worker Bot...');
    await telegramFieldWorkerBot.initialize();
    
    console.log('✅ Telegram bots initialization complete');
  } catch (error) {
    console.warn('⚠️  Telegram Bot initialization failed:', error.message);
    console.warn('  Server will continue without Telegram bots');
  }
})();
```

## Troubleshooting

### Grievance Bot Not Starting

1. **Check Token**
   ```bash
   # In .env file, verify:
   TELEGRAM_BOT_TOKEN=8787281903:AAGWrX63lij8U8mZFTm0WOPsZcmyBIjf4rI
   ```

2. **Check Console Logs**
   Look for:
   ```
   📱 Initializing Grievance Bot...
   Telegram bot started successfully
   ```

3. **Check for Errors**
   Common errors:
   - "Telegram bot token not provided" → Token missing in .env
   - "Failed to start Telegram bot" → Another instance running
   - "409 Conflict" → Bot already running elsewhere

4. **Restart Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Field Worker Bot Not Starting

1. **Check Token**
   ```bash
   # In .env file, verify:
   TELEGRAM_FIELDWORKER_BOT_TOKEN=8700077560:AAFVq-_4DtsCQ6erCFNUxweN79aL57uRVG8
   ```

2. **Check Console Logs**
   Look for:
   ```
   👷 Initializing Field Worker Bot...
   ✅ Field Worker Telegram bot initialized successfully
   🤖 Field Worker Bot: @your_bot_username
   ```

### Both Bots Not Responding

1. **Check if server is running**
   ```bash
   npm run dev
   ```

2. **Check if bots are initialized**
   Look for success messages in console

3. **Test bot on Telegram**
   - Open Telegram
   - Search for your bot
   - Send `/start`

4. **Check for 409 Conflict**
   - Only one instance can run per bot token
   - Stop all other instances
   - Restart server

## Testing

### Test Grievance Bot
1. Open Telegram
2. Search for bot with token `8787281903:...`
3. Send `/start`
4. Follow registration flow
5. Submit a grievance

### Test Field Worker Bot
1. Open Telegram
2. Search for bot with token `8700077560:...`
3. Send `/start`
4. Say "Hi"
5. Follow conversational flow

## Common Issues

### Issue: "Telegram bot token not provided"
**Solution**: Add `TELEGRAM_BOT_TOKEN` to .env file

### Issue: "Failed to start Telegram bot: 409 Conflict"
**Solution**: 
- Stop all running instances
- Check if bot is running elsewhere
- Restart server

### Issue: Bot not responding to messages
**Solution**:
- Check if server is running
- Check console for errors
- Verify bot token is correct
- Try `/start` command

### Issue: Photo upload stuck
**Solution**:
- Check Azure Storage connection string
- Check console for upload errors
- Verify file size is under 10MB

## Files Structure

```
Server/
├── src/
│   └── services/
│       ├── telegram.bot.service.js          # Grievance bot (IGRS Portal)
│       └── telegram-fieldworker-bot.service.js  # Field worker bot
├── .env                                      # Environment variables
└── index.js                                  # Bot initialization
```

## Success Indicators

When both bots start successfully, you should see:

```
🔄 Starting Telegram Bots...
📱 Initializing Grievance Bot...
Telegram bot started successfully
👷 Initializing Field Worker Bot...
✅ Field Worker Telegram bot initialized successfully
🤖 Field Worker Bot: @your_fieldworker_bot
✅ Telegram bots initialization complete
```

## Next Steps

1. Restart server: `npm run dev`
2. Check console for success messages
3. Test both bots on Telegram
4. If issues persist, share console error messages
