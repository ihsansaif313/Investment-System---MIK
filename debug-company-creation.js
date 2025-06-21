/**
 * Debug script to test company creation API
 */

const testCompanyCreation = async () => {
  try {
    // First, let's test the login to get a valid token
    console.log('🔐 Testing login...');
    
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ihsansaif@gmail.com',
        password: 'your_actual_password_here'  // You'll need to provide the correct password
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.error('❌ Login failed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful, token obtained');

    // Now test company creation
    console.log('\n🏢 Testing company creation...');
    
    const companyData = {
      name: "Debug Test Company",
      industry: "Technology",
      category: "Startup",
      description: "A test company for debugging",
      contactEmail: "debug@testcompany.com",
      establishedDate: "2024-01-01",
      address: "123 Debug Street",
      contactPhone: "+1234567890",
      website: "https://debugcompany.com"
    };

    console.log('Company data:', JSON.stringify(companyData, null, 2));

    const companyResponse = await fetch('http://localhost:3002/api/companies/sub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });

    console.log('Company creation response status:', companyResponse.status);
    
    const companyResult = await companyResponse.json();
    console.log('Company creation response:', JSON.stringify(companyResult, null, 2));

    if (companyResponse.status === 400) {
      console.error('❌ 400 Bad Request - Check validation errors above');
    } else if (companyResult.success) {
      console.log('✅ Company created successfully!');
    } else {
      console.error('❌ Company creation failed:', companyResult.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testCompanyCreation();
