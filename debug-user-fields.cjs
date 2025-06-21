/**
 * Debug User Fields
 * Check what fields are actually being read from the database
 */

const mongoose = require('./backend/node_modules/mongoose');

async function debugUserFields() {
  try {
    console.log('🔍 Debugging User Fields\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    
    // Get the latest user with isFirstLogin = true
    const User = mongoose.model('User');
    const users = await User.find({ isFirstLogin: true }).sort({ createdAt: -1 }).limit(3);
    
    console.log(`Found ${users.length} users with isFirstLogin = true:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log('   ID:', user._id);
      console.log('   Email:', user.email);
      console.log('   First Name:', user.firstName);
      console.log('   Last Name:', user.lastName);
      console.log('   isFirstLogin:', user.isFirstLogin);
      console.log('   accountStatus:', user.accountStatus);
      console.log('   emailVerified:', user.emailVerified);
      console.log('   Created At:', user.createdAt);
      
      // Check all fields
      console.log('   All fields:', Object.keys(user.toObject()));
    });

    // Also check the User schema
    console.log('\n📋 User Schema Paths:');
    const schema = User.schema;
    console.log('   Schema paths:', Object.keys(schema.paths));
    
    // Check if isFirstLogin is in the schema
    if (schema.paths.isFirstLogin) {
      console.log('   ✅ isFirstLogin field exists in schema');
      console.log('   Type:', schema.paths.isFirstLogin.instance);
      console.log('   Default:', schema.paths.isFirstLogin.defaultValue);
    } else {
      console.log('   ❌ isFirstLogin field NOT found in schema');
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }
}

debugUserFields();
