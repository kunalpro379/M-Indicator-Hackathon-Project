# Field Worker Approval - Frontend Implementation

## Overview
Department officers can now approve or reject field worker registration requests directly from the department dashboard's "Internal Team" section.

## Changes Made

### 1. Service Layer (`src/services/departmentDashboard.service.js`)

Added three new methods:

```javascript
// Fetch pending field worker registration requests
async getPendingFieldWorkerRequests(token)

// Approve a field worker request
async approveFieldWorkerRequest(requestId, token)

// Reject a field worker request with reason
async rejectFieldWorkerRequest(requestId, reason, token)
```

### 2. Dashboard Component (`src/pages/department/Dashboard.jsx`)

#### State Management
Added new state variables:
```javascript
const [pendingRequests, setPendingRequests] = useState([]);
const [pendingRequestsLoading, setPendingRequestsLoading] = useState(false);
```

#### Data Loading
Updated `loadResourcesData()` to fetch both staff and pending requests:
```javascript
const [staffRes, pendingRes] = await Promise.all([
  departmentDashboardService.getStaff(depId, token),
  departmentDashboardService.getPendingFieldWorkerRequests(token)
]);
```

#### Handler Functions
Added two handler functions:

**Approve Handler:**
```javascript
const handleApproveFieldWorker = async (requestId) => {
  // Confirms with user
  // Calls API to approve
  // Reloads staff and pending requests
  // Shows success/error message
}
```

**Reject Handler:**
```javascript
const handleRejectFieldWorker = async (requestId) => {
  // Prompts for rejection reason
  // Calls API to reject
  // Reloads pending requests
  // Shows success/error message
}
```

#### UI Updates
Added pending requests section above the staff table:
- Highlighted amber background to draw attention
- Shows count of pending requests
- Displays: Name, Phone, Channel (Telegram/WhatsApp), Request Date
- Action buttons: Approve (green) and Reject (red)

## User Flow

### 1. View Pending Requests
1. Department officer logs into dashboard
2. Navigates to "Resources" tab
3. Selects "Internal Team" sub-tab
4. Sees pending requests at the top (if any)

### 2. Approve Request
1. Officer clicks "Approve" button
2. Confirmation dialog appears
3. On confirmation:
   - API creates user account with real phone number
   - Creates citizen record
   - Creates department officer record
   - Updates pending registration status to 'approved'
4. Success message shown
5. Request disappears from pending list
6. New staff member appears in active staff table

### 3. Reject Request
1. Officer clicks "Reject" button
2. Prompt asks for rejection reason
3. On submission:
   - API updates pending registration status to 'rejected'
   - Stores rejection reason
4. Success message shown
5. Request disappears from pending list

## Visual Design

### Pending Requests Section
- **Background**: Amber (warning color to indicate action needed)
- **Header**: Bold with alert icon and count badge
- **Table**: Clean, responsive design
- **Buttons**: 
  - Approve: Green with checkmark icon
  - Reject: Red with X icon

### Integration
- Seamlessly integrated above existing staff table
- Only shows when there are pending requests
- Maintains consistent design language with rest of dashboard

## API Endpoints Used

```
GET  /api/field-worker-requests/pending
POST /api/field-worker-requests/approve/:requestId
POST /api/field-worker-requests/reject/:requestId
```

All endpoints require authentication token and department officer/head role.

## Error Handling

- Network errors: Shows user-friendly error message
- Auth errors: Redirects to login
- Validation errors: Shows specific error from API
- Confirmation dialogs prevent accidental actions

## Testing Checklist

- [ ] Pending requests load correctly
- [ ] Approve button creates staff member
- [ ] Reject button removes request
- [ ] Error messages display properly
- [ ] Loading states work correctly
- [ ] Confirmation dialogs appear
- [ ] Table updates after approval/rejection
- [ ] Works for both Telegram and WhatsApp requests
- [ ] Phone numbers display correctly
- [ ] Request dates format properly

## Future Enhancements

1. **Bulk Actions**: Approve/reject multiple requests at once
2. **Filters**: Filter by channel, date, specialization
3. **Search**: Search pending requests by name/phone
4. **Notifications**: Real-time notifications for new requests
5. **Details Modal**: View full request details before approval
6. **Audit Trail**: Show who approved/rejected and when
7. **Email Notifications**: Send email to approved/rejected users
8. **SMS Notifications**: Send SMS confirmation
9. **Request History**: View all approved/rejected requests
10. **Analytics**: Track approval rates, response times

## Notes

- Pending requests are fetched every time the "Internal Team" tab is opened
- Requests are automatically removed from the list after approval/rejection
- The system uses the authenticated user's department_id (no URL manipulation)
- Real phone numbers are used (not Telegram IDs)
- Both Telegram and WhatsApp channels are supported
