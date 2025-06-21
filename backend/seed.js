/**
 * DUMMY DATA SEEDING SCRIPT - DISABLED FOR PRODUCTION USE
 * This file has been disabled to ensure clean production deployment
 * Use production-init.js for essential system initialization
 */

console.error('❌ DUMMY DATA SEEDING DISABLED');
console.error('❌ This file contains test/dummy data and is disabled for production use');
console.error('💡 For production initialization, use: node scripts/production-init.js');
console.error('💡 For development with dummy data, rename this file to seed.js.dev');
process.exit(1);

// DISABLED DEVELOPMENT SEED FILE - CONTAINS DUMMY DATA
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Role from './models/Role.js';
import { OwnerCompany, SubCompany } from './models/Company.js';
import Asset from './models/Asset.js';
import Investment from './models/Investment.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding (DEVELOPMENT ONLY)...');

    // Clear existing data
    await User.deleteMany({});
    await Role.deleteMany({});
    await OwnerCompany.deleteMany({});
    await SubCompany.deleteMany({});
    await Asset.deleteMany({});
    await Investment.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create Owner Company
    const ownerCompany = new OwnerCompany({
      name: 'Investment Holdings Corp',
      address: '123 Main St, New York, NY 10001',
      contactEmail: 'contact@holdings.com',
      contactPhone: '+1-555-0123',
      website: 'https://holdings.com',
      establishedDate: new Date('2020-01-01'),
      registrationNumber: 'REG123456789',
      taxId: 'TAX987654321',
      description: 'Leading investment management company'
    });
    await ownerCompany.save();
    console.log('✅ Created owner company');

    // Create Users
    const superadminUser = new User({
      email: 'superadmin@example.com',
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1-555-0001',
      address: '123 Admin St, New York, NY',
      emailVerified: true
    });
    await superadminUser.save();

    const adminUser = new User({
      email: 'admin@techvest.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1-555-0002',
      address: '456 Admin Ave, New York, NY',
      emailVerified: true
    });
    await adminUser.save();

    const investorUser = new User({
      email: 'investor@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Investor',
      phone: '+1-555-0003',
      address: '789 Investor Blvd, New York, NY',
      emailVerified: true
    });
    await investorUser.save();

    console.log('✅ Created users');

    // Create Roles
    const superadminRole = new Role({
      userId: superadminUser._id,
      type: 'superadmin'
    });
    await superadminRole.save();

    const adminRole = new Role({
      userId: adminUser._id,
      type: 'admin'
    });
    await adminRole.save();

    const investorRole = new Role({
      userId: investorUser._id,
      type: 'investor'
    });
    await investorRole.save();

    console.log('✅ Created roles');

    // Create Sub-Company
    const subCompany = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name: 'TechVest Inc.',
      industry: 'Technology',
      description: 'Technology investment company specializing in emerging tech startups',
      establishedDate: new Date('2023-01-15'),
      status: 'active',
      website: 'https://techvest.com',
      contactEmail: 'contact@techvest.com',
      contactPhone: '+1-555-0100',
      address: '100 Tech Park, Silicon Valley, CA',
      adminUserId: adminUser._id
    });
    await subCompany.save();

    console.log('✅ Created sub-company');

    // Create Assets
    const assets = [
      {
        name: 'TikTok',
        type: 'Business',
        symbol: 'TIKTOK',
        description: 'Social media platform investment opportunity',
        currentPrice: 150.50,
        priceChange24h: 2.5,
        priceChangePercentage: 1.69,
        marketCap: 75000000000,
        volume24h: 1500000,
        sector: 'Technology',
        country: 'China',
        currency: 'USD'
      },
      {
        name: 'Meta Platforms Inc.',
        type: 'Stock',
        symbol: 'META',
        description: 'Social media and virtual reality company',
        currentPrice: 298.75,
        priceChange24h: -5.25,
        priceChangePercentage: -1.73,
        marketCap: 800000000000,
        volume24h: 25000000,
        exchange: 'NASDAQ',
        sector: 'Technology',
        country: 'USA',
        currency: 'USD'
      },
      {
        name: 'Walmart Inc.',
        type: 'Stock',
        symbol: 'WMT',
        description: 'Multinational retail corporation',
        currentPrice: 165.20,
        priceChange24h: 1.80,
        priceChangePercentage: 1.10,
        marketCap: 450000000000,
        volume24h: 8000000,
        exchange: 'NYSE',
        sector: 'Consumer Staples',
        country: 'USA',
        currency: 'USD'
      },
      {
        name: 'Bitcoin',
        type: 'Crypto',
        symbol: 'BTC',
        description: 'Leading cryptocurrency',
        currentPrice: 45000.00,
        priceChange24h: 1200.00,
        priceChangePercentage: 2.74,
        marketCap: 850000000000,
        volume24h: 15000000000,
        sector: 'Cryptocurrency',
        currency: 'USD'
      }
    ];

    const createdAssets = [];
    for (const assetData of assets) {
      const asset = new Asset(assetData);
      await asset.save();
      createdAssets.push(asset);
    }

    console.log('✅ Created assets');

    // Create Investments
    const investments = [
      {
        subCompanyId: subCompany._id,
        assetId: createdAssets[0]._id, // TikTok
        name: 'TikTok Growth Fund',
        description: 'Investment in TikTok advertising and growth initiatives',
        initialAmount: 500000,
        currentValue: 612500,
        minInvestment: 1000,
        maxInvestment: 50000,
        expectedROI: 20,
        startDate: new Date('2023-03-01'),
        status: 'Active',
        riskLevel: 'Medium',
        category: 'Social Media',
        tags: ['social-media', 'growth', 'advertising']
      },
      {
        subCompanyId: subCompany._id,
        assetId: createdAssets[1]._id, // Meta
        name: 'Meta VR Investment',
        description: 'Investment in Meta\'s virtual reality and metaverse initiatives',
        initialAmount: 750000,
        currentValue: 825000,
        minInvestment: 2500,
        maxInvestment: 100000,
        expectedROI: 15,
        startDate: new Date('2023-02-15'),
        status: 'Active',
        riskLevel: 'High',
        category: 'Virtual Reality',
        tags: ['vr', 'metaverse', 'technology']
      },
      {
        subCompanyId: subCompany._id,
        assetId: createdAssets[2]._id, // Walmart
        name: 'Walmart Retail Fund',
        description: 'Stable investment in Walmart retail operations',
        initialAmount: 300000,
        currentValue: 315000,
        minInvestment: 500,
        maxInvestment: 25000,
        expectedROI: 8,
        startDate: new Date('2023-01-01'),
        status: 'Active',
        riskLevel: 'Low',
        category: 'Retail',
        tags: ['retail', 'stable', 'dividend']
      }
    ];

    for (const investmentData of investments) {
      const investment = new Investment(investmentData);
      await investment.save();
    }

    console.log('✅ Created investments');

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Superadmin: superadmin@example.com / password123');
    console.log('Admin: admin@techvest.com / password123');
    console.log('Investor: investor@example.com / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Connect to database and seed
const connectAndSeed = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    await seedData();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('💡 Make sure MongoDB is running on your system');
    process.exit(1);
  }
};

connectAndSeed();
