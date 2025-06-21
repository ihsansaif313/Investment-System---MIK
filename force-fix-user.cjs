/**
 * Force Fix User - Direct Database Update
 * Use MongoDB updateOne to directly update the user record
 */

const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

async function forceFixUser() {
  try {
    console.log('🔧 Force Fixing User Record...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2] || 'ihsansaifedwardion3@gmail.com';
    const newPassword = process.argv[3] || 'NewPassword123!';

    console.log(`🔍 Targeting user: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    console.log(`🔐 Password hashed successfully`);

    // Get the users collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check current state
    const currentUser = await usersCollection.findOne({ email });
    if (!currentUser) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`📊 Current state:`);
    console.log(`   - isFirstLogin: ${currentUser.isFirstLogin}`);
    console.log(`   - accountStatus: ${currentUser.accountStatus}`);

    // Force update using direct MongoDB operation
    const updateResult = await usersCollection.updateOne(
      { email },
      {
        $set: {
          password: hashedPassword,
          isFirstLogin: false,
          accountStatus: 'active',
          emailVerified: true,
          lastPasswordChange: new Date(),
          updatedAt: new Date()
        },
        $unset: {
          loginAttempts: "",
          lockUntil: ""
        }
      }
    );

    console.log(`\n🔧 Update result:`);
    console.log(`   - Matched: ${updateResult.matchedCount}`);
    console.log(`   - Modified: ${updateResult.modifiedCount}`);

    if (updateResult.modifiedCount === 0) {
      console.log(`❌ No documents were modified!`);
    } else {
      console.log(`✅ User record updated successfully`);
    }

    // Verify the update
    const updatedUser = await usersCollection.findOne({ email });
    console.log(`\n📊 Updated state:`);
    console.log(`   - isFirstLogin: ${updatedUser.isFirstLogin}`);
    console.log(`   - accountStatus: ${updatedUser.accountStatus}`);
    console.log(`   - emailVerified: ${updatedUser.emailVerified}`);

    // Clear all sessions for this user
    const sessionsCollection = db.collection('sessions');
    const sessionResult = await sessionsCollection.updateMany(
      { userId: new mongoose.Types.ObjectId(currentUser._id) },
      { $set: { isActive: false } }
    );

    console.log(`\n🗑️  Session cleanup:`);
    console.log(`   - Sessions deactivated: ${sessionResult.modifiedCount}`);

    // Test password verification
    const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`\n🔐 Password verification: ${passwordMatch ? '✅ PASS' : '❌ FAIL'}`);

    if (passwordMatch && !updatedUser.isFirstLogin && updatedUser.accountStatus === 'active') {
      console.log(`\n🎉 SUCCESS! User is now ready to login with:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Status: Regular user (no first-time login)`);
    } else {
      console.log(`\n❌ ISSUE: Update may not have worked correctly`);
      console.log(`   - Password match: ${passwordMatch}`);
      console.log(`   - isFirstLogin: ${updatedUser.isFirstLogin}`);
      console.log(`   - accountStatus: ${updatedUser.accountStatus}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

forceFixUser();
