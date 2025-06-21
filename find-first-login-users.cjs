/**
 * Find Users with First Login True
 */

const mongoose = require('./backend/node_modules/mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  isFirstLogin: Boolean,
  accountStatus: String,
  emailVerified: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function findFirstLoginUsers() {
  try {
    console.log('🔍 Finding Users with isFirstLogin: true...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Find users with isFirstLogin: true
    const firstLoginUsers = await User.find({ isFirstLogin: true });
    
    console.log(`\n📊 Found ${firstLoginUsers.length} users with isFirstLogin: true:`);
    
    if (firstLoginUsers.length === 0) {
      console.log('✅ No users need password setup - all have completed first login');
    } else {
      firstLoginUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Status: ${user.accountStatus}`);
        console.log(`   Email Verified: ${user.emailVerified}`);
        console.log(`   Created: ${user.createdAt}`);
      });
      
      console.log('\n🎯 You can test password setup with any of these users');
    }

    // Also find all users for reference
    const allUsers = await User.find();
    console.log(`\n📊 All users summary:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - isFirstLogin: ${user.isFirstLogin} - status: ${user.accountStatus}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

findFirstLoginUsers();
