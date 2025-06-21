/**
 * Check User Roles in Database
 * Verify what roles our demo users have
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define schemas
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String,
  permissions: [String],
  status: String
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function checkUserRoles() {
  try {
    console.log('🔍 Checking User Roles...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get all users with their roles
    const users = await User.find();
    console.log(`📊 Found ${users.length} users\n`);

    for (const user of users) {
      const role = await Role.findOne({ userId: user._id });
      console.log(`👤 ${user.firstName} ${user.lastName} (${user.email})`);
      if (role) {
        console.log(`   Role: ${role.type}`);
        console.log(`   Status: ${role.status}`);
        console.log(`   Permissions: ${role.permissions.length} permissions`);
      } else {
        console.log(`   ❌ No role found!`);
      }
      console.log('');
    }

    // Check if we have any superadmin users
    const superadminRoles = await Role.find({ type: 'superadmin' }).populate('userId', 'firstName lastName email');
    console.log(`👑 Superadmin users: ${superadminRoles.length}`);
    superadminRoles.forEach(role => {
      console.log(`   ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
    });

    // Check if we have any admin users
    const adminRoles = await Role.find({ type: 'admin' }).populate('userId', 'firstName lastName email');
    console.log(`\n🔧 Admin users: ${adminRoles.length}`);
    adminRoles.forEach(role => {
      console.log(`   ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
    });

    // Check if we have any investor users
    const investorRoles = await Role.find({ type: 'investor' }).populate('userId', 'firstName lastName email');
    console.log(`\n💰 Investor users: ${investorRoles.length}`);
    investorRoles.forEach(role => {
      console.log(`   ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
    });

  } catch (error) {
    console.error('❌ Error checking user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUserRoles();
