# WhatsApp Department Staff Integration Guide

## Overview

This guide explains how to set up WhatsApp integration for department staff members (field workers). The system authenticates users based on their phone number and verifies they are registered in the `departmentofficers` table before allowing interactions.

## Architecture

```
WhatsApp Message → Webhook → WhatsApp Controller → Agent Service → Staff Verification → Daily Report Workflow
```

## Authentication Flow

1. **Staff member sends message via WhatsApp**
2. **System receives phone number** (e.g., +919876543210)
3. **Lookup in users table** by phone number
4. **Verify user is in departmentofficers table** (has staff_id)
5. **Check status** is 'active' in both tables
6. **Route to daily reporting workflow**

## Database Structure

### Existing Tables Used

**users** - Main user accounts
```sql
- id (UUID)
- phone (VARCHAR) - Used for WhatsApp authentication
- full_name (VARCHAR)
- role (ENUM) - Must be 'department_officer' or 'department_head'
- status (VARCHAR) - Must be 'active'
- department_id (UUID)
```

**departmentofficers** - Department staff members
```sql
- user_id (UUID) - References users.id
- department_id (UUID)
- staff_id (VARCHAR) - Unique staff identifier
- role (VARCHAR) - Staff role (Plumber, Electrician, etc.)
- zone (VARCHAR)
- ward (VARCHAR)
- status (VARCHAR) - Must be 'available' or 'busy'
- specialization (VARCHAR)
- workload (INTEGER)
```

**daily_reports** - Created by migration for WhatsApp reports
```sql
- id (UUID)
- user_id (VARCHAR) - References users.id
- date (DATE)
- description (TEXT)
- site (TEXT)
- hours (INTEGER)
- blockers (TEXT)
- proof_urls (TEXT[])
- proof_verified (BOOLEAN)
- productivity_score (FLOAT)
- created_at (TIMESTAMP)
```


## Setup Instructions

### 1. Database Migration

The migration creates the `daily_reports` table for WhatsApp submissions:

```bash
# Runs automatically on server start
# Or check manually:
node -e "import('./src/migrations/create_worker_contractor_tables.js').then(m => m.default())"
```

### 2. Add Phone Numbers to Staff

Department staff must have phone numbers in the users table:

```bash
node scripts/register-field-worker.js
```

This script will:
- Check if a phone number is registered
- Show existing staff members
- Allow you to update phone numbers for staff

**Manual SQL Update:**
```sql
UPDATE users 
SET phone = '+919876543210' 
WHERE id = 'user-uuid-here';
```

### 3. Fix Existing User Data (if needed)

If you have orphaned comments or missing user entries:

```bash
node scripts/fix-user-sync.js
```

### 4. Configure WhatsApp

Ensure your `.env` has:

```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
WHATSAPP_API_VERSION=v18.0
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
DEEPSEEK_API_KEY=your_deepseek_key
```

## Daily Reporting Workflow

### Purpose
Department staff members submit daily progress reports via WhatsApp

### Workflow Steps

1. **Staff sends message describing work**
   ```
   "Repaired water pipe on MG Road, worked 6 hours"
   ```

2. **System extracts structured data**
   - Site/Location
   - Hours worked
   - Work description
   - Blockers (optional)

3. **System requests missing information**
   ```
   Bot: "Which site/location did you work at?"
   Staff: "MG Road, Zone A, Ward 1"
   ```

4. **Staff uploads proof photo**
   ```
   Bot: "Great! Now please send a photo of your completed work. 📸"
   Staff: [sends photo]
   ```

5. **AI validates and scores**
   - Validates proof matches reported work
   - Calculates productivity score (0-10)
   - Stores in database

6. **Confirmation sent**
   ```
   Bot: "✅ Report submitted successfully!
        📊 Productivity Score: 8.5/10
        Great work today! 💪"
   ```

### Example Conversation

```
Staff: "Fixed street light on Park Street, 4 hours"
Bot: "Great! I have all the details:
     📍 Site: Park Street
     ⏰ Hours: 4
     📝 Work: Fixed street light
     Now please send a photo of your completed work. 📸"

Staff: [sends photo]

Bot: "✅ Report submitted successfully!
     📊 Productivity Score: 7.5/10
     Proof validated. Good work! 💪"
```


