/**
 * Reset user password for testing
 */

import mongoose from 'mongoose';
import { User } from '../models/index.js';

const resetUserPassword = async () => {
  try {
    console.log('🔧 Resetting user passwords for testing...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get users to reset
    const users = await User.find({
      email: { $in: ['ihsansaif@gmail.com', 'arsl@gmail.com'] }
    });
    
    console.log(`\n📊 Found ${users.length} users to reset:`);
    
    for (const user of users) {
      console.log(`\n🔧 Resetting password for ${user.firstName} ${user.lastName} (${user.email})`);
      
      // Set new password
      user.password = '.';

      // Reset login attempts
      user.loginAttempts = 0;
      user.lockUntil = undefined;

      // Ensure email is verified
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;

      // Fill in required fields if missing
      if (!user.address) user.address = 'Test Address';
      if (!user.phone) user.phone = '+1234567890';
      if (!user.dateOfBirth) user.dateOfBirth = new Date('1990-01-01');

      await user.save();
      
      console.log(`  ✅ Password restored to: Ihs@n2553.`);
      console.log(`  ✅ Login attempts reset to: 0`);
      console.log(`  ✅ Email verification confirmed`);
    }

    console.log(`\n🎉 Successfully reset passwords for ${users.length} users`);
    console.log('\n📝 Restored credentials:');
    console.log('  - ihsansaif@gmail.com /  (superadmin)');
    console.log('  - arsl@gmail.com /  (admin)');

  } catch (error) {
    console.error('❌ Error resetting passwords:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the reset
resetUserPassword();
