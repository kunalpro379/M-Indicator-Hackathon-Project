# WhatsApp Bot - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Fix WhatsApp Session
```powershell
# Stop server (Ctrl+C if running)
Remove-Item -Recurse -Force .wwebjs_auth
npm run dev
# Scan QR code when it appears
```

### 2. Get DeepSeek API Key
1. Visit: https://platform.deepseek.com/
2. Sign up / Log in
3. Create API key
4. Copy the key (starts with `sk-`)

### 3. Update .env File
Open `Server/.env` and replace:
```env
DEEPSEEK_API_KEY=sk-your-actual-api-key-here
```

### 4. Test Everything
```bash
node scripts/test-whatsapp-setup.js
```

### 5. Register Contractor
```bash
node scripts/register-contractor.js 918779017300 "Aditya Mhatre"
```

### 6. Test Bot
Send WhatsApp message to bot:
```
I am a Contractor
```

Bot should respond intelligently! 🎉

---

## 📝 Common Commands

### Register Users
```bash
# Contractor
node scripts/register-contractor.js <phone> <name>

# Field Worker (Department Staff)
node scripts/register-field-worker.js <phone> <name> <department>
```

### Test & Debug
```bash
# Test setup
node scripts/test-whatsapp-setup.js

# Check user
node scripts/check-user.js <phone>

# Check comments
node scripts/check-comments.js
```

### Server
```bash
# Start server
npm run dev

# Stop server
Ctrl+C
```

---

## 🔧 Troubleshooting

### Session Error?
```powershell
Remove-Item -Recurse -Force .wwebjs_auth
npm run dev
```

### Bot Not Understanding?
1. Check API key in `.env`
2. Run: `node scripts/test-whatsapp-setup.js`
3. Check server logs

### Database Issues?
```bash
node scripts/check-user.js 918779017300
```

---

## 📚 Full Documentation

- **Session Issues:** `WHATSAPP_SESSION_FIX.md`
- **Intelligent Bot:** `INTELLIGENT_BOT_SETUP.md`
- **All Fixes:** `WHATSAPP_BOT_FIXES.md`

---

## ✅ Checklist

- [ ] WhatsApp session working (QR scanned)
- [ ] DeepSeek API key configured
- [ ] Test script passes
- [ ] Contractor registered
- [ ] Bot responds intelligently

---

## 🎯 Expected Behavior

### Smart Conversation:
```
User: I am a Contractor
Bot: Hi! To register, please provide your details...

User: ABC Construction, LIC123, GST456, Plumbing
Bot: ✅ Registration initiated!
     Company: ABC Construction
     License: LIC123
     GST: GST456
     Category: Plumbing
```

### Context Understanding:
```
User: I'm a contractor
Bot: Great! What's your company name?

User: XYZ Builders
Bot: And your license number?

User: ABC123
Bot: GST number?
```

The bot remembers context and continues the conversation naturally!

---

## 🆘 Need Help?

1. Read the error message in terminal
2. Check relevant documentation file
3. Run test script
4. Check server logs
5. Verify database records

Everything is set up for intelligent WhatsApp conversations! 🚀
