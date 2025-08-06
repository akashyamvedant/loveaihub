// Quick test script to debug the reset password flow
const fetch = require('node-fetch');

async function testPasswordReset() {
  try {
    console.log('Testing password reset endpoint...');
    
    // Test with a mock token to see the error handling
    const response = await fetch('http://localhost:5000/api/auth/update-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test_token_to_see_logs'
      },
      body: JSON.stringify({ password: 'testpassword123' })
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', result);
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testPasswordReset();