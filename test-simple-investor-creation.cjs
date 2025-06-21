/**
 * Test Simple Investor Creation
 * Simple test to create an investor with proper validation
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testSimpleInvestorCreation() {
  try {
    console.log('🧪 Testing Simple Investor Creation\n');

    // Step 1: Admin login
    console.log('1️⃣ Admin Login');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Step 2: Create investor with unique data
    console.log('\n2️⃣ Creating Investor');
    
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const investorData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `john.doe.${timestamp}@example.com`,
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
      notes: 'Test investor created via API'
    };

    console.log('📝 Investor data:');
    console.log(`   Name: ${investorData.firstName} ${investorData.lastName}`);
    console.log(`   Email: ${investorData.email}`);
    console.log(`   Phone: ${investorData.phone}`);
    console.log(`   CNIC: ${investorData.cnic}`);

    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ Investor created successfully!');
    console.log('📧 Email sent:', createResponse.data.emailSent);
    console.log('👤 Investor ID:', createResponse.data.data.user.id);
    console.log('🔑 Temporary password:', createResponse.data.temporaryPassword || 'Sent via email');
    console.log('📊 Account status:', createResponse.data.data.user.accountStatus);
    console.log('🔐 First login required:', createResponse.data.data.user.isFirstLogin);

    console.log('\n🎯 Success! The investor creation is working properly.');
    console.log('\n📋 For your frontend, use this exact format:');
    console.log('```javascript');
    console.log('const investorData = {');
    console.log('  firstName: "John",');
    console.log('  lastName: "Doe",');
    console.log('  email: `investor.${Date.now()}@example.com`,');
    console.log('  phone: `+1234567${Date.now().toString().slice(-3)}`,');
    console.log('  cnic: `12345-${Date.now().toString().slice(-7)}-1`,');
    console.log('  address: "123 Main Street, City, Country",');
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
    console.error('❌ Investor creation failed:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Message:', error.response.data?.message);
      
      if (error.response.data?.errors) {
        console.log('\n🔍 Validation Errors:');
        error.response.data.errors.forEach((err, index) => {
          console.log(`   ${index + 1}. ${err.path || err.param}: ${err.msg}`);
          if (err.value !== undefined) {
            console.log(`      Value: "${err.value}"`);
          }
        });
        
        console.log('\n💡 Common fixes:');
        console.log('• firstName/lastName: Must be 2-50 characters, letters only');
        console.log('• email: Must be valid email format and unique');
        console.log('• phone: Must start with + and be valid format');
        console.log('• cnic: Must be exactly 12345-1234567-1 format and unique');
        console.log('• address: Must be 10-200 characters');
        console.log('• dateOfBirth: Must be valid date, age 18-100');
        console.log('• initialInvestmentAmount: Must be $1,000-$10,000,000');
      }
      
      if (error.response.status === 429) {
        console.log('\n⚠️ RATE LIMITED: Wait 1 hour or restart backend server');
      }
      
      if (error.response.status === 409) {
        console.log('\n⚠️ DUPLICATE: Email or CNIC already exists, use unique values');
      }
      
      if (error.response.status === 401) {
        console.log('\n⚠️ AUTHENTICATION: Run "node init-database.cjs && node verify-admin-email.cjs"');
      }
    }
  }
}

testSimpleInvestorCreation();
