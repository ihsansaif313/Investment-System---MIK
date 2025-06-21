/**
 * Debug Validation Real-Time
 * Test the exact data that's failing validation
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function debugValidationRealTime() {
  try {
    console.log('🔍 Real-Time Validation Debugging\n');

    // Step 1: Admin login
    console.log('1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Test with the debug validation endpoint
    console.log('\n2️⃣ Testing Validation with Debug Endpoint');
    
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `debug.test.${timestamp}@example.com`,
      phone: `+1234567${uniqueId.slice(-3)}`,
      cnic: `12345-${uniqueId}-1`,
      address: '123 Main Street, Test City, Test Country',
      dateOfBirth: '1990-01-01',
      investmentPreferences: {
        riskTolerance: 'medium',
        preferredSectors: ['Technology'],
        investmentGoals: ['Wealth Building'],
        timeHorizon: 'long'
      },
      initialInvestmentAmount: 10000,
      notes: 'Debug test investor'
    };

    console.log('📝 Test Data:');
    console.log(JSON.stringify(testData, null, 2));

    try {
      const debugResponse = await axios.post(`${baseURL}/investor-management/debug-validation`, testData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('\n✅ Debug Validation Result:');
      console.log('📊 Status:', debugResponse.status);
      console.log('📝 Message:', debugResponse.data.message);
      
      if (debugResponse.data.success) {
        console.log('🎯 Validation PASSED - Your data format is correct!');
        
        // Now try the actual creation
        console.log('\n3️⃣ Attempting Actual Investor Creation');
        try {
          const createResponse = await axios.post(`${baseURL}/investor-management`, testData, {
            headers: { 
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('✅ Investor created successfully!');
          console.log('👤 Investor ID:', createResponse.data.data.user.id);
          
        } catch (createError) {
          console.log('❌ Actual creation failed:');
          console.log('📊 Status:', createError.response?.status);
          console.log('📝 Message:', createError.response?.data?.message);
          
          if (createError.response?.status === 429) {
            console.log('⚠️ RATE LIMITED: This is the issue! Wait 1 hour or restart backend.');
          } else if (createError.response?.status === 409) {
            console.log('⚠️ DUPLICATE DATA: Email or CNIC already exists.');
          }
        }
      }

    } catch (debugError) {
      console.log('\n❌ Debug Validation Failed:');
      console.log('📊 Status:', debugError.response?.status);
      console.log('📝 Message:', debugError.response?.data?.message);
      
      if (debugError.response?.data?.errors) {
        console.log('\n🔍 Detailed Validation Errors:');
        debugError.response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. Field: ${error.path || error.param}`);
          console.log(`      Message: ${error.msg}`);
          console.log(`      Value: "${error.value}"`);
          console.log(`      Location: ${error.location}`);
        });
        
        console.log('\n💡 SOLUTIONS:');
        debugError.response.data.errors.forEach((error) => {
          const field = error.path || error.param;
          const value = error.value;
          
          if (field === 'firstName' || field === 'lastName') {
            console.log(`   • ${field}: Use only letters and spaces, 2-50 characters`);
            console.log(`     Current: "${value}" → Try: "John" or "Mary Jane"`);
          } else if (field === 'email') {
            console.log(`   • email: Use valid email format`);
            console.log(`     Current: "${value}" → Try: "user.${Date.now()}@example.com"`);
          } else if (field === 'phone') {
            console.log(`   • phone: Use +1234567890 format`);
            console.log(`     Current: "${value}" → Try: "+1234567890"`);
          } else if (field === 'cnic') {
            console.log(`   • cnic: Use 12345-1234567-1 format`);
            console.log(`     Current: "${value}" → Try: "12345-${Date.now().toString().slice(-7)}-1"`);
          } else if (field === 'address') {
            console.log(`   • address: Use 10-200 characters`);
            console.log(`     Current: "${value}" → Try: "123 Main Street, City, Country"`);
          } else if (field === 'dateOfBirth') {
            console.log(`   • dateOfBirth: Use YYYY-MM-DD format, age 18-100`);
            console.log(`     Current: "${value}" → Try: "1990-01-01"`);
          } else if (field === 'initialInvestmentAmount') {
            console.log(`   • initialInvestmentAmount: Use number 1000-10000000`);
            console.log(`     Current: "${value}" → Try: 10000`);
          }
        });
      }
      
      if (debugError.response?.data?.receivedData) {
        console.log('\n📥 Data Received by Backend:');
        console.log(JSON.stringify(debugError.response.data.receivedData, null, 2));
      }
    }

    // Step 3: Provide working template
    console.log('\n📋 COPY THIS WORKING TEMPLATE:');
    console.log('```javascript');
    console.log('const timestamp = Date.now();');
    console.log('const uniqueId = timestamp.toString().slice(-7);');
    console.log('');
    console.log('const investorData = {');
    console.log('  firstName: "John",');
    console.log('  lastName: "Doe",');
    console.log('  email: `investor.${timestamp}@example.com`,');
    console.log('  phone: `+1234567${uniqueId.slice(-3)}`,');
    console.log('  cnic: `12345-${uniqueId}-1`,');
    console.log('  address: "123 Main Street, Test City, Test Country",');
    console.log('  dateOfBirth: "1990-01-01",');
    console.log('  investmentPreferences: {');
    console.log('    riskTolerance: "medium",');
    console.log('    preferredSectors: ["Technology"],');
    console.log('    investmentGoals: ["Wealth Building"],');
    console.log('    timeHorizon: "long"');
    console.log('  },');
    console.log('  initialInvestmentAmount: 10000,');
    console.log('  notes: "Investor created via frontend"');
    console.log('};');
    console.log('```');

  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

debugValidationRealTime();
