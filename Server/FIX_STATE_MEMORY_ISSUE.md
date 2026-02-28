# Fix: Field Worker State Not Persisting

## Problem
Bot keeps asking the same questions - no memory of previous answers.

## Root Cause
State is not being saved/loaded properly between messages.

## Changes Made

### 1. Added Debug Logging
Added extensive logging to track state loading and saving:
- `loadFieldWorkerState()` - logs when state is loaded
- `saveFieldWorkerState()` - logs when state is saved
- `fieldWorkerWorkflow()` - logs current state at start

### 2. Fixed JSON Parsing
Updated helpers to handle JSONB columns properly:
```javascript
// Check if already an object (JSONB returns objects directly)
if (typeof stateData === 'object' && stateData !== null) {
  return stateData;
}
```

### 3. Added currentQuestion to Initial State
Ensures conversation tracking starts properly:
```javascript
{
  currentQuestion: 'description',
  status: 'collecting'
}
```

## Testing

### Run Test Script
```bash
cd Server
node scripts/test-field-worker-state.js
```

This will:
1. Load initial state
2. Update with test data
3. Reload and verify persistence
4. Check database directly
5. Clean up test data

### Check Logs
When you send a message to the bot, you should see:
```
🏗️ Field Worker Workflow - User: xxx, Message: "..."
🔍 Loading state for user: xxx, date: 2026-03-01
✅ Found existing state for user xxx
📦 State data type: object
📊 Current state: { status: 'collecting', currentQuestion: 'site', ... }
```

## Debugging Steps

### 1. Check if table exists
```sql
SELECT * FROM field_worker_states LIMIT 5;
```

### 2. Check if state is being saved
```sql
SELECT user_id, date, state_data 
FROM field_worker_states 
WHERE date = CURRENT_DATE
ORDER BY updated_at DESC;
```

### 3. Check user ID format
The bot uses `userContext.id` (UUID) not phone number. Verify:
```javascript
console.log('User ID:', userId);
console.log('User ID type:', typeof userId);
```

## Common Issues

### Issue 1: Using Phone Number Instead of User ID
**Problem**: State saved with phone number, but loaded with UUID
**Solution**: Always use `userContext.id` from database

### Issue 2: JSONB vs JSON
**Problem**: PostgreSQL JSONB returns objects, not strings
**Solution**: Check type before parsing

### Issue 3: Date Mismatch
**Problem**: Different timezone causing date mismatch
**Solution**: Use consistent date format: `new Date().toISOString().split('T')[0]`

## Verification

After restart, send messages and check logs:

1. First message: "Hi"
   - Should see: "Creating new state"
   - Should ask: "What work did you do today?"

2. Second message: "Fixed pipes"
   - Should see: "Found existing state"
   - Should see: currentQuestion: 'description'
   - Should save with description: "Fixed pipes"
   - Should ask: "Which site or location?"

3. Third message: "Kansai section"
   - Should see: "Found existing state"
   - Should see: description: "Fixed pipes" (from previous)
   - Should save with site: "Kansai section"
   - Should ask: "How many hours?"

## If Still Not Working

1. Check server logs for errors
2. Verify database connection
3. Check if user exists in users table
4. Verify user_id is UUID format
5. Check if field_worker_states table has UNIQUE constraint on (user_id, date)
