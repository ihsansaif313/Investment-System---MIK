/**
 * Check roles in the database
 */

import mongoose from 'mongoose';
import { Role, User } from '../models/index.js';

const checkRoles = async () => {
  try {
    console.log('🔍 Checking roles in database...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all roles
    const roles = await Role.find({}).populate('userId', 'firstName lastName email');
    
    console.log(`\n📊 Found ${roles.length} roles:`);
    
    roles.forEach((role, index) => {
      console.log(`\n🎭 Role ${index + 1}:`);
      console.log(`  Type: ${role.type}`);
      console.log(`  Status: ${role.status}`);
      console.log(`  User: ${role.userId?.firstName} ${role.userId?.lastName} (${role.userId?.email})`);
      console.log(`  Permissions: ${role.permissions?.join(', ') || 'None'}`);
      console.log(`  Created: ${role.createdAt}`);
    });

    if (roles.length === 0) {
      console.log('\n❌ No roles found in database');
      console.log('💡 You may need to assign roles to users');
    }

    // Check for users without roles
    const users = await User.find({});
    const userIdsWithRoles = roles.map(role => role.userId?._id?.toString()).filter(Boolean);
    const usersWithoutRoles = users.filter(user => !userIdsWithRoles.includes(user._id.toString()));

    if (usersWithoutRoles.length > 0) {
      console.log(`\n⚠️ Found ${usersWithoutRoles.length} users without roles:`);
      usersWithoutRoles.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking roles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the check
checkRoles();
