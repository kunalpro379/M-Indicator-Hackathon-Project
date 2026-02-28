// Simple test to verify login endpoint
const testLogin = async () => {
  try {
    console.log('Testing login endpoint...');
    console.log('URL: http://localhost:4000/api/auth/login');
    console.log('Email: priya.sharma.2074d2c0@thane.gov.in');
    console.log('Password: abc@123\n');

    const response = await fetch('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'priya.sharma.2074d2c0@thane.gov.in',
        password: 'abc@123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResponse data:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Access Token:', data.accessToken ? 'Present' : 'Missing');
      console.log('User:', data.user?.full_name);
      console.log('Role:', data.user?.role);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error || data.message);
    }
  } catch (error) {
    console.error('\n❌ Request failed:');
    console.error('Error:', error.message);
    console.error('\nIs the backend server running on port 4000?');
  }
};

testLogin();
