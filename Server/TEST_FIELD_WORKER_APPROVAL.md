# Testing Field Worker Approval System

## Quick Test Guide

### Option 1: Create Test Pending Request (Fastest)

Run this script to create a test pending request:

```bash
node Server/scripts/create-test-pending-request.js
```

This will create a pending field worker request that you can approve/reject from the dashboard.

Then:
1. Refresh your department dashboard
2. Go to Resources → Internal Team
3. You should see a yellow/amber section at the top with "Pending Registration Requests"
4. Click "Approve" or "Reject" to test the functionality

### Option 2: Test via Telegram Bot (Full Flow)

1. **Start Telegram Bot**
   - Make sure your server is running
   - Open Telegram and find your bot (@Igrsportalbot)

2. **Send /start command**
   - Bot will ask you to share your contact

3. **Share Your Contact**
   - Tap the "📱 Share My Contact" button
   - This sends your real phone number to the bot

4. **Register as Field Worker**
   - Type "Field worker" or "1"
   - Bot will create a pending registration request

5. **Check Dashboard**
   - Login to department dashboard
   - Go to Resources → Internal Team
   - You should see the pending request

6. **Approve/Reject**
   - Click "Approve" to add the field worker to your team
   - Click "Reject" to decline the request

## What You Should See

### Dashboard - No Pending Requests
```
┌─────────────────────────────────────────────────────┐
│ Internal Team - Small Work Specialists              │
│ Internal team members handle small-scale...         │
├─────────────────────────────────────────────────────┤
│ Staff ID | Name | Role | Zone | Status | ...        │
├─────────────────────────────────────────────────────┤
│ STAFF-01 | John | ...  | ...  | ...    | ...        │
└─────────────────────────────────────────────────────┘
```

### Dashboard - With Pending Requests
```
┌─────────────────────────────────────────────────────┐
│ Internal Team - Small Work Specialists              │
│                                    🔔 2 Pending Req. │
├─────────────────────────────────────────────────────┤
│ ⚠️ PENDING REGISTRATION REQUESTS (2)                │
├─────────────────────────────────────────────────────┤
│ Name          | Phone        | Channel  | Actions   │
│ Test Worker   | +9198765...  | Telegram | ✓ Approve │
│                                          | ✗ Reject  │
├─────────────────────────────────────────────────────┤
│ ACTIVE STAFF MEMBERS                                │
├─────────────────────────────────────────────────────┤
│ Staff ID | Name | Role | Zone | Status | ...        │
│ STAFF-01 | John | ...  | ...  | ...    | ...        │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

### "No pending requests showing"

**Check 1: Are there any pending requests in the database?**
```sql
SELECT * FROM pending_registrations 
WHERE user_type = 'field_worker' 
AND status = 'pending';
```

**Check 2: Is the API returning data?**
- Open browser DevTools (F12)
- Go to Network tab
- Look for `/api/field-worker-requests/pending`
- Check the response

**Check 3: Check console for errors**
```bash
# In server console, you should see:
✅ Authorization successful
🔍 Field worker requests - User data: { ... }
```

### "403 Forbidden Error"

**Solution:** The authorization fix should have resolved this. If you still see it:

1. **Clear browser cache and logout/login again**
   - Old tokens don't have role information
   - New tokens include role and department_id

2. **Check token payload**
   - Open browser DevTools → Application → Local Storage
   - Find `accessToken`
   - Copy and paste into https://jwt.io
   - Verify it contains `role` and `department_id`

3. **Check server logs**
   ```bash
   # Should see:
   🔐 Authorization check: {
     requiredRoles: ['department_head', 'department_officer'],
     userRole: 'department_officer',  // ← Should match
     ...
   }
   ✅ Authorization successful
   ```

### "Automatic logout after clicking Resources tab"

This was the original issue - should be fixed now. If it still happens:

1. **Check if you're logged in with an old token**
   - Logout and login again
   - New tokens have the correct format

2. **Verify the middleware fix**
   - Check `Server/src/middleware/auth.middleware.js`
   - Should have `.flat()` to flatten the roles array

## Manual Database Operations

### View All Pending Requests
```sql
SELECT 
  id,
  full_name,
  phone,
  channel,
  specialization,
  zone,
  status,
  created_at
FROM pending_registrations
WHERE user_type = 'field_worker'
AND status = 'pending'
ORDER BY created_at DESC;
```

### Manually Create Pending Request
```sql
INSERT INTO pending_registrations 
  (telegram_user_id, phone, full_name, user_type, channel, status, specialization, zone, created_at)
VALUES 
  ('123456789', '+919876543210', 'Test Field Worker', 'field_worker', 'telegram', 'pending', 'Plumbing', 'Zone A', NOW());
```

### View Approved Field Workers
```sql
SELECT 
  u.id,
  u.full_name,
  u.phone,
  u.role,
  doff.staff_id,
  doff.specialization,
  doff.zone,
  doff.status
FROM users u
JOIN departmentofficers doff ON doff.user_id = u.id
WHERE u.role = 'department_officer'
AND doff.role = 'field_worker'
ORDER BY u.created_at DESC;
```

### Check Approval History
```sql
SELECT 
  pr.id,
  pr.full_name,
  pr.phone,
  pr.status,
  pr.reviewed_at,
  pr.rejection_reason,
  u.full_name as reviewed_by_name
FROM pending_registrations pr
LEFT JOIN users u ON u.id = pr.reviewed_by
WHERE pr.user_type = 'field_worker'
AND pr.status IN ('approved', 'rejected')
ORDER BY pr.reviewed_at DESC;
```

## API Testing with cURL

### Get Pending Requests
```bash
curl -X GET http://localhost:4000/api/field-worker-requests/pending \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Approve Request
```bash
curl -X POST http://localhost:4000/api/field-worker-requests/approve/123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Reject Request
```bash
curl -X POST http://localhost:4000/api/field-worker-requests/reject/123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Invalid credentials"}'
```

## Expected Behavior

### After Approval:
1. ✅ Pending request disappears from list
2. ✅ New staff member appears in active staff table
3. ✅ User can login with their phone number
4. ✅ User can submit daily reports via Telegram/WhatsApp
5. ✅ Success message shown to department officer

### After Rejection:
1. ✅ Pending request disappears from list
2. ✅ Request status updated to 'rejected' in database
3. ✅ Rejection reason stored
4. ✅ Success message shown to department officer
5. 🔲 TODO: User receives notification (not implemented yet)

## Next Steps

Once the approval system is working:

1. **Add Notifications**
   - Send Telegram/WhatsApp message when approved
   - Send message when rejected with reason

2. **Add Bulk Actions**
   - Approve multiple requests at once
   - Reject multiple requests at once

3. **Add Filters**
   - Filter by channel (Telegram/WhatsApp)
   - Filter by specialization
   - Filter by date

4. **Add Details Modal**
   - View full request details before approval
   - See request history
   - View user's Telegram/WhatsApp profile

5. **Add Analytics**
   - Track approval rates
   - Track response times
   - Show pending request trends
