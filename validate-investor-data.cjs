/**
 * Validate Investor Data
 * Real-time validation checker to identify exact validation issues
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

// Validation functions (matching backend validation)
function validateInvestorData(data) {
  const errors = [];

  // firstName validation
  if (!data.firstName || data.firstName.trim().length < 2 || data.firstName.trim().length > 50) {
    errors.push('firstName: Must be between 2 and 50 characters');
  }
  if (data.firstName && !/^[a-zA-Z\s]+$/.test(data.firstName)) {
    errors.push('firstName: Can only contain letters and spaces');
  }

  // lastName validation
  if (!data.lastName || data.lastName.trim().length < 2 || data.lastName.trim().length > 50) {
    errors.push('lastName: Must be between 2 and 50 characters');
  }
  if (data.lastName && !/^[a-zA-Z\s]+$/.test(data.lastName)) {
    errors.push('lastName: Can only contain letters and spaces');
  }

  // email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.push('email: Must be a valid email address');
  }
  if (data.email && data.email.length > 100) {
    errors.push('email: Must be less than 100 characters');
  }

  // phone validation
  if (!data.phone || !/^[\+]?[1-9][\d]{0,15}$/.test(data.phone)) {
    errors.push('phone: Must be a valid phone number (e.g., +1234567890)');
  }

  // cnic validation
  if (!data.cnic || !/^\d{5}-\d{7}-\d{1}$/.test(data.cnic)) {
    errors.push('cnic: Must be in format 12345-1234567-1');
  }

  // address validation
  if (!data.address || data.address.trim().length < 10 || data.address.trim().length > 200) {
    errors.push('address: Must be between 10 and 200 characters');
  }

  // dateOfBirth validation
  if (!data.dateOfBirth) {
    errors.push('dateOfBirth: Is required');
  } else {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18 || age > 100) {
      errors.push('dateOfBirth: Age must be between 18 and 100 years');
    }
  }

  // initialInvestmentAmount validation (optional)
  if (data.initialInvestmentAmount !== undefined && data.initialInvestmentAmount !== null) {
    if (isNaN(data.initialInvestmentAmount)) {
      errors.push('initialInvestmentAmount: Must be a number');
    } else if (data.initialInvestmentAmount < 1000 || data.initialInvestmentAmount > 10000000) {
      errors.push('initialInvestmentAmount: Must be between $1,000 and $10,000,000');
    }
  }

  // investmentPreferences validation (optional)
  if (data.investmentPreferences) {
    if (data.investmentPreferences.riskTolerance && 
        !['low', 'medium', 'high'].includes(data.investmentPreferences.riskTolerance)) {
      errors.push('investmentPreferences.riskTolerance: Must be low, medium, or high');
    }
    if (data.investmentPreferences.timeHorizon && 
        !['short', 'medium', 'long'].includes(data.investmentPreferences.timeHorizon)) {
      errors.push('investmentPreferences.timeHorizon: Must be short, medium, or long');
    }
  }

  // notes validation (optional)
  if (data.notes && data.notes.length > 500) {
    errors.push('notes: Cannot exceed 500 characters');
  }

  return errors;
}

async function validateAndTestInvestor() {
  try {
    console.log('🔍 Real-Time Investor Data Validator\n');

    // Test data that should work
    const timestamp = Date.now();
    const uniqueId = timestamp.toString().slice(-7);
    
    const testData = {
      firstName: 'John',
      lastName: 'Doe',
      email: `test.${timestamp}@example.com`,
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
      notes: 'Test investor'
    };

    console.log('📝 Test Data:');
    console.log(JSON.stringify(testData, null, 2));

    // Validate locally first
    console.log('\n🔍 Local Validation Check:');
    const localErrors = validateInvestorData(testData);
    if (localErrors.length > 0) {
      console.log('❌ Local validation failed:');
      localErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      return;
    } else {
      console.log('✅ Local validation passed');
    }

    // Test with backend
    console.log('\n🔗 Backend Validation Test:');
    
    // Admin login
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Admin authenticated');

    // Test investor creation
    try {
      const createResponse = await axios.post(`${baseURL}/investor-management`, testData, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Backend validation passed');
      console.log('👤 Investor created:', createResponse.data.data.user.id);
      console.log('📧 Email sent:', createResponse.data.emailSent);

    } catch (backendError) {
      console.log('❌ Backend validation failed');
      console.log('📊 Status:', backendError.response?.status);
      console.log('📝 Message:', backendError.response?.data?.message);

      if (backendError.response?.data?.errors) {
        console.log('\n🔍 Backend Validation Errors:');
        backendError.response.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. Field: ${error.path || error.param}`);
          console.log(`      Message: ${error.msg}`);
          console.log(`      Value: "${error.value}"`);
        });
      }

      // Provide specific solutions
      if (backendError.response?.status === 429) {
        console.log('\n💡 SOLUTION: Rate limited - wait 1 hour or restart backend');
      } else if (backendError.response?.status === 409) {
        console.log('\n💡 SOLUTION: Duplicate data - use unique email/CNIC');
      } else if (backendError.response?.status === 400) {
        console.log('\n💡 SOLUTION: Fix validation errors listed above');
      }
    }

    // Provide working template
    console.log('\n📋 WORKING TEMPLATE FOR YOUR FRONTEND:');
    console.log('Copy this exact code:');
    console.log('```javascript');
    console.log('// Generate unique values');
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

    console.log('\n🎯 VALIDATION CHECKLIST:');
    console.log('✅ firstName: 2-50 chars, letters/spaces only');
    console.log('✅ lastName: 2-50 chars, letters/spaces only');
    console.log('✅ email: Valid format, unique, <100 chars');
    console.log('✅ phone: +1234567890 format, unique');
    console.log('✅ cnic: 12345-1234567-1 format, unique');
    console.log('✅ address: 10-200 characters');
    console.log('✅ dateOfBirth: Valid date, age 18-100');
    console.log('✅ initialInvestmentAmount: $1,000-$10,000,000 (optional)');
    console.log('✅ investmentPreferences: Valid values (optional)');
    console.log('✅ notes: <500 characters (optional)');

  } catch (error) {
    console.error('❌ Validation test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

validateAndTestInvestor();
