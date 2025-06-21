/**
 * Create Investor Template
 * Provides a working template for creating investors with unique data
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function createInvestorTemplate() {
  try {
    console.log('📋 Investor Creation Template\n');

    // Generate unique data to avoid conflicts
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);

    const investorData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `investor.${timestamp}@example.com`,
      phone: `+123456${uniqueId}`,
      cnic: `12345-${uniqueId}-1`,
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

    console.log('✅ Template Data (Copy this for your frontend):');
    console.log('```json');
    console.log(JSON.stringify(investorData, null, 2));
    console.log('```\n');

    console.log('📋 Field Requirements:');
    console.log('• firstName: 2-50 characters, letters and spaces only');
    console.log('• lastName: 2-50 characters, letters and spaces only');
    console.log('• email: Valid email format, max 100 characters');
    console.log('• phone: Valid phone number (+1234567890 format)');
    console.log('• cnic: Exactly 12345-1234567-1 format');
    console.log('• address: 10-200 characters');
    console.log('• dateOfBirth: Valid date, age must be 18-100 years');
    console.log('• initialInvestmentAmount: $1,000 - $10,000,000 (optional)');
    console.log('• investmentPreferences: Optional object');
    console.log('• notes: Max 500 characters (optional)\n');

    // Test the template
    console.log('🧪 Testing Template Data...');

    // Admin login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Create investor
    const createResponse = await axios.post(`${baseURL}/investor-management`, investorData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    console.log('✅ Investor created successfully!');
    console.log('📧 Email sent:', createResponse.data.emailSent);
    console.log('👤 Investor ID:', createResponse.data.data.user.id);
    console.log('🔑 Temporary password:', createResponse.data.temporaryPassword || 'Sent via email');

    console.log('\n🎯 Success! Use this template for creating investors.');
    console.log('💡 Tips:');
    console.log('• Always use unique email addresses');
    console.log('• Always use unique CNIC numbers');
    console.log('• Phone numbers should be unique');
    console.log('• Use current timestamp for uniqueness');

  } catch (error) {
    console.error('❌ Template test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
      
      if (error.response.data.errors) {
        console.log('\n🔍 Validation Errors:');
        error.response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. Field: ${error.path || error.param}`);
          console.log(`      Message: ${error.msg}`);
          console.log(`      Value: ${error.value}`);
        });
      }
    }
  }
}

createInvestorTemplate();
