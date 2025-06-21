/**
 * Check Roles in Database
 */

const mongoose = require('./backend/node_modules/mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String
}, { timestamps: true });

// Role Schema
const roleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['superadmin', 'admin', 'investor'], required: true },
  permissions: [String],
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function checkRoles() {
  try {
    console.log('🔍 Checking Roles in Database...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get all roles
    const roles = await Role.find().populate('userId', 'email firstName lastName');

    console.log(`\n📊 Found ${roles.length} roles:`);
    
    roles.forEach((role, index) => {
      console.log(`\n${index + 1}. Role ID: ${role._id}`);
      console.log(`   User: ${role.userId?.email || 'USER NOT FOUND'}`);
      console.log(`   Name: ${role.userId?.firstName} ${role.userId?.lastName}`);
      console.log(`   Type: ${role.type}`);
      console.log(`   Status: ${role.status}`);
      console.log(`   Permissions: ${role.permissions.join(', ') || 'None'}`);
      console.log(`   Created: ${role.createdAt}`);
    });

    // Check for admin user specifically
    const adminUser = await User.findOne({ email: 'ihsansaif@gmail.com' });
    if (adminUser) {
      const adminRole = await Role.findOne({ userId: adminUser._id });
      console.log(`\n🔍 Admin user role check:`);
      console.log(`   User ID: ${adminUser._id}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role found: ${!!adminRole}`);
      if (adminRole) {
        console.log(`   Role type: ${adminRole.type}`);
        console.log(`   Role status: ${adminRole.status}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkRoles();
