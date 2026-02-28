import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Simulate the generateTokens function
const generateTokens = (userId, userData = {}) => {
  console.log('📝 generateTokens called with:', {
    userId,
    userData
  });
  
  const tokenPayload = { 
    userId, 
    type: 'access',
    role: userData.role,
    department_id: userData.department_id
  };
  
  console.log('📝 Token payload:', tokenPayload);
  
  const accessToken = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  return { accessToken };
};

// Test token generation
console.log('\n🧪 Testing Token Generation\n');

const testUserId = '05a088ea-a5f0-4a9f-aab5-3ed97849fea3';
const testUserData = {
  role: 'department_officer',
  department_id: '65f21378-9464-5136-bef3-0d5ab3bd867d'
};

const { accessToken } = generateTokens(testUserId, testUserData);

console.log('\n✅ Token generated:', accessToken.substring(0, 50) + '...\n');

// Decode and verify the token
const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

console.log('🔍 Decoded token:', decoded);

// Check if role is present
if (decoded.role) {
  console.log('\n✅ SUCCESS: Role is present in token:', decoded.role);
} else {
  console.log('\n❌ ERROR: Role is missing from token!');
}

// Check if department_id is present
if (decoded.department_id) {
  console.log('✅ SUCCESS: Department ID is present in token:', decoded.department_id);
} else {
  console.log('❌ ERROR: Department ID is missing from token!');
}

// Test authorization check
const requiredRoles = ['department_head', 'department_officer'];
if (requiredRoles.includes(decoded.role)) {
  console.log('\n✅ SUCCESS: Authorization would pass for role:', decoded.role);
} else {
  console.log('\n❌ ERROR: Authorization would fail. Required:', requiredRoles, 'Got:', decoded.role);
}
