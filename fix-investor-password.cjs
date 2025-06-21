/**
 * Fix Investor Password Issue
 * Manually reset investor password and clear first-login flag
 */

const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

// User Schema (simplified for this script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isFirstLogin: { type: Boolean, default: false },
  accountStatus: { type: String, default: 'active' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Session Schema
const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true },
  isTemporary: { type: Boolean, default: false }
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

async function fixInvestorPassword() {
  try {
    console.log('🔧 Fixing Investor Password Issue...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get the investor email from command line or use the one from logs
    const email = process.argv[2] || 'ihsansaifedwardion3@gmail.com';
    const newPassword = process.argv[3] || 'NewPassword123!';

    console.log(`🔍 Looking for user: ${email}`);

    // Find the investor
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName}`);
    console.log(`📊 Current status:`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - isFirstLogin: ${user.isFirstLogin}`);
    console.log(`   - accountStatus: ${user.accountStatus}`);
    console.log(`   - emailVerified: ${user.emailVerified}`);

    // Update the user
    console.log(`\n🔧 Updating user...`);
    
    // Set the new password
    user.password = newPassword;
    user.isFirstLogin = false;
    user.accountStatus = 'active';
    user.emailVerified = true;
    
    // Explicitly mark fields as modified
    user.markModified('password');
    user.markModified('isFirstLogin');
    user.markModified('accountStatus');
    user.markModified('emailVerified');
    
    // Save the user
    await user.save();
    console.log(`✅ User saved successfully`);

    // Deactivate all existing sessions
    const sessionResult = await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );
    console.log(`✅ Deactivated ${sessionResult.modifiedCount} existing sessions`);

    // Verify the changes by fetching fresh data
    const updatedUser = await User.findById(user._id);
    console.log(`\n📊 Updated status:`);
    console.log(`   - isFirstLogin: ${updatedUser.isFirstLogin}`);
    console.log(`   - accountStatus: ${updatedUser.accountStatus}`);
    console.log(`   - emailVerified: ${updatedUser.emailVerified}`);

    // Test the new password
    const passwordTest = await updatedUser.comparePassword(newPassword);
    console.log(`   - Password verification: ${passwordTest ? '✅ PASS' : '❌ FAIL'}`);

    if (passwordTest && !updatedUser.isFirstLogin) {
      console.log(`\n🎉 SUCCESS! User can now login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   No more first-time login required!`);
    } else {
      console.log(`\n❌ ISSUE: Something went wrong with the update`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Usage instructions
if (process.argv.length < 3) {
  console.log('Usage: node fix-investor-password.cjs <email> [new-password]');
  console.log('Example: node fix-investor-password.cjs ihsansaifedwardion3@gmail.com NewPassword123!');
  console.log('\nIf no password provided, will use: NewPassword123!');
}

fixInvestorPassword();
