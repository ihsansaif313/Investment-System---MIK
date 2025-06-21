/**
 * Fix Admin Role
 * Create missing role for admin user
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

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing Admin Role...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ email: 'ihsansaif@gmail.com' });
    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    console.log(`👤 Found admin user: ${adminUser.email}`);

    // Check if role already exists
    const existingRole = await Role.findOne({ userId: adminUser._id });
    if (existingRole) {
      console.log(`✅ Role already exists: ${existingRole.type}`);
      return;
    }

    // Create superadmin role
    const newRole = new Role({
      userId: adminUser._id,
      type: 'superadmin',
      permissions: [
        'create_company',
        'edit_company', 
        'delete_company',
        'view_all_companies',
        'create_investment',
        'edit_investment',
        'delete_investment', 
        'view_all_investments',
        'manage_users',
        'view_analytics',
        'generate_reports',
        'manage_assets'
      ],
      status: 'active'
    });

    await newRole.save();
    console.log('✅ Superadmin role created successfully');

    // Verify the role
    const verifyRole = await Role.findOne({ userId: adminUser._id });
    console.log(`\n📊 Role verification:`);
    console.log(`   User: ${adminUser.email}`);
    console.log(`   Role Type: ${verifyRole.type}`);
    console.log(`   Status: ${verifyRole.status}`);
    console.log(`   Permissions: ${verifyRole.permissions.length} permissions`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixAdminRole();
