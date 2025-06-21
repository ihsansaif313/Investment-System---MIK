/**
 * Check User Status in Database
 * Verify what's actually stored in the database
 */

const mongoose = require('./backend/node_modules/mongoose');

// User Schema (matching the actual backend schema)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isFirstLogin: { type: Boolean, default: false },
  accountStatus: { type: String, default: 'active' },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUserStatus() {
  try {
    console.log('🔍 Checking User Status in Database...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get the investor email
    const email = process.argv[2] || 'ihsansaifedwardion3@gmail.com';
    console.log(`🔍 Looking for user: ${email}`);

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user in database:`);
    console.log(`📊 Raw database record:`);
    console.log(JSON.stringify(user.toObject(), null, 2));

    console.log(`\n📊 Key fields:`);
    console.log(`   - _id: ${user._id}`);
    console.log(`   - email: ${user.email}`);
    console.log(`   - firstName: ${user.firstName}`);
    console.log(`   - lastName: ${user.lastName}`);
    console.log(`   - isFirstLogin: ${user.isFirstLogin}`);
    console.log(`   - accountStatus: ${user.accountStatus}`);
    console.log(`   - emailVerified: ${user.emailVerified}`);
    console.log(`   - createdAt: ${user.createdAt}`);
    console.log(`   - updatedAt: ${user.updatedAt}`);

    // Check if there are multiple users with similar emails
    const similarUsers = await User.find({
      email: { $regex: email.split('@')[0], $options: 'i' }
    });

    if (similarUsers.length > 1) {
      console.log(`\n⚠️  Found ${similarUsers.length} users with similar emails:`);
      similarUsers.forEach((u, index) => {
        console.log(`   ${index + 1}. ${u.email} - isFirstLogin: ${u.isFirstLogin} - status: ${u.accountStatus}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUserStatus();
