/**
 * Reset User to First Login State for Testing
 * Temporarily reset a user to test password setup functionality
 */

const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  isFirstLogin: Boolean,
  accountStatus: String,
  emailVerified: Boolean
}, { timestamps: true });

// Session Schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: Boolean
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);

async function resetUserToFirstLogin() {
  try {
    console.log('🔄 Resetting User to First Login State for Testing...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2] || 'ihsansaifedwardion3@gmail.com';
    const tempPassword = process.argv[3] || 'TempPass123!';

    console.log(`🎯 Resetting user: ${email}`);
    console.log(`🔑 Setting temporary password: ${tempPassword}`);

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    console.log(`👤 Found user: ${user.firstName} ${user.lastName}`);

    // Hash the temporary password
    const hashedTempPassword = await bcrypt.hash(tempPassword, 12);

    // Reset user to first login state
    const updateResult = await User.updateOne(
      { email },
      {
        $set: {
          password: hashedTempPassword,
          isFirstLogin: true,
          accountStatus: 'pending_setup',
          emailVerified: true,
          updatedAt: new Date()
        }
      }
    );

    console.log(`📊 Update result: ${updateResult.modifiedCount} user(s) modified`);

    // Deactivate all existing sessions
    const sessionResult = await Session.updateMany(
      { userId: user._id },
      { $set: { isActive: false } }
    );

    console.log(`🗑️  Deactivated ${sessionResult.modifiedCount} existing sessions`);

    // Verify the changes
    const updatedUser = await User.findOne({ email });
    console.log(`\n✅ User reset successfully:`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   isFirstLogin: ${updatedUser.isFirstLogin}`);
    console.log(`   accountStatus: ${updatedUser.accountStatus}`);
    console.log(`   emailVerified: ${updatedUser.emailVerified}`);

    console.log(`\n🎯 Now you can test password setup with:`);
    console.log(`   Email: ${email}`);
    console.log(`   Temporary Password: ${tempPassword}`);
    console.log(`\n📝 Steps to test:`);
    console.log(`1. Go to http://localhost:5174`);
    console.log(`2. Login with the credentials above`);
    console.log(`3. You should be redirected to password setup`);
    console.log(`4. Set a new password`);
    console.log(`5. Check if it works correctly`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Usage: node reset-user-to-first-login.cjs [email] [tempPassword]
resetUserToFirstLogin();
