/**
 * Test script to debug company creation issues
 */

const testCompanyCreation = async () => {
  try {
    console.log('🔐 Testing login...');
    
    // First, login to get a valid token
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ihsansaif@gmail.com',
        password: 'Ihsan123!'  // Replace with actual password
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful');

    // Now test company creation with the exact data structure from frontend
    console.log('\n🏢 Testing company creation...');
    
    const companyData = {
      name: "Debug Test Company",
      industry: "Technology",
      category: "Startup", 
      description: "A test company for debugging industry/category fields",
      contactEmail: "debug@testcompany.com",
      contactPhone: "+1234567890",
      establishedDate: "2024-01-01",
      website: "https://debugcompany.com",
      address: "123 Debug Street"
    };

    console.log('📋 Sending company data:');
    console.log(JSON.stringify(companyData, null, 2));

    const companyResponse = await fetch('http://localhost:3002/api/companies/sub', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData)
    });

    console.log('\n📊 Company creation response:');
    console.log('Status:', companyResponse.status);
    
    const companyResult = await companyResponse.json();
    console.log('Response:', JSON.stringify(companyResult, null, 2));

    if (companyResponse.status === 201 && companyResult.success) {
      console.log('\n✅ Company created successfully!');
      console.log('🔍 Checking if industry and category were saved...');
      
      // Check the created company data
      const createdCompany = companyResult.data;
      console.log('Created company industry:', createdCompany.industry || '❌ MISSING');
      console.log('Created company category:', createdCompany.category || '❌ MISSING');
      
    } else {
      console.error('\n❌ Company creation failed');
      if (companyResult.errors) {
        console.error('Validation errors:', companyResult.errors);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testCompanyCreation();
