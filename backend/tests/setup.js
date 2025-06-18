/**
 * Test Setup and Configuration
 * Sets up test environment and utilities
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User, Role, OwnerCompany, SubCompany, Asset, Investment, InvestorInvestment } from '../models/index.js';
import bcrypt from 'bcryptjs';

let mongoServer;

/**
 * Setup test database
 */
export const setupTestDB = async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log('Test database connected');
};

/**
 * Cleanup test database
 */
export const cleanupTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log('Test database cleaned up');
};

/**
 * Clear all collections
 */
export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create test users with different roles
 */
export const createTestUsers = async () => {
  const hashedPassword = await bcrypt.hash('testpassword123', 12);

  // Create superadmin user
  const superadminUser = new User({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@test.com',
    password: hashedPassword,
    phone: '+1234567890',
    dateOfBirth: new Date('1990-01-01'),
    address: '123 Admin Street, Admin City, AC 12345',
    isActive: true,
    emailVerified: true
  });
  await superadminUser.save();

  const superadminRole = new Role({
    userId: superadminUser._id,
    type: 'superadmin',
    isActive: true
  });
  await superadminRole.save();

  // Create admin user
  const adminUser = new User({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@test.com',
    password: hashedPassword,
    phone: '+1234567891',
    dateOfBirth: new Date('1985-01-01'),
    address: '456 Admin Avenue, Admin City, AC 12346',
    isActive: true,
    emailVerified: true
  });
  await adminUser.save();

  const adminRole = new Role({
    userId: adminUser._id,
    type: 'admin',
    isActive: true
  });
  await adminRole.save();

  // Create investor user
  const investorUser = new User({
    firstName: 'Investor',
    lastName: 'User',
    email: 'investor@test.com',
    password: hashedPassword,
    phone: '+1234567892',
    dateOfBirth: new Date('1992-01-01'),
    address: '789 Investor Road, Investor City, IC 12347',
    isActive: true,
    emailVerified: true
  });
  await investorUser.save();

  const investorRole = new Role({
    userId: investorUser._id,
    type: 'investor',
    isActive: true
  });
  await investorRole.save();

  return {
    superadmin: { user: superadminUser, role: superadminRole },
    admin: { user: adminUser, role: adminRole },
    investor: { user: investorUser, role: investorRole }
  };
};

/**
 * Create test companies
 */
export const createTestCompanies = async () => {
  // Create owner company
  const ownerCompany = new OwnerCompany({
    name: 'Test Investment Corp',
    address: '100 Corporate Blvd, Business City, BC 10001',
    contactEmail: 'contact@testinvestment.com',
    contactPhone: '+1234567800',
    website: 'https://testinvestment.com',
    establishedDate: new Date('2020-01-01'),
    registrationNumber: 'REG2020001',
    taxId: 'TAX2020001',
    description: 'Test investment management company',
    isActive: true
  });
  await ownerCompany.save();

  // Create sub-company
  const users = await createTestUsers();
  const subCompany = new SubCompany({
    ownerCompanyId: ownerCompany._id,
    name: 'Test Sub Company',
    address: '200 Sub Street, Sub City, SC 20001',
    contactEmail: 'contact@testsub.com',
    contactPhone: '+1234567801',
    website: 'https://testsub.com',
    establishedDate: new Date('2021-01-01'),
    registrationNumber: 'SUBREG2021001',
    taxId: 'SUBTAX2021001',
    description: 'Test sub-company',
    isActive: true,
    adminUserId: users.admin.user._id
  });
  await subCompany.save();

  return { ownerCompany, subCompany };
};

/**
 * Create test assets
 */
