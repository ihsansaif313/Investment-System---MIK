/**
 * Populate Demo Data with Correct Backend Models
 * Creates demo data that matches the actual backend model structure
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define schemas matching the actual backend models
const ownerCompanySchema = new mongoose.Schema({
  name: String,
  address: String,
  contactEmail: String,
  contactPhone: String,
  website: String,
  establishedDate: Date,
  registrationNumber: String,
  taxId: String,
  logo: String,
  description: String
}, { timestamps: true });

const subCompanySchema = new mongoose.Schema({
  ownerCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'OwnerCompany', required: true },
  name: String,
  industry: String,
  category: String,
  description: String,
  establishedDate: Date,
  status: { type: String, default: 'active' },
  logo: String,
  website: String,
  contactEmail: String,
  contactPhone: String,
  address: String,
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const assetSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  category: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const investmentSchema = new mongoose.Schema({
  subCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCompany', required: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  name: String,
  description: String,
  initialAmount: Number,
  currentValue: Number,
  minInvestment: Number,
  maxInvestment: Number,
  expectedROI: Number,
  actualROI: Number,
  startDate: Date,
  endDate: Date,
  status: { type: String, default: 'Active' },
  riskLevel: String,
  category: String,
  tags: [String],
  performanceMetrics: {
    totalInvested: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },
    totalInvestors: { type: Number, default: 0 },
    averageInvestment: { type: Number, default: 0 }
  },
  isPublic: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

const investorInvestmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment', required: true },
  amount: Number,
  shares: Number,
  purchaseDate: Date,
  currentValue: Number,
  status: { type: String, default: 'active' },
  notes: String
}, { timestamps: true });

// Create models
const OwnerCompany = mongoose.model('OwnerCompany', ownerCompanySchema);
const SubCompany = mongoose.model('SubCompany', subCompanySchema);
const Asset = mongoose.model('Asset', assetSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const InvestorInvestment = mongoose.model('InvestorInvestment', investorInvestmentSchema);
const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String
}, { timestamps: true }));

async function populateCorrectDemoData() {
  try {
    console.log('🚀 Populating Demo Data with Correct Backend Models...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await OwnerCompany.deleteMany({});
    await SubCompany.deleteMany({});
    await Asset.deleteMany({});
    await Investment.deleteMany({});
    await InvestorInvestment.deleteMany({});

    // Get existing users
    const users = await User.find();
    console.log(`📊 Found ${users.length} existing users`);

    if (users.length === 0) {
      console.log('❌ No users found! Please create users first.');
      return;
    }

    // 1. Create Owner Companies
    console.log('\n1️⃣ Creating Owner Companies...');
    const ownerCompanies = await createOwnerCompanies();
    console.log(`✅ Created ${ownerCompanies.length} owner companies`);

    // 2. Create Sub Companies
    console.log('\n2️⃣ Creating Sub Companies...');
    const subCompanies = await createSubCompanies(ownerCompanies, users);
    console.log(`✅ Created ${subCompanies.length} sub companies`);

    // 3. Create Assets
    console.log('\n3️⃣ Creating Assets...');
    const assets = await createAssets();
    console.log(`✅ Created ${assets.length} assets`);

    // 4. Create Investments
    console.log('\n4️⃣ Creating Investments...');
    const investments = await createInvestments(subCompanies, assets);
    console.log(`✅ Created ${investments.length} investments`);

    // 5. Create Investor Investments
    console.log('\n5️⃣ Creating Investor Investments...');
    const investorInvestments = await createInvestorInvestments(investments, users);
    console.log(`✅ Created ${investorInvestments.length} investor investments`);

    // 6. Update Investment Performance Metrics
    console.log('\n6️⃣ Updating Investment Performance Metrics...');
    await updateInvestmentMetrics(investments);
    console.log('✅ Updated performance metrics');

    // Summary
    console.log('\n📊 Demo Data Summary:');
    console.log(`   Owner Companies: ${ownerCompanies.length}`);
    console.log(`   Sub Companies: ${subCompanies.length}`);
    console.log(`   Assets: ${assets.length}`);
    console.log(`   Investments: ${investments.length}`);
    console.log(`   Investor Investments: ${investorInvestments.length}`);
    console.log(`   Users: ${users.length}`);

    const totalInvestmentValue = investorInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    console.log(`   Total Investment Value: $${totalInvestmentValue.toLocaleString()}`);

    console.log('\n🎉 Demo data population completed successfully!');
    console.log('🎯 Frontend should now display all demo data');

  } catch (error) {
    console.error('❌ Error populating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function createOwnerCompanies() {
  const ownerCompaniesData = [
    {
      name: 'InvestPro Holdings',
      address: '123 Financial District, New York, NY 10005',
      contactEmail: 'contact@investpro.com',
      contactPhone: '+1-555-0100',
      website: 'https://investpro.com',
      establishedDate: new Date('2015-01-15'),
      registrationNumber: 'IPH-2015-001',
      taxId: 'TAX-IPH-001',
      logo: '/assets/logos/investpro.png',
      description: 'Leading investment management and venture capital firm'
    },
    {
      name: 'TechVenture Capital',
      address: '456 Innovation Drive, San Francisco, CA 94105',
      contactEmail: 'info@techventure.com',
      contactPhone: '+1-555-0200',
      website: 'https://techventure.com',
      establishedDate: new Date('2018-06-20'),
      registrationNumber: 'TVC-2018-002',
      taxId: 'TAX-TVC-002',
      logo: '/assets/logos/techventure.png',
      description: 'Technology-focused venture capital and growth equity firm'
    }
  ];

  return await OwnerCompany.insertMany(ownerCompaniesData);
}

async function createSubCompanies(ownerCompanies, users) {
  const subCompaniesData = [
    {
      ownerCompanyId: ownerCompanies[0]._id,
      name: 'TechNova Solutions',
      industry: 'Technology',
      category: 'Software',
      description: 'AI-powered enterprise software solutions for digital transformation',
      establishedDate: new Date('2019-03-15'),
      status: 'active',
      logo: '/assets/logos/technova.png',
      website: 'https://technova.com',
      contactEmail: 'contact@technova.com',
      contactPhone: '+1-555-0301',
      address: '123 Innovation Drive, San Francisco, CA 94105',
      adminUserId: users[0]._id
    },
    {
      ownerCompanyId: ownerCompanies[0]._id,
      name: 'GreenEnergy Dynamics',
      industry: 'Clean Energy',
      category: 'Renewable Energy',
      description: 'Renewable energy solutions and smart grid technology',
      establishedDate: new Date('2018-07-22'),
      status: 'active',
      logo: '/assets/logos/greenenergy.png',
      website: 'https://greenenergydynamics.com',
      contactEmail: 'info@greenenergydynamics.com',
      contactPhone: '+1-555-0302',
      address: '456 Solar Boulevard, Austin, TX 78701',
      adminUserId: users[1]._id
    },
    {
      ownerCompanyId: ownerCompanies[1]._id,
      name: 'HealthTech Innovations',
      industry: 'Healthcare',
      category: 'Digital Health',
      description: 'Digital health platform connecting patients with healthcare providers',
      establishedDate: new Date('2020-01-10'),
      status: 'active',
      logo: '/assets/logos/healthtech.png',
      website: 'https://healthtechinnovations.com',
      contactEmail: 'hello@healthtechinnovations.com',
      contactPhone: '+1-555-0303',
      address: '789 Medical Center Drive, Boston, MA 02101',
      adminUserId: users[0]._id
    },
    {
      ownerCompanyId: ownerCompanies[1]._id,
      name: 'FinanceFlow Pro',
      industry: 'Financial Technology',
      category: 'Fintech',
      description: 'Next-generation fintech platform for SME banking and payments',
      establishedDate: new Date('2019-11-05'),
      status: 'active',
      logo: '/assets/logos/financeflow.png',
      website: 'https://financeflowpro.com',
      contactEmail: 'contact@financeflowpro.com',
      contactPhone: '+1-555-0304',
      address: '321 Wall Street, New York, NY 10005',
      adminUserId: users[1]._id
    }
  ];

  return await SubCompany.insertMany(subCompaniesData);
}

async function createAssets() {
  const assetsData = [
    { name: 'Technology Equity', type: 'equity', description: 'Equity shares in technology companies', category: 'Technology' },
    { name: 'Clean Energy Bonds', type: 'bond', description: 'Green bonds for renewable energy projects', category: 'Clean Energy' },
    { name: 'Healthcare Innovation Fund', type: 'fund', description: 'Diversified healthcare technology fund', category: 'Healthcare' },
    { name: 'Fintech Growth Assets', type: 'equity', description: 'Growth equity in financial technology', category: 'Financial Technology' },
    { name: 'Real Estate Investment Trust', type: 'reit', description: 'Commercial real estate investment trust', category: 'Real Estate' },
    { name: 'Cryptocurrency Portfolio', type: 'crypto', description: 'Diversified cryptocurrency holdings', category: 'Digital Assets' }
  ];

  return await Asset.insertMany(assetsData);
}

async function createInvestments(subCompanies, assets) {
  const investments = [];
  const riskLevels = ['Low', 'Medium', 'High'];
  const statuses = ['Active', 'Completed', 'Paused'];

  for (let i = 0; i < 12; i++) {
    const subCompany = subCompanies[Math.floor(Math.random() * subCompanies.length)];
    const asset = assets[Math.floor(Math.random() * assets.length)];
    const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const initialAmount = 1000000 + (Math.random() * 4000000); // $1M - $5M
    const currentValue = initialAmount * (0.8 + Math.random() * 0.6); // 80% - 140% of initial
    const minInvestment = 10000 + (Math.random() * 40000); // $10K - $50K
    const maxInvestment = minInvestment * 10; // 10x min investment
    const expectedROI = 5 + (Math.random() * 25); // 5% - 30%

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365)); // Within last year

    investments.push({
      subCompanyId: subCompany._id,
      assetId: asset._id,
      name: `${subCompany.name} - ${asset.name} Investment`,
      description: `Investment opportunity in ${subCompany.name} focusing on ${asset.description}`,
      initialAmount: Math.round(initialAmount),
      currentValue: Math.round(currentValue),
      minInvestment: Math.round(minInvestment),
      maxInvestment: Math.round(maxInvestment),
      expectedROI: Math.round(expectedROI * 100) / 100,
      actualROI: Math.round(((currentValue - initialAmount) / initialAmount) * 10000) / 100,
      startDate,
      endDate: status === 'Completed' ? new Date(startDate.getTime() + Math.random() * 365 * 24 * 60 * 60 * 1000) : null,
      status,
      riskLevel,
      category: asset.category,
      tags: [subCompany.industry, asset.type, riskLevel.toLowerCase()],
      performanceMetrics: {
        totalInvested: 0,
        totalReturns: 0,
        totalInvestors: 0,
        averageInvestment: 0
      },
      isPublic: true,
      featured: Math.random() > 0.7
    });
  }

  return await Investment.insertMany(investments);
}

async function createInvestorInvestments(investments, users) {
  const investorInvestments = [];
  const statuses = ['active', 'completed', 'pending'];

  // Create 20-30 investor investments
  for (let i = 0; i < 25; i++) {
    const investment = investments[Math.floor(Math.random() * investments.length)];
    const investor = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const amount = investment.minInvestment + (Math.random() * (investment.maxInvestment - investment.minInvestment));
    const shares = Math.floor(amount / 100); // Assume $100 per share
    const currentValue = amount * (0.9 + Math.random() * 0.4); // 90% - 130% of investment

    const purchaseDate = new Date(investment.startDate);
    purchaseDate.setDate(purchaseDate.getDate() + Math.floor(Math.random() * 30)); // Within 30 days of investment start

    investorInvestments.push({
      investorId: investor._id,
      investmentId: investment._id,
      amount: Math.round(amount),
      shares,
      purchaseDate,
      currentValue: Math.round(currentValue),
      status,
      notes: `Investment in ${investment.name} by ${investor.firstName} ${investor.lastName}`
    });
  }

  return await InvestorInvestment.insertMany(investorInvestments);
}

async function updateInvestmentMetrics(investments) {
  for (const investment of investments) {
    const investorInvestments = await InvestorInvestment.find({ investmentId: investment._id });

    const totalInvested = investorInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalReturns = investorInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalInvestors = investorInvestments.length;
    const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0;

    await Investment.findByIdAndUpdate(investment._id, {
      'performanceMetrics.totalInvested': totalInvested,
      'performanceMetrics.totalReturns': totalReturns,
      'performanceMetrics.totalInvestors': totalInvestors,
      'performanceMetrics.averageInvestment': averageInvestment
    });
  }
}

populateCorrectDemoData();
