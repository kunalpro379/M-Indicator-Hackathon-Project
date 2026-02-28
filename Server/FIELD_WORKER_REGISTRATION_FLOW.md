# Field Worker Self-Registration Flow

## Overview
Field workers can now self-register via Telegram/WhatsApp and department officers can approve/reject requests from the admin panel.

## Complete Flow

### 1. User Initiates Registration (Telegram)

**User Action:**
- User sends message like "Field worker", "Register", "Sign up", etc.

**Bot Response:**
- Requests contact sharing with keyboard button
- "📱 Share My Contact"

### 2. Contact Sharing

**User Action:**
- Taps 📎 button → Contact → Share My Contact

**Bot Action:**
- Receives real phone number (not Telegram ID)
- Stores in `user_temp_data` table temporarily
- Asks for registration type (Field Worker or Contractor)

### 3. Registration Request Creation

**User Action:**
- Confirms "Field Worker" registration

**Bot Action:**
- Creates entry in `pending_registrations` table with:
  - `telegram_user_id`: Telegram chat ID
  - `phone`: Real phone number from contact share
  - `full_name`: User's name
  - `user_type`: 'field_worker'
  - `channel`: 'telegram'
  - `status`: 'pending'

**Bot Response:**
```
✅ Field Worker Registration Request Submitted!

📱 Phone: +919876543210
👤 Name: John Doe

⏳ Your request has been sent to the department officer for approval.
You'll be notified once it's reviewed (usually within 24-48 hours).
```

### 4. Department Officer Reviews (Admin Panel)

**API Endpoint:**
```
GET /api/field-worker-requests/pending
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "telegram_user_id": "6977369636",
      "phone": "+919876543210",
      "full_name": "John Doe",
      "specialization": null,
      "zone": null,
      "ward": null,
      "status": "pending",
      "channel": "telegram",
      "created_at": "2026-03-01T10:30:00Z"
    }
  ]
}
```

**Frontend Display:**
- Shows in "Internal Team - Staff Members" section
- Displays pending requests with approve/reject buttons

### 5. Approval Process

**API Endpoint:**
```
POST /api/field-worker-requests/approve/:requestId
Authorization: Bearer <token>
```

**Backend Actions:**
1. Creates user account with real phone number
2. Creates citizen record (for FK constraints)
3. Creates `departmentofficers` record with:
   - `staff_id`: Auto-generated (STAFF-XXXXXX)
   - `user_id`: New user ID
   - `department_id`: From authenticated officer's context
   - `role`: 'field_worker'
   - `status`: 'active'
4. Updates `pending_registrations` status to 'approved'

**Response:**
```json
{
  "success": true,
  "message": "Field worker approved and added to your department",
  "data": {
    "userId": 456,
    "staffId": "STAFF-012345",
    "full_name": "John Doe",
    "phone": "+919876543210"
  }
}
```

### 6. Rejection Process

**API Endpoint:**
```
POST /api/field-worker-requests/reject/:requestId
Authorization: Bearer <token>
Body: { "reason": "Invalid credentials" }
```

**Backend Actions:**
1. Updates `pending_registrations` status to 'rejected'
2. Stores rejection reason

## Key Features

### Phone Number Handling
- **Telegram IDs are NEVER used as phone numbers**
- Real phone numbers obtained via contact sharing
- Stored temporarily in `user_temp_data` table
- Telegram IDs masked in AI prompts ("Not provided yet")

### Security
- Only department officers/heads can approve requests
- Uses `department_id` from authenticated user context
- No URL parameter manipulation possible

### Database Tables

**user_temp_data:**
```sql
CREATE TABLE user_temp_data (
  telegram_user_id TEXT PRIMARY KEY,
  phone_number TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**pending_registrations:**
```sql
CREATE TABLE pending_registrations (
  id SERIAL PRIMARY KEY,
  telegram_user_id TEXT UNIQUE,
  whatsapp_phone TEXT UNIQUE,
  phone TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  department_id INTEGER,
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Routes

### Field Worker Requests
- `GET /api/field-worker-requests/pending` - Get pending requests
- `POST /api/field-worker-requests/approve/:requestId` - Approve request
- `POST /api/field-worker-requests/reject/:requestId` - Reject request

### Authentication
- All routes require `authenticateToken` middleware
- All routes require `authorizeRoles(['department_head', 'department_officer'])`

## Frontend Integration

### Display Pending Requests
```javascript
// Fetch pending requests
const response = await fetch('/api/field-worker-requests/pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
// Display in staff members table with "Pending" badge
```

### Approve Request
```javascript
const response = await fetch(`/api/field-worker-requests/approve/${requestId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
// Show success message and refresh table
```

### Reject Request
```javascript
const response = await fetch(`/api/field-worker-requests/reject/${requestId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Invalid credentials'
  })
});

const result = await response.json();
// Show success message and refresh table
```

## Testing

### Test Contact Sharing
1. Start Telegram bot: `/start`
2. Tap "📱 Share My Contact" button
3. Confirm contact sharing
4. Bot should acknowledge with phone number

### Test Registration
1. After sharing contact, type "Field worker"
2. Bot should create pending registration
3. Check database: `SELECT * FROM pending_registrations WHERE status = 'pending'`

### Test Approval
1. Login as department officer
2. Navigate to staff management
3. See pending request
4. Click approve
5. Check database: User should be created in `users`, `citizens`, and `departmentofficers` tables

## Troubleshooting

### "Telegram ID used as phone number"
- Ensure contact sharing is implemented
- Check `user_temp_data` table for stored phone
- Verify `getUserContext()` checks for Telegram ID and looks up real phone

### "Department ID not found"
- Ensure user is logged in as department officer
- Check JWT token includes `department_id`
- Verify `req.user.department_id` is populated

### "Request not found"
- Check `pending_registrations` table
- Verify status is 'pending'
- Ensure `user_type` is 'field_worker'

## Next Steps

1. ✅ Add route to `Server/index.js` - DONE
2. ✅ Implement contact sharing in Telegram bot - DONE
3. ✅ Store phone numbers in `user_temp_data` - DONE
4. ✅ Create pending registration on request - DONE
5. ✅ Implement approval/rejection endpoints - DONE
6. 🔲 Frontend: Display pending requests in staff table
7. 🔲 Frontend: Add approve/reject buttons
8. 🔲 Implement notification system (Telegram/WhatsApp)
9. 🔲 Add email notifications for approvals
10. 🔲 Add audit logging for approvals/rejections
