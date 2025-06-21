/**
 * Comprehensive Demo Data Creation for Investment Management System
 * Creates realistic demo data for client presentation including:
 * - Diverse investments across different types and risk levels
 * - Historical daily performance data (30+ days)
 * - Multiple user roles with proper assignments
 * - Rich data for dashboard analytics and charts
 */

const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

console.log('🎯 Creating Comprehensive Demo Data for Client Presentation\n');

const MONGODB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'investment_management';

// Demo data configuration
const DEMO_CONFIG = {
  performanceDays: 45, // Days of historical performance data
  investmentsPerType: 3, // Number of investments per type
  dailyVariation: 0.05, // Maximum daily price variation (5%)
  trendStrength: 0.02 // Trend strength for realistic market movements
};

// Investment types and their characteristics
const INVESTMENT_TYPES = [
  {
    type: 'Stocks',
    categories: ['Technology', 'Healthcare', 'Finance', 'Energy'],
    riskLevels: ['Medium', 'High'],
    expectedROI: [8, 25],
    volatility: 0.04
  },
  {
    type: 'Bonds',
    categories: ['Government', 'Corporate', 'Municipal'],
    riskLevels: ['Low', 'Medium'],
    expectedROI: [3, 8],
    volatility: 0.02
  },
  {
    type: 'Real Estate',
    categories: ['Residential', 'Commercial', 'Industrial'],
    riskLevels: ['Medium', 'High'],
    expectedROI: [6, 15],
    volatility: 0.03
  },
  {
    type: 'Cryptocurrency',
    categories: ['Bitcoin', 'Ethereum', 'Altcoins'],
    riskLevels: ['High', 'Very High'],
    expectedROI: [15, 50],
    volatility: 0.08
  },
  {
    type: 'Commodities',
    categories: ['Gold', 'Oil', 'Agricultural'],
    riskLevels: ['Medium', 'High'],
    expectedROI: [5, 20],
    volatility: 0.05
  },
  {
    type: 'ETF',
    categories: ['Index', 'Sector', 'International'],
    riskLevels: ['Low', 'Medium'],
    expectedROI: [4, 12],
    volatility: 0.03
  }
];

// Demo companies
const DEMO_COMPANIES = [
  {
    name: 'TechVenture Capital',
    industry: 'Technology',
    description: 'Leading venture capital firm focused on early-stage technology startups',
    logo: 'https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=TVC',
    registrationNumber: 'TVC-2024-001',
    taxId: 'TAX-TVC-001',
    address: '123 Tech Street, Silicon Valley, CA 94000',
    phone: '+1-555-0101',
    email: 'contact@techventure.com'
  },
  {
    name: 'GreenEnergy Investments',
    industry: 'Energy',
    description: 'Sustainable energy investment company specializing in renewable projects',
    logo: 'https://via.placeholder.com/100x100/10B981/FFFFFF?text=GEI',
    registrationNumber: 'GEI-2024-002',
    taxId: 'TAX-GEI-002',
    address: '456 Green Avenue, Austin, TX 78701',
    phone: '+1-555-0102',
    email: 'info@greenenergy.com'
  },
  {
    name: 'HealthCare Growth Fund',
    industry: 'Healthcare',
    description: 'Healthcare-focused investment fund targeting innovative medical technologies',
    logo: 'https://via.placeholder.com/100x100/EF4444/FFFFFF?text=HGF',
    registrationNumber: 'HGF-2024-003',
    taxId: 'TAX-HGF-003',
    address: '789 Medical Plaza, Boston, MA 02101',
    phone: '+1-555-0103',
    email: 'contact@healthcaregrowth.com'
  },
  {
    name: 'Global Real Estate Partners',
    industry: 'Real Estate',
    description: 'International real estate investment and development company',
    logo: 'https://via.placeholder.com/100x100/F59E0B/FFFFFF?text=GREP',
    registrationNumber: 'GREP-2024-004',
    taxId: 'TAX-GREP-004',
    address: '321 Property Lane, New York, NY 10001',
    phone: '+1-555-0104',
    email: 'partners@globalrealestate.com'
  }
];

