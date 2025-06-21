/**
 * Check users in the database
 */

import mongoose from 'mongoose';
import { User } from '../models/index.js';

const checkUsers = async () => {
  try {
    console.log('🔍 Checking users in database...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('firstName lastName email role');
    
    console.log(`\n📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Role: ${user.role || 'No role assigned'}`);
      console.log(`  ID: ${user._id}`);
    });

    if (users.length === 0) {
      console.log('\n❌ No users found in database');
      console.log('💡 You may need to run the seed script to create initial users');
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the check
checkUsers();
