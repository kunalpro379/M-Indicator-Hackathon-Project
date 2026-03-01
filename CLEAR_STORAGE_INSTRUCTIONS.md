# Fix: Clear Browser Storage and Login Again

## The Issue
You're getting a 401 Unauthorized error when trying to login as City Commissioner.

## The Solution

### Step 1: Clear Browser Storage
1. Open your browser's Developer Tools (F12)
2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
3. In the left sidebar, find "Local Storage"
4. Click on `http://localhost:5173`
5. Click "Clear All" or delete these specific items:
   - `accessToken`
   - `refreshToken`
   - `user`

### Step 2: Restart Backend Server (if needed)
1. Stop the backend server (Ctrl+C in the terminal running it)
2. Navigate to the Server directory
3. Run: `npm start` or `node index.js`

### Step 3: Restart Frontend (if needed)
1. Stop the frontend (Ctrl+C)
2. Navigate to IGRS-portal directory
3. Run: `npm run dev`

### Step 4: Login with City Commissioner Credentials
Use one of these accounts:

**Account 1:**
- Email: `priya.sharma.2074d2c0@thane.gov.in`
- Password: `abc@123`

**Account 2:**
- Email: `rajesh.kumar.bc6b8b5e@thane.gov.in`
- Password: `abc@123`

## What We Fixed
1. ✅ Assigned Thane city to both City Commissioners
2. ✅ Created government_officials records with proper role_id
3. ✅ Set employee codes for both commissioners
4. ✅ Verified the backend login endpoint works correctly

## Expected Result
After logging in, you should see:
- Dashboard with city-wide statistics
- Ward Performance section
- Department Performance section
- Budget Overview
- High Priority Issues

The "City Commissioner" section in the sidebar should now work without showing "Route not found".
