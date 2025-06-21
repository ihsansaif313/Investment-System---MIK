/**
 * Check All Users in Database
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

// Role Schema
const roleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['superadmin', 'admin', 'investor'], required: true },
  status: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function checkAllUsers() {
  try {
    console.log('🔍 Checking All Users in Database...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find();
    console.log(`\n📊 Found ${users.length} users:`);
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const role = await Role.findOne({ userId: user._id });
      
      console.log(`\n${i + 1}. User: ${user.email}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${role ? role.type : 'NO ROLE'}`);
      console.log(`   Status: ${user.accountStatus}`);
      console.log(`   First Login: ${user.isFirstLogin}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Created: ${user.createdAt}`);
    }

    // Find admin users specifically
    const adminRoles = await Role.find({ type: { $in: ['admin', 'superadmin'] } }).populate('userId');
    console.log(`\n🔑 Admin Users:`);
    
    adminRoles.forEach((role, index) => {
      if (role.userId) {
        console.log(`${index + 1}. ${role.userId.email} - ${role.type} (${role.status})`);
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAllUsers();