export const createTestAssets = async () => {
  const assets = [];

  // Stock asset
  const stockAsset = new Asset({
    name: 'Test Stock',
    symbol: 'TST',
    type: 'stock',
    sector: 'Technology',
    description: 'Test stock for testing purposes',
    currentPrice: 100.00,
    currency: 'USD',
    marketCap: 1000000000,
    volume24h: 1000000,
    priceChange24h: 5.00,
    priceChangePercent24h: 5.26,
    isActive: true,
    metadata: {
      exchange: 'NASDAQ',
      website: 'https://teststock.com'
    }
  });
  await stockAsset.save();
  assets.push(stockAsset);

  // Crypto asset
  const cryptoAsset = new Asset({
    name: 'Test Coin',
    symbol: 'TCOIN',
    type: 'crypto',
    description: 'Test cryptocurrency for testing purposes',
    currentPrice: 50000.00,
    currency: 'USD',
    marketCap: 500000000000,
    volume24h: 10000000000,
    priceChange24h: -1000.00,
    priceChangePercent24h: -1.96,
    isActive: true
  });
  await cryptoAsset.save();
  assets.push(cryptoAsset);

  return assets;
};

/**
 * Create test investments
 */
export const createTestInvestments = async () => {
  const companies = await createTestCompanies();
  const assets = await createTestAssets();
  const users = await createTestUsers();

  const investments = [];

  // Active investment
  const activeInvestment = new Investment({
    subCompanyId: companies.subCompany._id,
    assetId: assets[0]._id,
    name: 'Test Active Investment',
    description: 'Test active investment for testing purposes',
    targetAmount: 1000000,
    minInvestment: 1000,
    maxInvestment: 100000,
    currentValue: 0,
    totalInvested: 0,
    totalInvestors: 0,
    expectedROI: 15,
    actualROI: 0,
    riskLevel: 'medium',
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    currency: 'USD',
    isActive: true,
    createdBy: users.admin.user._id
  });
  await activeInvestment.save();
  investments.push(activeInvestment);

  // Draft investment
  const draftInvestment = new Investment({
    subCompanyId: companies.subCompany._id,
    assetId: assets[1]._id,
    name: 'Test Draft Investment',
    description: 'Test draft investment for testing purposes',
    targetAmount: 500000,
    minInvestment: 500,
    maxInvestment: 50000,
    currentValue: 0,
    totalInvested: 0,
    totalInvestors: 0,
    expectedROI: 25,
    actualROI: 0,
    riskLevel: 'high',
    status: 'draft',
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    endDate: new Date(Date.now() + 395 * 24 * 60 * 60 * 1000), // 13 months from now
    currency: 'USD',
    isActive: true,
    createdBy: users.admin.user._id
  });
  await draftInvestment.save();
  investments.push(draftInvestment);

  return investments;
};

/**
 * Create test investor investments
 */
export const createTestInvestorInvestments = async () => {
  const investments = await createTestInvestments();
  const users = await createTestUsers();

  const investorInvestment = new InvestorInvestment({
    userId: users.investor.user._id,
    investmentId: investments[0]._id,
    amountInvested: 5000,
    currentValue: 5250,
    status: 'approved',
    investmentDate: new Date(),
    approvedBy: users.admin.user._id,
    approvedAt: new Date()
  });
  await investorInvestment.save();

  // Update investment totals
  investments[0].totalInvested = 5000;
  investments[0].currentValue = 5250;
  investments[0].totalInvestors = 1;
  investments[0].actualROI = 5.0;
  await investments[0].save();

  return [investorInvestment];
};

/**
 * Generate JWT token for testing
 */
export const generateTestToken = (userId) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Create complete test data set
 */
export const createTestData = async () => {
  const users = await createTestUsers();
  const companies = await createTestCompanies();
  const assets = await createTestAssets();
  const investments = await createTestInvestments();
  const investorInvestments = await createTestInvestorInvestments();

  return {
    users,
    companies,
    assets,
    investments,
    investorInvestments
  };
};

export default {
  setupTestDB,
  cleanupTestDB,
  clearDatabase,
  createTestUsers,
  createTestCompanies,
  createTestAssets,
  createTestInvestments,
  createTestInvestorInvestments,
  generateTestToken,
  createTestData
};
