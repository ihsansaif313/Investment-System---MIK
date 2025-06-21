/**
 * Debug Validation Error
 * Test investor creation with detailed validation error reporting
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function debugValidationError() {
  try {
    console.log('🔍 Debugging Investor Creation Validation\n');

    // Step 1: Admin login
    console.log('1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test with valid data first
    console.log('\n2️⃣ Testing with Valid Data');
    
    const validInvestorData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe.${Date.now()}@example.com`,
      phone: '+1234567890',
      cnic: '12345-1234567-1',
      address: '123 Main Street, City, Country',
      dateOfBirth: '1990-01-01',
      investmentPreferences: {
        riskTolerance: 'medium',
        preferredSectors: ['Technology', 'Healthcare'],
        investmentGoals: ['Wealth Building', 'Retirement'],
        timeHorizon: 'long'
      },
      initialInvestmentAmount: 10000,
      notes: 'Test investor account'
    };

    console.log('📝 Valid data structure:');
    console.log(JSON.stringify(validInvestorData, null, 2));

    try {
      const validResponse = await axios.post(`${baseURL}/investor-management`, validInvestorData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log('✅ Valid data test successful');
      console.log('📧 Email sent:', validResponse.data.emailSent);
    } catch (validError) {
      console.log('❌ Valid data test failed:');
      console.log('📊 Status:', validError.response?.status);
      console.log('📝 Response:', validError.response?.data);
      
      if (validError.response?.data?.errors) {
        console.log('\n🔍 Validation Errors:');
        validError.response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. Field: ${error.path || error.param}`);
          console.log(`      Message: ${error.msg}`);
          console.log(`      Value: ${error.value}`);
        });
      }
    }

    // Step 3: Test common validation issues
    console.log('\n3️⃣ Testing Common Validation Issues');

    const testCases = [
      {
        name: 'Short First Name',
        data: { ...validInvestorData, firstName: 'J' },
        expectedError: 'First name must be between 2 and 50 characters'
      },
      {
        name: 'Invalid Email',
        data: { ...validInvestorData, email: 'invalid-email' },
        expectedError: 'Please provide a valid email address'
      },
      {
        name: 'Invalid Phone',
        data: { ...validInvestorData, phone: 'invalid-phone' },
        expectedError: 'Please provide a valid phone number'
      },
      {
        name: 'Invalid CNIC Format',
        data: { ...validInvestorData, cnic: '12345-invalid' },
        expectedError: 'CNIC must be in format: 12345-1234567-1'
      },
      {
        name: 'Short Address',
        data: { ...validInvestorData, address: 'Short' },
        expectedError: 'Address must be between 10 and 200 characters'
      },
      {
        name: 'Invalid Date of Birth',
        data: { ...validInvestorData, dateOfBirth: '2010-01-01' },
        expectedError: 'Age must be between 18 and 100 years'
      },
      {
        name: 'Low Investment Amount',
        data: { ...validInvestorData, initialInvestmentAmount: 500 },
        expectedError: 'Initial investment amount must be between $1,000 and $10,000,000'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🧪 Testing: ${testCase.name}`);
      try {
        await axios.post(`${baseURL}/investor-management`, testCase.data, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        console.log(`❌ ${testCase.name}: Should have failed validation`);
      } catch (error) {
        if (error.response?.status === 400) {
          console.log(`✅ ${testCase.name}: Validation working correctly`);
          if (error.response.data.errors) {
            const relevantError = error.response.data.errors.find(err => 
              err.msg.includes(testCase.expectedError.split(' ')[0])
            );
            if (relevantError) {
              console.log(`   📝 Error: ${relevantError.msg}`);
            }
          }
        } else {
          console.log(`⚠️ ${testCase.name}: Unexpected status ${error.response?.status}`);
        }
      }
    }

    console.log('\n📋 Validation Requirements Summary:');
    console.log('✅ firstName: 2-50 characters, letters and spaces only');
    console.log('✅ lastName: 2-50 characters, letters and spaces only');
    console.log('✅ email: Valid email format, max 100 characters');
    console.log('✅ phone: Valid phone number format (+1234567890)');
    console.log('✅ cnic: Format 12345-1234567-1');
    console.log('✅ address: 10-200 characters');
    console.log('✅ dateOfBirth: Valid date, age 18-100 years');
    console.log('✅ initialInvestmentAmount: $1,000 - $10,000,000 (optional)');
    console.log('✅ investmentPreferences: Optional object with specific values');
    console.log('✅ notes: Max 500 characters (optional)');

  } catch (error) {
    console.error('❌ Debug validation test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

debugValidationError();