## Troubleshooting

### Issue: "User not found" when adding comments

**Cause**: User exists in citizens table but not in users table

**Fix**:
```bash
node scripts/fix-user-sync.js
```

### Issue: "Database migration failed: column verification_status does not exist"

**Cause**: Index creation issue in migration (FIXED)

**Fix**: Restart server to re-run migration.

### Issue: WhatsApp user not authenticated

**Cause**: Staff member doesn't have phone number in users table

**Fix**:
```bash
node scripts/register-field-worker.js
# Or update directly:
# UPDATE users SET phone = '+919876543210' WHERE id = 'user-id';
```

### Issue: "You are not registered as a department staff member"

**Cause**: User exists but not in departmentofficers table

**Fix**: Add user to departmentofficers table:
```sql
INSERT INTO departmentofficers (
  user_id, department_id, staff_id, role, zone, ward, status
) VALUES (
  'user-uuid', 'dept-uuid', 'STAFF-001', 'Field Worker', 'Zone A', 'W-001', 'available'
);
```

### Issue: Comments not showing user names

**Cause**: LEFT JOIN returns null when user doesn't exist

**Fix**: Already handled in query. Run fix-user-sync.js to create missing users.

## Testing

### Test WhatsApp Integration

```bash
node test-whatsapp.js
```

### Manual Testing

1. Find a staff member:
```sql
SELECT u.id, u.full_name, u.phone, do.staff_id, do.role
FROM departmentofficers do
JOIN users u ON u.id = do.user_id
WHERE u.phone IS NOT NULL
LIMIT 5;
```

2. If no phone number, update it:
```sql
UPDATE users 
SET phone = '+919999999999' 
WHERE id = 'user-uuid-from-above';
```

3. Send WhatsApp message from that number

4. Check logs for authentication flow

5. Verify response received

## Monitoring

### Check Staff with WhatsApp Access
```sql
SELECT u.id, u.full_name, u.phone, u.status,
       d.name as department,
       do.staff_id, do.role as staff_role, do.status as staff_status
FROM users u
JOIN departmentofficers do ON do.user_id = u.id
LEFT JOIN departments d ON d.id = u.department_id
WHERE u.phone IS NOT NULL
ORDER BY d.name, do.staff_id;
```

### Check Recent Reports
```sql
SELECT dr.*, u.full_name as staff_name, do.staff_id, d.name as department
FROM daily_reports dr
JOIN users u ON dr.user_id = u.id
JOIN departmentofficers do ON do.user_id = u.id
LEFT JOIN departments d ON d.id = u.department_id
ORDER BY dr.created_at DESC
LIMIT 10;
```

### Check Staff Without Phone Numbers
```sql
SELECT u.id, u.full_name, u.email, d.name as department, do.staff_id, do.role
FROM departmentofficers do
JOIN users u ON u.id = do.user_id
LEFT JOIN departments d ON d.id = u.department_id
WHERE u.phone IS NULL
ORDER BY d.name, do.staff_id;
```

## API Endpoints

### WhatsApp Webhook

**Verify Webhook**
```
GET /api/whatsapp/webhook
Query: hub.mode, hub.verify_token, hub.challenge
```

**Receive Messages**
```
POST /api/whatsapp/webhook
Body: WhatsApp webhook payload
```

### Admin Management

**Get Staff Reports**
```
GET /api/whatsapp-admin/staff/:userId/reports
Response: Daily reports for specific staff member
```

**Get Department Reports**
```
GET /api/whatsapp-admin/departments/:deptId/reports
Response: All reports for department staff
```

## Next Steps

1. Set up WhatsApp Business API account
2. Configure webhook URL in Meta Developer Console
3. Add phone numbers to existing staff members
4. Test with a few staff members
5. Monitor logs and adjust prompts as needed
6. Set up admin dashboard for report viewing

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify database migrations completed successfully
3. Ensure WhatsApp credentials are correct in `.env`
4. Run fix scripts if data sync issues occur
5. Verify staff members have phone numbers in users table
