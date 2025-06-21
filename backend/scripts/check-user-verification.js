/**
 * Check user verification status
 */

import mongoose from 'mongoose';
import { User } from '../models/index.js';

const checkUserVerification = async () => {
  try {
    console.log('🔍 Checking user verification status...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get all users with verification details
    const users = await User.find({}).select('firstName lastName email emailVerified isActive loginAttempts lockUntil');
    
    console.log(`\n📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Email Verified: ${user.emailVerified || false}`);
      console.log(`  Is Active: ${user.isActive !== false}`);
      console.log(`  Login Attempts: ${user.loginAttempts || 0}`);
      console.log(`  Locked Until: ${user.lockUntil || 'Not locked'}`);
      console.log(`  ID: ${user._id}`);
    });

    // Check if any users need verification
    const unverifiedUsers = users.filter(user => !user.emailVerified);
    const lockedUsers = users.filter(user => user.lockUntil && user.lockUntil > new Date());

    if (unverifiedUsers.length > 0) {
      console.log(`\n⚠️ Found ${unverifiedUsers.length} unverified users:`);
      unverifiedUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    }

    if (lockedUsers.length > 0) {
      console.log(`\n🔒 Found ${lockedUsers.length} locked users:`);
      lockedUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - Locked until: ${user.lockUntil}`);
      });
    }

    if (unverifiedUsers.length === 0 && lockedUsers.length === 0) {
      console.log('\n✅ All users are verified and unlocked');
    }

  } catch (error) {
    console.error('❌ Error checking user verification:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the check
checkUserVerification();
