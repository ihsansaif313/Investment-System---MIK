/**
 * Test company edit functionality
 */

const axios = require('axios');

const testCompanyEdit = async () => {
  try {
    console.log('🧪 Testing company edit functionality...');

    const baseURL = 'http://localhost:3002/api';

    // First, login to get auth token
    console.log('\n1️⃣ Logging in...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'password123'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');

    // Get list of companies
    console.log('\n2️⃣ Getting companies list...');
    const companiesResponse = await axios.get(`${baseURL}/companies`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const companies = companiesResponse.data.data;
    console.log(`✅ Found ${companies.length} companies`);

    if (companies.length === 0) {
      console.log('❌ No companies found to test edit functionality');
      return;
    }

    // Get the first company for testing
    const testCompany = companies[0];
    console.log(`\n3️⃣ Testing edit for company: ${testCompany.name} (ID: ${testCompany.id})`);

    // Prepare update data
    const updateData = {
      name: testCompany.name + ' (EDITED)',
      industry: 'Technology',
      category: 'Enterprise',
      description: 'This company has been edited via API test',
      contactEmail: 'edited@company.com',
      contactPhone: '+1234567890',
      website: 'https://edited-company.com',
      address: '123 Edited Street, Test City',
      establishedDate: '2024-01-01'
    };

    console.log('\n📝 Update data:');
    console.log(JSON.stringify(updateData, null, 2));

    // Perform the update
    console.log('\n4️⃣ Performing update...');
    const updateResponse = await axios.put(`${baseURL}/companies/sub/${testCompany.id}`, updateData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Update successful!');
    console.log('📊 Updated company data:');
    console.log(JSON.stringify(updateResponse.data.data, null, 2));

    // Verify the update by fetching the company again
    console.log('\n5️⃣ Verifying update...');
    const verifyResponse = await axios.get(`${baseURL}/companies/${testCompany.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const updatedCompany = verifyResponse.data.data;
    console.log('🔍 Verification results:');
    console.log('  - Name:', updatedCompany.name);
    console.log('  - Industry:', updatedCompany.industry || '❌ MISSING');
    console.log('  - Category:', updatedCompany.category || '❌ MISSING');
    console.log('  - Website:', updatedCompany.website || '❌ MISSING');
    console.log('  - Contact Email:', updatedCompany.contactEmail || '❌ MISSING');

    // Check if all fields were updated correctly
    const fieldsToCheck = ['name', 'industry', 'category', 'website'];
    let allFieldsUpdated = true;

    for (const field of fieldsToCheck) {
      if (!updatedCompany[field] || updatedCompany[field] !== updateData[field]) {
        console.log(`❌ Field '${field}' was not updated correctly`);
        console.log(`   Expected: ${updateData[field]}`);
        console.log(`   Actual: ${updatedCompany[field] || 'undefined'}`);
        allFieldsUpdated = false;
      }
    }

    if (allFieldsUpdated) {
      console.log('\n🎉 SUCCESS: All fields were updated correctly!');
    } else {
      console.log('\n❌ FAILURE: Some fields were not updated correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Hint: Make sure you have the correct login credentials');
    }
  }
};

// Run the test
testCompanyEdit();
