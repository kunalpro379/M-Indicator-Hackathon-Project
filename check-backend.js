// Quick check if backend is accessible
const checkBackend = async () => {
  console.log('🔍 Checking backend server...\n');
  
  const endpoints = [
    'http://localhost:4000',
    'http://localhost:4000/api',
    'http://localhost:4000/api/auth/login'
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, {
        method: url.includes('/login') ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: url.includes('/login') ? JSON.stringify({
          email: 'test@test.com',
          password: 'test'
        }) : undefined
      });
      
      console.log(`  Status: ${response.status} ${response.statusText}`);
      
      if (response.status !== 404) {
        const text = await response.text();
        console.log(`  Response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
      console.log('');
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('\n📋 Summary:');
  console.log('If you see connection errors above, the backend is NOT running.');
  console.log('Start it with: cd Server && npm start');
};

checkBackend();
