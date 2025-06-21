/**
 * Test First-Time Login Response
 * Test the response structure for first-time login vs regular login
 */

const axios = require('axios');
const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

const baseURL = 'http://localhost:3001/api';

async function testFirstTimeLoginResponse() {
  try {
    console.log('🧪 Testing First-Time Login Response Structure\n');

    // Create a test investor with first-time login flag
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      emailVerified: { type: Boolean, default: false },
      accountStatus: { type: String, default: 'pending_setup' },
      isFirstLogin: { type: Boolean, default: false }
    }, { timestamps: true });

    const roleSchema = new mongoose.Schema({
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: String,
      status: { type: String, default: 'active' }
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);
    const Role = mongoose.model('Role', roleSchema);

    const uniqueEmail = `firsttime.response.${Date.now()}@example.com`;
    const tempPassword = 'TempPassword123!';
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const testUser = new User({
      email: uniqueEmail,
      password: hashedPassword,
      firstName: 'FirstTime',
      lastName: 'Response',
      emailVerified: true,
      accountStatus: 'pending_setup',
      isFirstLogin: true
    });

    await testUser.save();

    const testRole = new Role({
      userId: testUser._id,
      type: 'investor',
      status: 'active'
    });

    await testRole.save();

    console.log('✅ Test user created for first-time login');
    console.log('📧 Email:', uniqueEmail);

    await mongoose.connection.close();

    // Test first-time login
    console.log('\n🔐 Testing First-Time Login Response');
    
    const firstLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: uniqueEmail,
      password: tempPassword
    });

    console.log('\n📊 First-Time Login Response Structure:');
    console.log(JSON.stringify(firstLoginResponse.data, null, 2));

    console.log('\n🔍 Response Analysis:');
    console.log('✅ success:', firstLoginResponse.data.success);
    console.log('✅ requiresPasswordSetup:', firstLoginResponse.data.requiresPasswordSetup);
    console.log('✅ message:', firstLoginResponse.data.message);
    console.log('✅ data.user.id:', firstLoginResponse.data.data?.user?.id);
    console.log('✅ data.user.email:', firstLoginResponse.data.data?.user?.email);
    console.log('✅ data.user.firstName:', firstLoginResponse.data.data?.user?.firstName);
    console.log('✅ data.user.isFirstLogin:', firstLoginResponse.data.data?.user?.isFirstLogin);
    console.log('✅ data.token:', firstLoginResponse.data.data?.token ? 'Present' : 'Missing');
    console.log('✅ data.expiresIn:', firstLoginResponse.data.data?.expiresIn);

    // Compare with regular login response structure
    console.log('\n📋 Frontend Code Fix Needed:');
    console.log('Your frontend should handle both response types:');
    console.log('');
    console.log('```javascript');
    console.log('// Handle login response');
    console.log('const handleLoginResponse = (response) => {');
    console.log('  if (response.data.requiresPasswordSetup) {');
    console.log('    // First-time login - redirect to password setup');
    console.log('    const userId = response.data.data.user.id;');
    console.log('    const token = response.data.data.token;');
    console.log('    const expiresIn = response.data.data.expiresIn;');
    console.log('    ');
    console.log('    // Store temporary token');
    console.log('    localStorage.setItem("tempToken", token);');
    console.log('    localStorage.setItem("tempUserId", userId);');
    console.log('    ');
    console.log('    // Redirect to password setup page');
    console.log('    window.location.href = "/setup-password";');
    console.log('  } else {');
    console.log('    // Regular login - proceed normally');
    console.log('    const userId = response.data.data.user.id;');
    console.log('    const token = response.data.data.token;');
    console.log('    const userRole = response.data.data.user.role.type;');
    console.log('    ');
    console.log('    // Store regular session');
    console.log('    localStorage.setItem("authToken", token);');
    console.log('    localStorage.setItem("userId", userId);');
    console.log('    localStorage.setItem("userRole", userRole);');
    console.log('    ');
    console.log('    // Redirect to dashboard');
    console.log('    window.location.href = "/dashboard";');
    console.log('  }');
    console.log('};');
    console.log('```');

    console.log('\n🎯 Key Differences:');
    console.log('1. First-time login has `requiresPasswordSetup: true`');
    console.log('2. First-time login has limited user data (no role info)');
    console.log('3. First-time login token expires in 15 minutes');
    console.log('4. Regular login has complete user and role data');

    console.log('\n💡 Frontend Error Fix:');
    console.log('The error "Cannot read properties of undefined (reading \'id\')" happens because:');
    console.log('- Your frontend expects `response.data.data.user.id`');
    console.log('- But it\'s trying to access it without checking `requiresPasswordSetup`');
    console.log('- Add the conditional check shown above to fix this!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

testFirstTimeLoginResponse();
