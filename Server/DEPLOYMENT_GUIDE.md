# 🚀 Deployment Guide - Field Worker & Contractor System

## ✅ Pre-Deployment Checklist

- [ ] Meta WhatsApp Business Account created
- [ ] DeepSeek API key obtained
- [ ] PostgreSQL database provisioned
- [ ] Azure Blob Storage configured
- [ ] Domain/server ready (or ngrok for testing)
- [ ] Environment variables configured

## 📋 Step-by-Step Deployment

### 1. Database Setup

```bash
# Run migrations
npm run dev  # Migrations run automatically on startup
```

This creates:
- `users` table (with field_worker, contractor roles)
- `daily_reports` table
- `contractors` table
- `field_worker_states` table
- `contractor_states` table
- `whatsapp_conversations` table

### 2. Create Test Users

```sql
-- Field Worker
INSERT INTO users (id, phone, username, role, is_active)
VALUES (
  gen_random_uuid(),
  '+919892885090',
  'field_worker_1',
  'field_worker',
  true
);

-- Contractor
INSERT INTO users (id, phone, username, role, is_active)
VALUES (
  gen_random_uuid(),
  '+919876543210',
  'contractor_1',
  'contractor',
  true
);
```

### 3. Configure Environment

Update `.env`:
```env
# WhatsApp (from Meta Dashboard)
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=my_secure_token_12345

# DeepSeek
DEEPSEEK_API_KEY=your_deepseek_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# Database (already configured)
DATABASE_URL=postgresql://...

# Azure (already configured)
AZURE_STORAGE_CONNECTION_STRING=...
AZURE_STORAGE_CONTAINER_NAME=igrs
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

### 5. Expose Webhook

#### Option A: Development (ngrok)
```bash
ngrok http 4000
# Copy HTTPS URL: https://abc123.ngrok.io
```

#### Option B: Production
Use your domain: `https://api.yourdomain.com`

### 6. Configure Meta Webhook

1. Go to https://developers.facebook.com/apps
2. Select your app → WhatsApp → Configuration
3. Click "Edit" next to Webhook
4. Enter:
   - Callback URL: `https://your-domain.com/api/whatsapp/webhook`
   - Verify Token: Same as `WHATSAPP_VERIFY_TOKEN` in .env
5. Click "Verify and Save"
6. Subscribe to webhook fields:
   - ✅ messages

### 7. Test the System

```bash
# Test WhatsApp integration
npm run test:whatsapp

# Or send WhatsApp message
# From field worker phone: "Completed road work today"
# From contractor phone: "My company is ABC Construction"
```

## 🧪 Testing Workflows

### Test Field Worker Flow

1. **Send initial message**:
   ```
   "Repaired road on MG Road"
   ```

2. **Bot asks for hours**:
   ```
   "How many hours did you work today?"
   ```

3. **Reply**:
   ```
   "6 hours"
   ```

4. **Bot requests proof**:
   ```
   "Now please send a photo of your completed work."
   ```

5. **Send photo** (any image)

6. **Bot confirms**:
   ```
   "✅ Report submitted successfully!
   📊 Productivity Score: 8.5/10"
   ```

### Test Contractor Flow

1. **Send initial message**:
   ```
   "I want to register as a contractor"
   ```

2. **Bot asks for company name**:
   ```
   "What is your company name?"
   ```

3. **Reply**:
   ```
   "ABC Construction Pvt Ltd"
   ```

4. **Bot asks for license**:
   ```
   "What is your contractor license number?"
   ```

5. **Reply**:
   ```
   "LIC-2024-12345"
   ```

6. **Continue with GST and category**

7. **Upload license document** (any image/PDF)

8. **Bot confirms**:
   ```
   "✅ Application submitted successfully!"
   ```

## 📊 Verify Database

```sql
-- Check field worker reports
SELECT * FROM daily_reports ORDER BY created_at DESC LIMIT 5;

-- Check contractor applications
SELECT * FROM contractors ORDER BY created_at DESC LIMIT 5;

-- Check conversation history
SELECT * FROM whatsapp_conversations ORDER BY created_at DESC LIMIT 10;
```

## 🔧 Troubleshooting

### Webhook Not Receiving Messages

**Check:**
1. Server is running: `curl http://localhost:4000/health`
2. ngrok is running (dev): `curl https://your-ngrok-url.ngrok.io/health`
3. Webhook URL is correct in Meta dashboard
4. Webhook fields are subscribed

