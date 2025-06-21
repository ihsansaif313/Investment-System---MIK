/**
 * Test script to check if backend is responding
 */

const testBackendHealth = async () => {
  try {
    console.log('🔍 Testing backend health...');
    
    // Test basic health endpoint
    const healthResponse = await fetch('http://localhost:3002/api/health');
    console.log('Health endpoint status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health response:', healthData);
    }

    // Test auth endpoint
    console.log('\n🔐 Testing auth endpoint...');
    const authResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
    });

    console.log('Auth endpoint status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('Auth response:', authData);

  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
};

// Run the test
testBackendHealth();
