# JWT Token Fix - Include Role and Department ID

## Problem
The field worker requests API was returning 403 (Forbidden) errors, causing automatic logout. The issue was that JWT tokens only contained `userId`, but the `authorizeRoles` middleware expected `req.user.role` and `req.user.department_id` to be present.

## Root Cause
```javascript
// OLD - Token only had userId
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  // ...
};
```

When the middleware checked:
```javascript
if (!roles.includes(req.user.role)) {
  return res.status(403).json({ message: 'Access denied' });
}
```

`req.user.role` was `undefined`, causing the 403 error.

## Solution
Updated `generateTokens` to accept and include user data in the JWT payload:

```javascript
// NEW - Token includes role and department_id
const generateTokens = (userId, userData = {}) => {
  const accessToken = jwt.sign(
    { 
      userId, 
      type: 'access',
      role: userData.role,
      department_id: userData.department_id
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  // ...
};
```

## Changes Made

### 1. Updated `generateTokens` Function
**File:** `Server/src/controllers/auth.controller.js`

- Added `userData` parameter with default empty object
- Included `role` and `department_id` in access token payload

### 2. Updated Citizen Registration
```javascript
const { accessToken, refreshToken } = generateTokens(citizen.id, {
  role: 'citizen',
  department_id: null
});
```

### 3. Updated Login Function
```javascript
const { accessToken, refreshToken } = generateTokens(user.id, {
  role: isCitizen ? 'citizen' : user.role,
  department_id: isCitizen ? null : user.department_id
});
```

### 4. Updated Refresh Token Function
- Fetches user data from database before generating new tokens
- Checks if user is citizen or regular user
- Includes appropriate role and department_id in new tokens

```javascript
// Fetch user data to include in new token
let userData = { role: null, department_id: null };

if (isCitizen) {
  userData = { role: 'citizen', department_id: null };
} else {
  const userResult = await pool.query(
    'SELECT role, department_id FROM users WHERE id = $1',
    [decoded.userId]
  );
  userData = {
    role: userResult.rows[0].role,
    department_id: userResult.rows[0].department_id
  };
}

const tokens = generateTokens(decoded.userId, userData);
```

## Benefits

1. **No More 403 Errors**: Middleware can now properly check user roles
2. **No Database Queries**: Role checking doesn't require additional DB queries
3. **Better Performance**: User role is immediately available from token
4. **Consistent Authorization**: All protected routes work correctly
5. **Proper Department Context**: Department-specific routes have access to department_id

## Token Payload Structure

### Before
```json
{
  "userId": "05a088ea-a5f0-4a9f-aab5-3ed97849fea3",
  "type": "access",
  "iat": 1709251200,
  "exp": 1709252100
}
```

### After
```json
{
  "userId": "05a088ea-a5f0-4a9f-aab5-3ed97849fea3",
  "type": "access",
  "role": "department_officer",
  "department_id": "65f21378-9464-5136-bef3-0d5ab3bd867d",
  "iat": 1709251200,
  "exp": 1709252100
}
```

## Testing

### Test Login
1. Login as department officer
2. Check that token includes role and department_id
3. Verify no automatic logout occurs

### Test Field Worker Requests
1. Navigate to Resources → Internal Team
2. Verify pending requests load without 403 error
3. Test approve/reject functionality

### Test Token Refresh
1. Wait for access token to expire (15 minutes)
2. Verify refresh token generates new access token with role/department_id
3. Confirm no logout occurs

## Security Considerations

- Token payload is NOT encrypted (only signed)
- Don't include sensitive data in tokens
- Role and department_id are safe to include
- Tokens are short-lived (15 minutes)
- Refresh tokens are stored in database and can be revoked

## Migration Notes

**Existing users will need to re-login** to get new tokens with role and department_id. Old tokens will continue to work but may fail authorization checks on protected routes.

To force re-login for all users:
```sql
-- Revoke all refresh tokens
UPDATE refreshtokens SET revoked = true WHERE revoked = false;
```

## Related Files
- `Server/src/controllers/auth.controller.js` - Token generation
- `Server/src/middleware/auth.middleware.js` - Authorization checks
- `Server/src/routes/field-worker-requests.routes.js` - Protected routes