// Demo users for different roles
const DEMO_USERS = [
  {
    email: 'superadmin.demo@investpro.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: { type: 'superadmin', id: 'superadmin' },
    password: 'SuperAdmin123!'
  },
  {
    email: 'admin1.demo@investpro.com',
    firstName: 'Michael',
    lastName: 'Chen',
    role: { type: 'admin', id: 'admin' },
    password: 'Admin123!'
  },
  {
    email: 'admin2.demo@investpro.com',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    role: { type: 'admin', id: 'admin' },
    password: 'Admin123!'
  },
  {
    email: 'investor1.demo@investpro.com',
    firstName: 'David',
    lastName: 'Thompson',
    role: { type: 'investor', id: 'investor' },
    password: 'Investor123!'
  },
  {
    email: 'investor2.demo@investpro.com',
    firstName: 'Lisa',
    lastName: 'Wang',
    role: { type: 'investor', id: 'investor' },
    password: 'Investor123!'
  },
  {
    email: 'investor3.demo@investpro.com',
    firstName: 'Robert',
    lastName: 'Davis',
    role: { type: 'investor', id: 'investor' },
    password: 'Investor123!'
  }
];

// Utility functions
function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateMarketConditions() {
  const conditions = ['Bullish', 'Bearish', 'Neutral', 'Volatile', 'Stable'];
  return randomChoice(conditions);
}

function generatePerformanceNotes(change, changePercent) {
  const notes = [
    'Strong market performance driven by positive earnings',
    'Market correction due to economic uncertainty',
    'Steady growth following industry trends',
    'Volatility due to geopolitical events',
    'Recovery after recent market dip',
    'Outperforming sector benchmarks',
    'Consolidation phase with sideways movement',
    'Breaking through resistance levels',
    'Profit-taking after recent gains',
    'Strong institutional buying interest'
  ];
  
  if (changePercent > 2) {
    return randomChoice(notes.slice(0, 3));
  } else if (changePercent < -2) {
    return randomChoice(notes.slice(3, 6));
  } else {
    return randomChoice(notes.slice(6));
  }
}

async function clearExistingDemoData(db) {
  console.log('🧹 Clearing existing demo data...');
  
  // Remove demo users
  await db.collection('users').deleteMany({
    email: { $regex: /\.demo@/ }
  });
  
  // Remove demo companies
  await db.collection('subcompanies').deleteMany({
    name: { $in: DEMO_COMPANIES.map(c => c.name) }
  });
  
  // Remove demo investments and performance data
  await db.collection('investments').deleteMany({});
  await db.collection('dailyperformances').deleteMany({});
  await db.collection('investorinvestments').deleteMany({});
  await db.collection('companyassignments').deleteMany({});
  
  console.log('   ✅ Existing demo data cleared');
}

async function createDemoUsers(db) {
  console.log('👥 Creating demo users...');
  
  const users = [];
  for (const userData of DEMO_USERS) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = {
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: hashedPassword,
      role: userData.role,
      status: 'active',
      isFirstLogin: false,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
  }
  
  const result = await db.collection('users').insertMany(users);
  console.log(`   ✅ Created ${Object.keys(result.insertedIds).length} demo users`);
  
  return users.map((user, index) => ({
    ...user,
    _id: result.insertedIds[index]
  }));
}

async function createDemoCompanies(db) {
  console.log('🏢 Creating demo companies...');
  
  const companies = DEMO_COMPANIES.map(company => ({
    ...company,
    owner_company_id: null,
    created_at: new Date(),
    updated_at: new Date()
  }));
  
  const result = await db.collection('subcompanies').insertMany(companies);
  console.log(`   ✅ Created ${Object.keys(result.insertedIds).length} demo companies`);
  
  return companies.map((company, index) => ({
    ...company,
    _id: result.insertedIds[index]
  }));
}

