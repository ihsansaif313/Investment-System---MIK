/**
 * Test if services are running
 */

const testServices = async () => {
  console.log('🔍 Testing services...');
  
  try {
    // Test backend
    console.log('\n🔧 Testing backend on port 3002...');
    const backendResponse = await fetch('http://localhost:3002/health');
    console.log('Backend status:', backendResponse.status);
    if (backendResponse.ok) {
      const data = await backendResponse.text();
      console.log('Backend response:', data);
    }
  } catch (error) {
    console.log('❌ Backend not responding:', error.message);
  }
  
  try {
    // Test frontend
    console.log('\n🎨 Testing frontend on port 5174...');
    const frontendResponse = await fetch('http://localhost:5174');
    console.log('Frontend status:', frontendResponse.status);
  } catch (error) {
    console.log('❌ Frontend not responding:', error.message);
  }
};

testServices();
