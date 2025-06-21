/**
 * Fix role statuses in the database
 */

import mongoose from 'mongoose';
import { Role } from '../models/index.js';

const fixRoleStatuses = async () => {
  try {
    console.log('🔧 Fixing role statuses in database...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all roles with undefined status
    const rolesWithoutStatus = await Role.find({
      $or: [
        { status: { $exists: false } },
        { status: undefined },
        { status: null }
      ]
    }).populate('userId', 'firstName lastName email');
    
    console.log(`\n📊 Found ${rolesWithoutStatus.length} roles without proper status:`);
    
    for (const role of rolesWithoutStatus) {
      console.log(`\n🔧 Fixing role for ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
      console.log(`  Type: ${role.type}`);
      console.log(`  Current Status: ${role.status}`);
      
      // Set status to 'active' for all existing roles
      role.status = 'active';
      await role.save();
      
      console.log(`  ✅ Updated Status: ${role.status}`);
    }

    if (rolesWithoutStatus.length === 0) {
      console.log('\n✅ All roles already have proper status');
    } else {
      console.log(`\n🎉 Successfully fixed ${rolesWithoutStatus.length} role statuses`);
    }

    // Verify the fix
    console.log('\n🔍 Verifying fixes...');
    const allRoles = await Role.find({}).populate('userId', 'firstName lastName email');
    
    allRoles.forEach((role, index) => {
      console.log(`\n✅ Role ${index + 1}:`);
      console.log(`  User: ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
      console.log(`  Type: ${role.type}`);
      console.log(`  Status: ${role.status}`);
    });

  } catch (error) {
    console.error('❌ Error fixing role statuses:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the fix
fixRoleStatuses();