async function createCompanyAssignments(db, users, companies) {
  console.log('🔗 Creating company assignments...');
  
  const adminUsers = users.filter(user => user.role.type === 'admin');
  const assignments = [];
  
  // Assign each admin to companies
  adminUsers.forEach((admin, index) => {
    const assignedCompanies = companies.slice(index * 2, (index + 1) * 2);
    assignedCompanies.forEach(company => {
      assignments.push({
        userId: admin._id,
        subCompanyId: company._id,
        status: 'active',
        assignedAt: new Date(),
        assignedBy: users.find(u => u.role.type === 'superadmin')._id
      });
    });
  });
  
  if (assignments.length > 0) {
    await db.collection('companyassignments').insertMany(assignments);
    console.log(`   ✅ Created ${assignments.length} company assignments`);
  }
  
  return assignments;
}

async function generateInvestmentName(type, category, index) {
  const prefixes = {
    'Stocks': ['Growth', 'Value', 'Dividend', 'Tech', 'Blue Chip'],
    'Bonds': ['Secure', 'Premium', 'High Grade', 'Strategic', 'Stable'],
    'Real Estate': ['Prime', 'Commercial', 'Residential', 'Development', 'REIT'],
    'Cryptocurrency': ['Digital', 'Crypto', 'Blockchain', 'DeFi', 'Web3'],
    'Commodities': ['Precious', 'Energy', 'Agricultural', 'Industrial', 'Natural'],
    'ETF': ['Diversified', 'Index', 'Sector', 'Global', 'Emerging']
  };
  
  const prefix = randomChoice(prefixes[type]);
  return `${prefix} ${category} ${type} Fund ${index + 1}`;
}