**Test webhook verification:**
```bash
curl "http://localhost:4000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_token_12345&hub.challenge=test123"
# Should return: test123
```

### Messages Not Sending

**Check:**
1. `WHATSAPP_ACCESS_TOKEN` is correct
2. `WHATSAPP_PHONE_NUMBER_ID` is correct
3. Phone number format: `+919892885090` (with country code)
4. Meta app is not in restricted mode

**Test manually:**
```bash
npm run test:whatsapp
```

### DeepSeek Not Responding

**Check:**
1. `DEEPSEEK_API_KEY` is valid
2. API quota/limits
3. Network connectivity

**Test:**
```bash
curl https://api.deepseek.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Database Errors

**Check:**
1. `DATABASE_URL` is correct
2. Database is accessible
3. Migrations ran successfully

**Re-run migrations:**
```bash
npm run dev  # Migrations run on startup
```

### Blob Upload Errors

**Check:**
1. `AZURE_STORAGE_CONNECTION_STRING` is correct
2. Container `igrs` exists
3. Storage account is accessible

## 🔄 Daily Reminders

Reminders are sent automatically at 6 PM daily to all field workers who haven't submitted reports.

**Customize timing** in `index.js`:
```javascript
// Change to 8 PM
whatsappScheduler.startDailyReportReminders(20, 0);
```

**Trigger manually** (for testing):
```bash
curl -X POST http://localhost:4000/api/whatsapp-admin/trigger-daily-reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Monitoring

### Check System Health
```bash
curl http://localhost:4000/health
```

### Check Statistics
```bash
curl http://localhost:4000/api/whatsapp-admin/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### View Logs
```bash
# Development
npm run dev  # Logs to console

# Production
pm2 logs igrs-server
```

## 🚀 Production Deployment

### Option 1: Railway

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Add environment variables in Railway dashboard

4. Get deployment URL and configure Meta webhook

### Option 2: Render

1. Connect GitHub repo to Render
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

### Option 3: VPS (DigitalOcean, AWS, etc.)

1. SSH into server
2. Install Node.js 18+
3. Clone repository
4. Install dependencies: `npm install`
5. Install PM2: `npm install -g pm2`
6. Start server: `pm2 start index.js --name igrs-server`
7. Setup nginx reverse proxy
8. Configure SSL with Let's Encrypt

## 🔐 Security Hardening

### Production Checklist

- [ ] Use permanent access token (not temporary)
- [ ] Enable HTTPS only
- [ ] Implement webhook signature verification
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables (never commit secrets)
- [ ] Set up monitoring/alerts
- [ ] Regular security audits
- [ ] Backup database daily
- [ ] Rotate API keys quarterly

### Webhook Signature Verification

Add to `whatsapp.controller.js`:
```javascript
import crypto from 'crypto';

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET)
    .update(payload)
    .digest('hex');
  
  return signature === `sha256=${hash}`;
}
```

## 📊 Performance Optimization

### Database Indexes
Already created:
- `idx_daily_reports_user_date`
- `idx_daily_reports_date`
- `idx_contractors_status`
- `idx_contractors_user`

### Caching (Future)
```javascript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Cache user context
await redis.setex(`user:${phone}`, 3600, JSON.stringify(userContext));
```

### Message Queue (Future)
```javascript
import Queue from 'bull';
const messageQueue = new Queue('whatsapp-messages', process.env.REDIS_URL);

messageQueue.process(async (job) => {
  await processMessage(job.data);
});
```

## 🎉 You're Live!

Your system is now deployed and ready to handle:
- ✅ Field worker daily reports
- ✅ Contractor onboarding
- ✅ Automated reminders
- ✅ Proof validation
- ✅ Document verification

**Next Steps:**
1. Add more field workers and contractors
2. Monitor system performance
3. Collect feedback
4. Iterate and improve

## 📞 Support

- WhatsApp API Docs: https://developers.facebook.com/docs/whatsapp
- DeepSeek Docs: https://platform.deepseek.com/docs
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Azure Blob Docs: https://docs.microsoft.com/azure/storage/blobs/

## 🔥 Quick Commands Reference

```bash
# Start development server
npm run dev

# Start production server
npm start

# Test WhatsApp integration
npm run test:whatsapp

# Check health
curl http://localhost:4000/health

# Trigger daily reminders (manual)
curl -X POST http://localhost:4000/api/whatsapp-admin/trigger-daily-reports

# View logs (PM2)
pm2 logs igrs-server

# Restart server (PM2)
pm2 restart igrs-server
```

🚀 **Happy Deploying!**
