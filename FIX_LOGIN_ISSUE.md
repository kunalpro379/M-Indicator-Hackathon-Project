# Fix: Login Token Not Reaching Client

## Root Cause
The issue is a mismatch between the frontend port configuration and CORS settings.

## The Fix

### Step 1: Restart Frontend on Correct Port

1. **Stop the frontend** (Ctrl+C in the terminal)
2. **Navigate to IGRS-portal directory**
3. **Run**: `npm run dev`
4. **Check the terminal output** - it should say: `Local: http://127.0.0.1:5173/`

### Step 2: Verify Backend is Running

1. **Check if backend is running** on port 4000
2. If not, navigate to Server directory and run: `npm start`

### Step 3: Clear Browser Cache

1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### Step 4: Test Login

1. Go to: `http://localhost:5173/officials-portal/authentication`
2. Login with:
   - Email: `priya.sharma.2074d2c0@thane.gov.in`
   - Password: `abc@123`

## What We Fixed

1. ✅ Updated vite.config.js to use port 5173 (was 5010)
2. ✅ Added city_commissioner role to redirect logic in AuthPage
3. ✅ Backend CORS already includes port 5173
4. ✅ Assigned Thane city to City Commissioners in database

## If Still Not Working

### Check Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for the `/api/auth/login` request
5. Check:
   - **Status**: Should be 200
   - **Response**: Should contain `accessToken` and `refreshToken`
   - **Headers**: Check if CORS headers are present

### Common Issues

**Issue 1: Port Mismatch**
- Frontend running on different port than 5173
- Solution: Check terminal output when starting frontend

**Issue 2: Backend Not Running**
- Backend server not started
- Solution: Start backend with `npm start` in Server directory

**Issue 3: CORS Error**
- Console shows CORS error
- Solution: Verify backend CORS config includes your frontend port

**Issue 4: Old Cache**
- Browser using cached responses
- Solution: Hard refresh (Ctrl+Shift+R) or clear cache

## Expected Behavior After Fix

1. Login form submits
2. Network request shows 200 status
3. Response contains tokens
4. Tokens stored in localStorage
5. Redirect to `/government/{userId}/dashboard`
6. City Commissioner dashboard loads with data

## Verification Steps

After logging in successfully:
1. Open DevTools → Application → Local Storage
2. You should see:
   - `accessToken`: JWT token string
   - `refreshToken`: JWT token string  
   - `user`: JSON object with user data
3. Navigate to "City Commissioner" section in sidebar
4. Should see dashboard with city-wide statistics
