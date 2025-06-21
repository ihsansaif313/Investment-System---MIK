/**
 * Production Database Initialization Script
 * Creates only essential data needed for system operation
 * NO DUMMY DATA - Production Ready
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Role from '../models/Role.js';

// Load environment variables
dotenv.config();

const initializeProductionDatabase = async () => {
  try {
    console.log('🚀 Initializing Production Database...');
    console.log('=' .repeat(60));

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Check if system is already initialized
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️  Database already contains users');
      console.log('💡 Use reset-database.js to clean and reinitialize');
      return {
        success: false,
        message: 'Database already initialized'
      };
    }

    // Create essential super admin user
    console.log('\n📋 Creating essential super admin account...');
    
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
    const superadminUser = new User({
      email: 'superadmin@system.local',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-000-000-0000',
      address: 'System Address',
      isActive: true,
      emailVerified: true,
      lastLogin: new Date()
    });
    await superadminUser.save();

    // Create super admin role
    const superadminRole = new Role({
      userId: superadminUser._id,
      type: 'superadmin',
      isActive: true
    });
    await superadminRole.save();

    console.log('✅ Created essential super admin account');

    // Verify database state
    console.log('\n📊 Verifying production-ready state...');
    const userCount = await User.countDocuments();
    const roleCount = await Role.countDocuments();
    
    console.log(`   👥 Users: ${userCount} (should be 1)`);
    console.log(`   🔑 Roles: ${roleCount} (should be 1)`);

    // Verify no dummy data exists
    const collections = ['subcompanies', 'investments', 'assets', 'ownercompanies'];
    let hasDummyData = false;
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection).countDocuments();
      console.log(`   📁 ${collection}: ${count} documents`);
      if (count > 0) {
        hasDummyData = true;
      }
    }

    if (hasDummyData) {
      console.log('⚠️  Warning: Database contains existing data');
    } else {
      console.log('✅ Database is clean - no dummy data found');
    }

    console.log('\n🎉 Production database initialization completed!');
    console.log('=' .repeat(60));
    console.log('🔑 Super Admin Credentials:');
    console.log('   Email: superadmin@system.local');
    console.log('   Password: SuperAdmin123!');
    console.log('=' .repeat(60));
    console.log('📝 Next Steps:');
    console.log('   1. Login with super admin credentials');
    console.log('   2. Create real user accounts through the interface');
    console.log('   3. Add real companies and investments');
    console.log('   4. All data will be real user data');
    console.log('=' .repeat(60));

    return {
      success: true,
      credentials: {
        email: 'superadmin@system.local',
        password: 'SuperAdmin123!'
      },
      isClean: !hasDummyData
    };

  } catch (error) {
    console.error('❌ Production initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the initialization
initializeProductionDatabase().then((result) => {
  if (result.success) {
    console.log('\n✅ Production database ready for use');
    process.exit(0);
  } else {
    console.error('\n❌ Production initialization failed:', result.error || result.message);
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

export default initializeProductionDatabase;
