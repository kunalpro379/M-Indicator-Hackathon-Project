# How to Get DeepSeek API Key

## Why You Need This
The WhatsApp bot uses DeepSeek AI to:
- Understand conversation context
- Extract structured information (company name, license, GST, etc.)
- Provide intelligent responses
- Remember conversation history

Without a valid API key, the bot falls back to simple keyword matching and can't remember context.

## Step-by-Step Guide

### 1. Visit DeepSeek Platform
Go to: **https://platform.deepseek.com/**

### 2. Sign Up / Log In
- Click "Sign Up" if you're new
- Or "Log In" if you have an account
- You can use email or social login

### 3. Navigate to API Keys
- After logging in, look for "API Keys" in the menu
- Or go directly to: https://platform.deepseek.com/api_keys

### 4. Create New API Key
- Click "Create API Key" button
- Give it a name (e.g., "WhatsApp Bot")
- Click "Create"

### 5. Copy the Key
- The key will be shown ONCE
- It starts with `sk-`
- Copy it immediately (you can't see it again)
- Example format: `sk-abc123def456...`

### 6. Update .env File
Open `Server/.env` and replace:
```env
DEEPSEEK_API_KEY=your_deepseek_api_key
```

With your actual key:
```env
DEEPSEEK_API_KEY=sk-abc123def456...
```

### 7. Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### 8. Test It
```bash
node scripts/test-whatsapp-setup.js
```

You should see:
```
✅ DeepSeek API is working
📝 Response: "Hello"
```

## Pricing

DeepSeek is very affordable:
- **Free tier**: Usually includes some free credits
- **Pay-as-you-go**: Very cheap compared to other AI APIs
- **Cost per message**: Typically less than $0.001 per conversation

For a WhatsApp bot with moderate usage, expect $1-5 per month.

## Troubleshooting

### "Invalid API Key" Error
- Make sure you copied the entire key
- Key should start with `sk-`
- No spaces before or after the key
- Check if you have credits/quota remaining

### "Rate Limit Exceeded"
- You've hit the free tier limit
- Add payment method to continue
- Or wait for the limit to reset

### "Network Error"
- Check your internet connection
- DeepSeek servers might be down (rare)
- Try again in a few minutes

## Alternative: Use Without AI (Not Recommended)

If you can't get a DeepSeek key right now, the bot will work with basic keyword matching:
- User says "contractor" → Bot asks for details
- User says "field worker" → Bot asks for registration
- But it WON'T extract information intelligently
- And it WON'T remember context

This is why you see the bot asking the same questions repeatedly.

## Security

- **Never commit** your API key to git
- **Never share** your API key publicly
- **Rotate keys** regularly for security
- The `.env` file is in `.gitignore` (safe)

## Need Help?

1. Check DeepSeek documentation: https://platform.deepseek.com/docs
2. Run test script: `node scripts/test-whatsapp-setup.js`
3. Check server logs for detailed errors
4. Make sure `.env` file is saved after editing

---

Once you have the API key set up, the bot will be fully intelligent and remember all conversations! 🚀