async function createDemoInvestments(db, users, companies) {
  console.log('📈 Creating demo investments...');
  
  const adminUsers = users.filter(user => user.role.type === 'admin');
  const superadmin = users.find(user => user.role.type === 'superadmin');
  const investments = [];
  
  for (const investmentType of INVESTMENT_TYPES) {
    for (let i = 0; i < DEMO_CONFIG.investmentsPerType; i++) {
      const category = randomChoice(investmentType.categories);
      const riskLevel = randomChoice(investmentType.riskLevels);
      const expectedROI = randomBetween(investmentType.expectedROI[0], investmentType.expectedROI[1]);
      const initialAmount = Math.round(randomBetween(50000, 500000));
      const company = randomChoice(companies);
      const creator = Math.random() > 0.5 ? randomChoice(adminUsers) : superadmin;
      
      const investment = {
        name: await generateInvestmentName(investmentType.type, category, i),
        description: `Professional ${investmentType.type.toLowerCase()} investment focusing on ${category.toLowerCase()} sector with ${riskLevel.toLowerCase()} risk profile.`,
        investmentType: investmentType.type,
        category: category,
        initialAmount: initialAmount,
        currentValue: initialAmount, // Will be updated with performance data
        expectedROI: Math.round(expectedROI * 100) / 100,
        actualROI: 0, // Will be calculated from performance
        riskLevel: riskLevel,
        status: 'Active',
        subCompanyId: company._id,
        investmentDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date within last 60 days
        notes: `Strategic investment in ${category.toLowerCase()} ${investmentType.type.toLowerCase()} with focus on long-term growth and risk management.`,
        tags: [investmentType.type.toLowerCase(), category.toLowerCase(), riskLevel.toLowerCase()],
        minInvestment: Math.round(initialAmount * 0.1),
        maxInvestment: Math.round(initialAmount * 2),
        featured: Math.random() > 0.7,
        isPublic: true,
        isActive: true,
        createdBy: creator._id,
        lastModifiedBy: creator._id,
        latestPerformance: {
          date: new Date(),
          marketValue: initialAmount,
          dailyChange: 0,
          dailyChangePercent: 0
        },
        performanceMetrics: {
          totalInvested: 0,
          totalReturns: 0,
          totalInvestors: 0,
          averageInvestment: 0,
          lastUpdated: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      investments.push({ ...investment, _volatility: investmentType.volatility });
    }
  }
  
  const result = await db.collection('investments').insertMany(investments);
  console.log(`   ✅ Created ${Object.keys(result.insertedIds).length} demo investments`);
  
  return investments.map((investment, index) => ({
    ...investment,
    _id: result.insertedIds[index]
  }));
}

async function generateDailyPerformanceData(db, investments, users) {
  console.log('📊 Generating historical performance data...');

  const adminUsers = users.filter(user => user.role.type === 'admin');
  const superadmin = users.find(user => user.role.type === 'superadmin');

  for (const investment of investments) {
    console.log(`   📈 Generating performance for: ${investment.name}`);

    const performanceRecords = [];
    let currentValue = investment.initialAmount;
    const volatility = investment._volatility || 0.03;

    // Generate performance data for the specified number of days
    for (let day = DEMO_CONFIG.performanceDays; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      // Generate realistic market movement
      const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
      const trendFactor = Math.sin(day * 0.1) * DEMO_CONFIG.trendStrength; // Long-term trend
      const dailyChangePercent = (randomFactor * volatility + trendFactor) * 100;
      const dailyChange = currentValue * (dailyChangePercent / 100);

      // Update current value
      currentValue += dailyChange;

      // Ensure value doesn't go negative
      if (currentValue < investment.initialAmount * 0.3) {
        currentValue = investment.initialAmount * 0.3;
      }

      const performanceRecord = {
        investmentId: investment._id,
        date: date,
        marketValue: Math.round(currentValue * 100) / 100,
        dailyChange: Math.round(dailyChange * 100) / 100,
        dailyChangePercent: Math.round(dailyChangePercent * 100) / 100,
        notes: generatePerformanceNotes(dailyChange, dailyChangePercent),
        marketConditions: generateMarketConditions(),
        updatedBy: Math.random() > 0.5 ? randomChoice(adminUsers)._id : superadmin._id,
        dataSource: 'Manual',
        isVerified: true,
        createdAt: date,
        updatedAt: date
      };

      performanceRecords.push(performanceRecord);
    }

    // Insert performance records
    if (performanceRecords.length > 0) {
      await db.collection('dailyperformances').insertMany(performanceRecords);

      // Update investment with latest performance
      const latestPerformance = performanceRecords[performanceRecords.length - 1];
      const totalReturn = latestPerformance.marketValue - investment.initialAmount;
      const actualROI = (totalReturn / investment.initialAmount) * 100;

      await db.collection('investments').updateOne(
        { _id: investment._id },
        {
          $set: {
            currentValue: latestPerformance.marketValue,
            actualROI: Math.round(actualROI * 100) / 100,
            'latestPerformance.date': latestPerformance.date,
            'latestPerformance.marketValue': latestPerformance.marketValue,
            'latestPerformance.dailyChange': latestPerformance.dailyChange,
            'latestPerformance.dailyChangePercent': latestPerformance.dailyChangePercent,
            updatedAt: new Date()
          }
        }
      );
    }
  }

  console.log(`   ✅ Generated performance data for ${investments.length} investments`);
}

async function createInvestorInvestments(db, users, investments) {
  console.log('💰 Creating investor investment relationships...');

  const investors = users.filter(user => user.role.type === 'investor');
  const investorInvestments = [];

  for (const investor of investors) {
    // Each investor invests in 3-5 random investments
    const numInvestments = Math.floor(randomBetween(3, 6));
    const selectedInvestments = [];

    // Select random investments
    while (selectedInvestments.length < numInvestments) {
      const investment = randomChoice(investments);
      if (!selectedInvestments.find(inv => inv._id.equals(investment._id))) {
        selectedInvestments.push(investment);
      }
    }

    for (const investment of selectedInvestments) {
      const investmentAmount = Math.round(randomBetween(
        investment.minInvestment,
        Math.min(investment.maxInvestment || investment.initialAmount, investment.initialAmount * 0.3)
      ));

      const investorInvestment = {
        userId: investor._id,
        investmentId: investment._id,
        amount: investmentAmount,
        investmentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: 'active',
        returns: 0, // Will be calculated based on performance
        createdAt: new Date(),
        updatedAt: new Date()
      };

      investorInvestments.push(investorInvestment);
    }
  }

  if (investorInvestments.length > 0) {
    await db.collection('investorinvestments').insertMany(investorInvestments);
    console.log(`   ✅ Created ${investorInvestments.length} investor investment relationships`);
  }

  return investorInvestments;
}

async function updateInvestmentMetrics(db, investments, investorInvestments) {
  console.log('📊 Updating investment performance metrics...');

  for (const investment of investments) {
    const relatedInvestments = investorInvestments.filter(
      inv => inv.investmentId.equals(investment._id)
    );

    const totalInvested = relatedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalInvestors = relatedInvestments.length;
    const averageInvestment = totalInvestors > 0 ? totalInvested / totalInvestors : 0;

    // Calculate returns based on current performance
    const currentROI = investment.actualROI || 0;
    const totalReturns = totalInvested * (currentROI / 100);

    await db.collection('investments').updateOne(
      { _id: investment._id },
      {
        $set: {
          'performanceMetrics.totalInvested': Math.round(totalInvested),
          'performanceMetrics.totalReturns': Math.round(totalReturns),
          'performanceMetrics.totalInvestors': totalInvestors,
          'performanceMetrics.averageInvestment': Math.round(averageInvestment),
          'performanceMetrics.lastUpdated': new Date()
        }
      }
    );
  }

  console.log(`   ✅ Updated metrics for ${investments.length} investments`);
}

async function createComprehensiveDemoData() {
  console.log('🚀 Starting Comprehensive Demo Data Creation...\n');

  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);

    // Step 1: Clear existing demo data
    await clearExistingDemoData(db);

    // Step 2: Create demo users
    const users = await createDemoUsers(db);

    // Step 3: Create demo companies
    const companies = await createDemoCompanies(db);

    // Step 4: Create company assignments
    await createCompanyAssignments(db, users, companies);

    // Step 5: Create demo investments
    const investments = await createDemoInvestments(db, users, companies);

    // Step 6: Generate historical performance data
    await generateDailyPerformanceData(db, investments, users);

    // Step 7: Create investor investment relationships
    const investorInvestments = await createInvestorInvestments(db, users, investments);

    // Step 8: Update investment metrics
    await updateInvestmentMetrics(db, investments, investorInvestments);

    await client.close();

    console.log('\n🎉 Comprehensive Demo Data Creation Completed!');
    console.log('\n📊 Summary:');
    console.log(`✅ Users: ${users.length} (${users.filter(u => u.role.type === 'superadmin').length} superadmin, ${users.filter(u => u.role.type === 'admin').length} admin, ${users.filter(u => u.role.type === 'investor').length} investor)`);
    console.log(`✅ Companies: ${companies.length}`);
    console.log(`✅ Investments: ${investments.length} across ${INVESTMENT_TYPES.length} types`);
    console.log(`✅ Performance Records: ${investments.length * (DEMO_CONFIG.performanceDays + 1)} daily records`);
    console.log(`✅ Investor Investments: ${investorInvestments.length} relationships`);

    console.log('\n🔑 Demo Login Credentials:');
    console.log('Superadmin: superadmin.demo@investpro.com / SuperAdmin123!');
    console.log('Admin 1: admin1.demo@investpro.com / Admin123!');
    console.log('Admin 2: admin2.demo@investpro.com / Admin123!');
    console.log('Investor 1: investor1.demo@investpro.com / Investor123!');
    console.log('Investor 2: investor2.demo@investpro.com / Investor123!');
    console.log('Investor 3: investor3.demo@investpro.com / Investor123!');

    console.log('\n🎯 Ready for Client Presentation!');
    console.log('- Rich dashboard analytics with real performance data');
    console.log('- Interactive charts showing 45 days of market trends');
    console.log('- Multiple user roles with realistic data access');
    console.log('- Diverse investment portfolio across all asset classes');
    console.log('- Complete investment lifecycle from creation to performance tracking');

    return true;

  } catch (error) {
    console.error('\n❌ Demo Data Creation Failed:', error.message);
    return false;
  }
}

// Run the demo data creation
createComprehensiveDemoData()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Execution error:', error);
    process.exit(1);
  });
