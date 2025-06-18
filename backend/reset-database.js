import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Role from './models/Role.js';
import { OwnerCompany, SubCompany } from './models/Company.js';
import Asset from './models/Asset.js';
import Investment from './models/Investment.js';

dotenv.config();

const resetDatabase = async () => {
  try {
    console.log('🔄 Starting database reset for fresh installation validation...');
    console.log('=' .repeat(70));

    // Connect to database
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Clear all test/dummy data collections
    console.log('\n📋 Step 1: Clearing all test/dummy data...');
    
    const collections = [
      { model: Investment, name: 'investments' },
      { model: SubCompany, name: 'sub_companies' },
      { model: Asset, name: 'assets' }
    ];

    for (const { model, name } of collections) {
      const count = await model.countDocuments();
      await model.deleteMany({});
      console.log(`   🗑️  Cleared ${count} records from ${name}`);
    }

    // Step 2: Clear all users except keep only one superadmin
    console.log('\n📋 Step 2: Resetting users to fresh state...');
    
    // Clear all users and roles
    const userCount = await User.countDocuments();
    const roleCount = await Role.countDocuments();
    await User.deleteMany({});
    await Role.deleteMany({});
    console.log(`   🗑️  Cleared ${userCount} users and ${roleCount} roles`);

    // Create fresh superadmin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const superadminUser = new User({
      email: 'superadmin@system.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      phone: '+1-555-0000',
      address: 'System Address',
      isActive: true,
      emailVerified: true,
      lastLogin: new Date()
    });
    await superadminUser.save();

    // Create superadmin role
    const superadminRole = new Role({
      userId: superadminUser._id,
      type: 'superadmin'
    });
    await superadminRole.save();

    console.log('   ✅ Created fresh superadmin user: superadmin@system.com / admin123');

    // Step 3: Keep owner company but clear its data
    console.log('\n📋 Step 3: Resetting owner company...');
    
    const ownerCompanyCount = await OwnerCompany.countDocuments();
    await OwnerCompany.deleteMany({});
    
    // Create fresh owner company
    const ownerCompany = new OwnerCompany({
      name: 'Investment Management Corp',
      address: '123 Business District, New York, NY 10001',
      contactEmail: 'contact@investment-corp.com',
      contactPhone: '+1-555-0100',
      website: 'https://investment-corp.com',
      establishedDate: new Date('2024-01-01'),
      registrationNumber: 'REG2024001',
      taxId: 'TAX2024001',
      description: 'Professional investment management company'
    });
    await ownerCompany.save();
    
    console.log(`   🔄 Reset ${ownerCompanyCount} owner companies, created fresh one`);

    // Step 4: Verify fresh state
    console.log('\n📋 Step 4: Verifying fresh installation state...');
    
    const verification = {
      users: await User.countDocuments(),
      roles: await Role.countDocuments(),
      ownerCompanies: await OwnerCompany.countDocuments(),
      subCompanies: await SubCompany.countDocuments(),
      investments: await Investment.countDocuments(),
      assets: await Asset.countDocuments()
    };

    console.log('\n📊 Fresh Installation State:');
    console.log('   👤 Users:', verification.users, '(1 superadmin only)');
    console.log('   🔐 Roles:', verification.roles, '(1 superadmin role only)');
    console.log('   🏢 Owner Companies:', verification.ownerCompanies, '(1 system company)');
    console.log('   🏬 Sub-Companies:', verification.subCompanies, '(0 - fresh state)');
    console.log('   💼 Investments:', verification.investments, '(0 - fresh state)');
    console.log('   📈 Assets:', verification.assets, '(0 - fresh state)');

    // Step 5: Validate zero dummy data policy
    console.log('\n📋 Step 5: Zero Dummy Data Policy Validation...');
    
    const isZeroState =
      verification.subCompanies === 0 &&
      verification.investments === 0 &&
      verification.assets === 0 &&
      verification.users === 1 &&
      verification.roles === 1;

    if (isZeroState) {
      console.log('   ✅ ZERO DUMMY DATA POLICY: VALIDATED');
      console.log('   ✅ Database is in perfect fresh installation state');
    } else {
      console.log('   ❌ ZERO DUMMY DATA POLICY: FAILED');
      console.log('   ❌ Database still contains test data');
    }

    console.log('\n🎉 Database reset completed successfully!');
    console.log('=' .repeat(70));
    console.log('🔑 Login Credentials:');
    console.log('   Email: superadmin@system.com');
    console.log('   Password: admin123');
    console.log('=' .repeat(70));

    return {
      success: true,
      isZeroState,
      verification,
      credentials: {
        email: 'superadmin@system.com',
        password: 'admin123'
      }
    };

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the reset
resetDatabase().then((result) => {
  if (result.success) {
    console.log('\n✅ Database reset completed successfully');
    if (result.isZeroState) {
      console.log('✅ Zero dummy data policy validated');
    }
    process.exit(0);
  } else {
    console.error('\n❌ Database reset failed:', result.error);
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

export default resetDatabase;
