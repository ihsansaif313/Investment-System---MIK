/**
 * Populate Investment Management System with Comprehensive Demo Data
 * Creates realistic dummy data for client demonstration
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define all schemas
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  isFirstLogin: Boolean,
  accountStatus: String,
  emailVerified: Boolean
}, { timestamps: true });

const companySchema = new mongoose.Schema({
  name: String,
  description: String,
  sector: String,
  foundingDate: Date,
  headquarters: String,
  website: String,
  employeeCount: Number,
  currentValuation: Number,
  fundingStage: String,
  totalFundingRaised: Number,
  logo: String,
  status: String,
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  financialMetrics: {
    revenue: Number,
    profitMargin: Number,
    growthRate: Number,
    burnRate: Number
  }
}, { timestamps: true });

const investmentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  investmentType: String,
  amount: Number,
  shares: Number,
  pricePerShare: Number,
  investmentDate: Date,
  status: String,
  expectedReturn: Number,
  actualReturn: Number,
  exitDate: Date,
  notes: String
}, { timestamps: true });

const transactionSchema = new mongoose.Schema({
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  type: String, // 'investment', 'return', 'dividend', 'exit'
  amount: Number,
  date: Date,
  description: String,
  status: String
}, { timestamps: true });

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: String,
  entityType: String,
  entityId: String,
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

async function populateDemoData() {
  try {
    console.log('🚀 Populating Investment Management System with Demo Data...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data (preserve users)
    console.log('\n🧹 Clearing existing demo data...');
    await Company.deleteMany({});
    await Investment.deleteMany({});
    await Transaction.deleteMany({});
    await ActivityLog.deleteMany({});
    console.log('✅ Existing demo data cleared');

    // Get existing users for reference
    const existingUsers = await User.find();
    console.log(`📊 Found ${existingUsers.length} existing users to preserve`);

    // 1. Create Companies
    console.log('\n1️⃣ Creating Sample Companies...');
    const companies = await createCompanies();
    console.log(`✅ Created ${companies.length} companies`);

    // 2. Create Investments (if we have users)
    if (existingUsers.length > 0) {
      console.log('\n2️⃣ Creating Sample Investments...');
      const investments = await createInvestments(companies, existingUsers);
      console.log(`✅ Created ${investments.length} investments`);

      // 3. Create Transactions
      console.log('\n3️⃣ Creating Sample Transactions...');
      const transactions = await createTransactions(investments, companies, existingUsers);
      console.log(`✅ Created ${transactions.length} transactions`);

      // 4. Create Activity Logs
      console.log('\n4️⃣ Creating Sample Activity Logs...');
      const activityLogs = await createActivityLogs(existingUsers, companies, investments);
      console.log(`✅ Created ${activityLogs.length} activity logs`);
    } else {
      console.log('\n⚠️  No existing users found - skipping user-related data');
      console.log('   Add users manually, then run this script again for complete data');
    }

    // 5. Display Summary
    console.log('\n📊 Demo Data Population Summary:');
    console.log(`   Companies: ${companies.length}`);
    if (existingUsers.length > 0) {
      const investmentCount = await Investment.countDocuments();
      const transactionCount = await Transaction.countDocuments();
      const activityCount = await ActivityLog.countDocuments();
      console.log(`   Investments: ${investmentCount}`);
      console.log(`   Transactions: ${transactionCount}`);
      console.log(`   Activity Logs: ${activityCount}`);
    }
    console.log(`   Preserved Users: ${existingUsers.length}`);

    console.log('\n🎉 Demo data population completed successfully!');
    console.log('🎯 System is ready for client demonstration');

  } catch (error) {
    console.error('❌ Error populating demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

async function createCompanies() {
  const companiesData = [
    {
      name: 'TechNova Solutions',
      description: 'AI-powered enterprise software solutions for digital transformation',
      sector: 'Technology',
      foundingDate: new Date('2019-03-15'),
      headquarters: 'San Francisco, CA',
      website: 'https://technova.com',
      employeeCount: 150,
      currentValuation: 50000000,
      fundingStage: 'Series B',
      totalFundingRaised: 25000000,
      logo: '/assets/logos/technova.png',
      status: 'active',
      contactInfo: {
        email: 'contact@technova.com',
        phone: '+1-555-0123',
        address: '123 Innovation Drive, San Francisco, CA 94105'
      },
      financialMetrics: {
        revenue: 12000000,
        profitMargin: 15.5,
        growthRate: 45.2,
        burnRate: 800000
      }
    },
    {
      name: 'GreenEnergy Dynamics',
      description: 'Renewable energy solutions and smart grid technology',
      sector: 'Clean Energy',
      foundingDate: new Date('2018-07-22'),
      headquarters: 'Austin, TX',
      website: 'https://greenenergydynamics.com',
      employeeCount: 200,
      currentValuation: 75000000,
      fundingStage: 'Series C',
      totalFundingRaised: 40000000,
      logo: '/assets/logos/greenenergy.png',
      status: 'active',
      contactInfo: {
        email: 'info@greenenergydynamics.com',
        phone: '+1-555-0456',
        address: '456 Solar Boulevard, Austin, TX 78701'
      },
      financialMetrics: {
        revenue: 18000000,
        profitMargin: 22.3,
        growthRate: 38.7,
        burnRate: 1200000
      }
    },
    {
      name: 'HealthTech Innovations',
      description: 'Digital health platform connecting patients with healthcare providers',
      sector: 'Healthcare',
      foundingDate: new Date('2020-01-10'),
      headquarters: 'Boston, MA',
      website: 'https://healthtechinnovations.com',
      employeeCount: 85,
      currentValuation: 30000000,
      fundingStage: 'Series A',
      totalFundingRaised: 15000000,
      logo: '/assets/logos/healthtech.png',
      status: 'active',
      contactInfo: {
        email: 'hello@healthtechinnovations.com',
        phone: '+1-555-0789',
        address: '789 Medical Center Drive, Boston, MA 02101'
      },
      financialMetrics: {
        revenue: 8000000,
        profitMargin: 12.8,
        growthRate: 65.4,
        burnRate: 600000
      }
    },
    {
      name: 'FinanceFlow Pro',
      description: 'Next-generation fintech platform for SME banking and payments',
      sector: 'Financial Technology',
      foundingDate: new Date('2019-11-05'),
      headquarters: 'New York, NY',
      website: 'https://financeflowpro.com',
      employeeCount: 120,
      currentValuation: 45000000,
      fundingStage: 'Series B',
      totalFundingRaised: 22000000,
      logo: '/assets/logos/financeflow.png',
      status: 'active',
      contactInfo: {
        email: 'contact@financeflowpro.com',
        phone: '+1-555-0321',
        address: '321 Wall Street, New York, NY 10005'
      },
      financialMetrics: {
        revenue: 15000000,
        profitMargin: 18.7,
        growthRate: 52.1,
        burnRate: 900000
      }
    },
    {
      name: 'EduTech Academy',
      description: 'Online learning platform with AI-powered personalized education',
      sector: 'Education Technology',
      foundingDate: new Date('2020-09-12'),
      headquarters: 'Seattle, WA',
      website: 'https://edutechacademy.com',
      employeeCount: 95,
      currentValuation: 25000000,
      fundingStage: 'Series A',
      totalFundingRaised: 12000000,
      logo: '/assets/logos/edutech.png',
      status: 'active',
      contactInfo: {
        email: 'info@edutechacademy.com',
        phone: '+1-555-0654',
        address: '654 Learning Lane, Seattle, WA 98101'
      },
      financialMetrics: {
        revenue: 6000000,
        profitMargin: 25.4,
        growthRate: 78.9,
        burnRate: 450000
      }
    },
    {
      name: 'LogiChain Systems',
      description: 'Blockchain-based supply chain management and logistics optimization',
      sector: 'Logistics & Supply Chain',
      foundingDate: new Date('2018-04-18'),
      headquarters: 'Chicago, IL',
      website: 'https://logichainsystems.com',
      employeeCount: 180,
      currentValuation: 60000000,
      fundingStage: 'Series B',
      totalFundingRaised: 35000000,
      logo: '/assets/logos/logichain.png',
      status: 'active',
      contactInfo: {
        email: 'contact@logichainsystems.com',
        phone: '+1-555-0987',
        address: '987 Commerce Drive, Chicago, IL 60601'
      },
      financialMetrics: {
        revenue: 20000000,
        profitMargin: 20.1,
        growthRate: 42.3,
        burnRate: 1100000
      }
    },
    {
      name: 'AgriTech Futures',
      description: 'Smart farming solutions using IoT and precision agriculture technology',
      sector: 'Agriculture Technology',
      foundingDate: new Date('2019-06-30'),
      headquarters: 'Denver, CO',
      website: 'https://agritechfutures.com',
      employeeCount: 110,
      currentValuation: 35000000,
      fundingStage: 'Series A',
      totalFundingRaised: 18000000,
      logo: '/assets/logos/agritech.png',
      status: 'active',
      contactInfo: {
        email: 'hello@agritechfutures.com',
        phone: '+1-555-0147',
        address: '147 Farm Innovation Blvd, Denver, CO 80202'
      },
      financialMetrics: {
        revenue: 10000000,
        profitMargin: 16.9,
        growthRate: 55.6,
        burnRate: 700000
      }
    },
    {
      name: 'CyberShield Security',
      description: 'Advanced cybersecurity solutions for enterprise and cloud infrastructure',
      sector: 'Cybersecurity',
      foundingDate: new Date('2017-12-03'),
      headquarters: 'Washington, DC',
      website: 'https://cybershieldsecurity.com',
      employeeCount: 220,
      currentValuation: 80000000,
      fundingStage: 'Series C',
      totalFundingRaised: 45000000,
      logo: '/assets/logos/cybershield.png',
      status: 'active',
      contactInfo: {
        email: 'info@cybershieldsecurity.com',
        phone: '+1-555-0258',
        address: '258 Security Plaza, Washington, DC 20001'
      },
      financialMetrics: {
        revenue: 25000000,
        profitMargin: 28.5,
        growthRate: 35.8,
        burnRate: 1400000
      }
    }
  ];

  return await Company.insertMany(companiesData);
}

async function createInvestments(companies, users) {
  const investments = [];
  const investmentTypes = ['equity', 'convertible_note', 'safe', 'debt'];
  const statuses = ['active', 'exited', 'pending', 'closed'];

  // Create 15-20 investments across companies and users
  for (let i = 0; i < 18; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const investor = users[Math.floor(Math.random() * users.length)];
    const investmentType = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate realistic investment amounts based on company stage
    let baseAmount;
    switch (company.fundingStage) {
      case 'Series A': baseAmount = 500000; break;
      case 'Series B': baseAmount = 2000000; break;
      case 'Series C': baseAmount = 5000000; break;
      default: baseAmount = 250000;
    }

    const amount = baseAmount + (Math.random() * baseAmount * 0.5);
    const pricePerShare = 10 + (Math.random() * 40);
    const shares = Math.floor(amount / pricePerShare);

    // Generate dates within last 2 years
    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - Math.floor(Math.random() * 730));

    let exitDate = null;
    let actualReturn = null;
    if (status === 'exited') {
      exitDate = new Date(investmentDate);
      exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 365));
      actualReturn = amount * (1 + (Math.random() * 0.8 - 0.2)); // -20% to +60% return
    }

    investments.push({
      companyId: company._id,
      investorId: investor._id,
      investmentType,
      amount: Math.round(amount),
      shares,
      pricePerShare: Math.round(pricePerShare * 100) / 100,
      investmentDate,
      status,
      expectedReturn: Math.round(amount * (1.2 + Math.random() * 0.8)), // 20-100% expected return
      actualReturn: actualReturn ? Math.round(actualReturn) : null,
      exitDate,
      notes: `${investmentType} investment in ${company.name} - ${company.fundingStage} round`
    });
  }

  return await Investment.insertMany(investments);
}

async function createTransactions(investments, companies, users) {
  const transactions = [];
  const transactionTypes = ['investment', 'return', 'dividend', 'exit', 'fee'];
  const statuses = ['completed', 'pending', 'failed', 'processing'];

  // Create initial investment transactions
  for (const investment of investments) {
    transactions.push({
      investmentId: investment._id,
      investorId: investment.investorId,
      companyId: investment.companyId,
      type: 'investment',
      amount: investment.amount,
      date: investment.investmentDate,
      description: `Initial investment in ${investment.investmentType}`,
      status: 'completed'
    });

    // Add some dividend/return transactions for active investments
    if (investment.status === 'active' && Math.random() > 0.4) {
      const dividendCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < dividendCount; i++) {
        const dividendDate = new Date(investment.investmentDate);
        dividendDate.setMonth(dividendDate.getMonth() + (i + 1) * 3); // Quarterly dividends

        if (dividendDate <= new Date()) {
          transactions.push({
            investmentId: investment._id,
            investorId: investment.investorId,
            companyId: investment.companyId,
            type: 'dividend',
            amount: Math.round(investment.amount * 0.02 * (1 + Math.random() * 0.5)), // 2-3% dividend
            date: dividendDate,
            description: `Quarterly dividend payment`,
            status: 'completed'
          });
        }
      }
    }

    // Add exit transaction for exited investments
    if (investment.status === 'exited' && investment.exitDate && investment.actualReturn) {
      transactions.push({
        investmentId: investment._id,
        investorId: investment.investorId,
        companyId: investment.companyId,
        type: 'exit',
        amount: investment.actualReturn,
        date: investment.exitDate,
        description: `Exit from investment - ${investment.actualReturn > investment.amount ? 'Profit' : 'Loss'}`,
        status: 'completed'
      });
    }

    // Add some management fees
    if (Math.random() > 0.6) {
      const feeDate = new Date(investment.investmentDate);
      feeDate.setMonth(feeDate.getMonth() + 6);

      if (feeDate <= new Date()) {
        transactions.push({
          investmentId: investment._id,
          investorId: investment.investorId,
          companyId: investment.companyId,
          type: 'fee',
          amount: -Math.round(investment.amount * 0.015), // 1.5% management fee
          date: feeDate,
          description: `Annual management fee`,
          status: 'completed'
        });
      }
    }
  }

  return await Transaction.insertMany(transactions);
}

async function createActivityLogs(users, companies, investments) {
  const activities = [];
  const actions = [
    'user_login', 'user_logout', 'investment_created', 'investment_updated',
    'company_viewed', 'portfolio_viewed', 'report_generated', 'profile_updated',
    'transaction_processed', 'document_uploaded', 'notification_sent'
  ];

  const entityTypes = ['user', 'company', 'investment', 'transaction', 'report'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
  ];

  // Generate 50-100 activity logs over the past 6 months
  for (let i = 0; i < 75; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entityType = entityTypes[Math.floor(Math.random() * entityTypes.length)];

    // Generate date within last 6 months
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 180));

    let entityId = null;
    let description = '';
    let metadata = {};

    switch (action) {
      case 'user_login':
        entityId = user._id.toString();
        description = `User ${user.firstName} ${user.lastName} logged in`;
        metadata = { loginMethod: 'email', deviceType: 'desktop' };
        break;
      case 'investment_created':
        if (investments.length > 0) {
          const investment = investments[Math.floor(Math.random() * investments.length)];
          entityId = investment._id.toString();
          description = `New investment created for $${investment.amount.toLocaleString()}`;
          metadata = { amount: investment.amount, type: investment.investmentType };
        }
        break;
      case 'company_viewed':
        if (companies.length > 0) {
          const company = companies[Math.floor(Math.random() * companies.length)];
          entityId = company._id.toString();
          description = `User viewed ${company.name} company profile`;
          metadata = { companyName: company.name, sector: company.sector };
        }
        break;
      case 'portfolio_viewed':
        entityId = user._id.toString();
        description = `User ${user.firstName} ${user.lastName} viewed portfolio`;
        metadata = { viewType: 'summary', filters: [] };
        break;
      case 'report_generated':
        entityId = user._id.toString();
        description = `Investment report generated`;
        metadata = { reportType: 'portfolio_summary', format: 'pdf' };
        break;
      default:
        entityId = user._id.toString();
        description = `User performed ${action.replace('_', ' ')}`;
        metadata = { action: action };
    }

    activities.push({
      userId: user._id,
      action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      createdAt: activityDate
    });
  }

  return await ActivityLog.insertMany(activities);
}

populateDemoData();
