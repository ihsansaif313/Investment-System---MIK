/**
 * Fix User Roles for Demo Data
 * Update admin users to have superadmin role so they can access companies endpoint
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

async function fixUserRoles() {
  try {
    console.log('🔧 Fixing User Roles for Demo Data...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Find admin demo users
    const adminEmails = ['admin.demo@investpro.com', 'manager.demo@investpro.com'];
    
    for (const email of adminEmails) {
      const user = await User.findOne({ email });
      if (user) {
        console.log(`👤 Found user: ${user.firstName} ${user.lastName} (${email})`);
        
        // Update their role to superadmin
        const role = await Role.findOne({ userId: user._id });
        if (role) {
          role.type = 'superadmin';
          role.permissions = [
            'create_company', 'edit_company', 'delete_company', 'view_all_companies',
            'create_investment', 'edit_investment', 'delete_investment', 'view_all_investments',
            'manage_users', 'view_analytics', 'generate_reports', 'manage_admins',
            'system_settings', 'global_analytics'
          ];
          await role.save();
          console.log(`✅ Updated ${user.firstName} to superadmin role`);
        } else {
          // Create new superadmin role
          const newRole = new Role({
            userId: user._id,
            type: 'superadmin',
            permissions: [
              'create_company', 'edit_company', 'delete_company', 'view_all_companies',
              'create_investment', 'edit_investment', 'delete_investment', 'view_all_investments',
              'manage_users', 'view_analytics', 'generate_reports', 'manage_admins',
              'system_settings', 'global_analytics'
            ],
            status: 'active'
          });
          await newRole.save();
          console.log(`✅ Created superadmin role for ${user.firstName}`);
        }
      } else {
        console.log(`❌ User not found: ${email}`);
      }
    }

    // Verify the changes
    console.log('\n📊 Verification:');
    const superadminRoles = await Role.find({ type: 'superadmin' }).populate('userId', 'firstName lastName email');
    console.log(`👑 Superadmin users: ${superadminRoles.length}`);
    superadminRoles.forEach(role => {
      console.log(`   ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
    });

    console.log('\n✅ User roles fixed successfully!');
    console.log('🎯 Admin users can now access companies endpoint');

  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixUserRoles();
