# WhatsApp Web Session Fix

## Problem
If you see this error:
```
Protocol error (Runtime.callFunctionOn): Execution context was destroyed
```

This means the WhatsApp Web session is corrupted.

## Solution

### Step 1: Stop the Server
Press `Ctrl+C` to stop the Node.js server.

### Step 2: Delete Session Folder
Delete the `.wwebjs_auth` folder in the Server directory:

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force .wwebjs_auth
```

**Windows (CMD):**
```cmd
rmdir /s /q .wwebjs_auth
```

**Linux/Mac:**
```bash
rm -rf .wwebjs_auth
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Scan QR Code
A new QR code will appear in the terminal. Scan it with WhatsApp on your phone:
1. Open WhatsApp on your phone
2. Go to Settings > Linked Devices
3. Tap "Link a Device"
4. Scan the QR code shown in the terminal

### Step 5: Test
Once you see "✅ WhatsApp Web is ready!", send a test message to the bot.

## Prevention
- Don't stop the server abruptly (use Ctrl+C gracefully)
- Don't delete the `.wwebjs_auth` folder while the server is running
- If you need to restart, wait for the server to fully stop first

## Troubleshooting

### QR Code Not Showing
- Make sure your terminal supports Unicode characters
- Try a different terminal (Windows Terminal, iTerm2, etc.)
- Visit https://web.whatsapp.com and scan manually

### "Authentication Failed"
- Delete `.wwebjs_auth` folder again
- Make sure WhatsApp is updated on your phone
- Try unlinking all devices in WhatsApp settings first

### Messages Not Being Received
- Check if WhatsApp Web shows as "Connected" in your phone
- Restart the server
- Check server logs for errors
