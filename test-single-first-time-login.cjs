/**
 * Test Single First-Time Login
 * Simple test to check first-time login detection
 */

const axios = require('axios');
const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

const baseURL = 'http://localhost:3001/api';

async function testSingleFirstTimeLogin() {
  try {
    console.log('🧪 Testing Single First-Time Login\n');

    // Connect to database and create a unique test user
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

    // Create unique test user
    const uniqueEmail = `single.test.${Date.now()}@example.com`;
    const tempPassword = 'SingleTest123!';
    
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const testUser = new User({
      email: uniqueEmail,
      password: hashedPassword,
      firstName: 'Single',
      lastName: 'Test',
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

    console.log('✅ Test user created:');
    console.log('   Email:', uniqueEmail);
    console.log('   Password:', tempPassword);
    console.log('   isFirstLogin:', testUser.isFirstLogin);

    await mongoose.connection.close();

    // Wait a moment to avoid rate limiting
    console.log('\n⏳ Waiting to avoid rate limiting...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test login
    console.log('\n🔐 Testing Login...');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: uniqueEmail,
      password: tempPassword
    });

    console.log('\n📊 Login Response:');
    console.log('   Success:', loginResponse.data.success);
    console.log('   Requires Password Setup:', loginResponse.data.requiresPasswordSetup);
    
    if (loginResponse.data.requiresPasswordSetup) {
      console.log('✅ First-time login detected correctly!');
      console.log('📝 Message:', loginResponse.data.message);
    } else {
      console.log('❌ First-time login should require password setup');
      console.log('📝 Full response:', JSON.stringify(loginResponse.data, null, 2));
    }

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

testSingleFirstTimeLogin();
