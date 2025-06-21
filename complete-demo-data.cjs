/**
 * Complete Demo Data Population
 * Run this after adding users manually to populate investments, transactions, and activity logs
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define schemas (same as populate-demo-data.cjs)
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
  sector: String,
  fundingStage: String,
  currentValuation: Number
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
  type: String,
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

async function completeDemoData() {
  try {
    console.log('🚀 Completing Demo Data Population...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get existing data
    const users = await User.find();
    const companies = await Company.find();
    
    console.log(`📊 Found ${users.length} users and ${companies.length} companies`);

    if (users.length === 0) {
      console.log('❌ No users found! Please add users manually first.');
      return;
    }

    if (companies.length === 0) {
      console.log('❌ No companies found! Please run populate-demo-data.cjs first.');
      return;
    }

    // Clear existing investment-related data
    console.log('\n🧹 Clearing existing investment data...');
    await Investment.deleteMany({});
    await Transaction.deleteMany({});
    await ActivityLog.deleteMany({});

    // Create investments
    console.log('\n💰 Creating investments...');
    const investments = await createInvestments(companies, users);
    console.log(`✅ Created ${investments.length} investments`);

    // Create transactions
    console.log('\n💳 Creating transactions...');
    const transactions = await createTransactions(investments, companies, users);
    console.log(`✅ Created ${transactions.length} transactions`);

    // Create activity logs
    console.log('\n📊 Creating activity logs...');
    const activityLogs = await createActivityLogs(users, companies, investments);
    console.log(`✅ Created ${activityLogs.length} activity logs`);

    // Summary
    console.log('\n🎉 Demo data completion successful!');
    console.log(`📈 Final Summary:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Companies: ${companies.length}`);
    console.log(`   Investments: ${investments.length}`);
    console.log(`   Transactions: ${transactions.length}`);
    console.log(`   Activity Logs: ${activityLogs.length}`);

    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
    console.log(`   Total Investment Value: $${totalInvestmentValue.toLocaleString()}`);

    console.log('\n🎯 System is now ready for client demonstration!');

  } catch (error) {
    console.error('❌ Error completing demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Investment creation function (same logic as before)
async function createInvestments(companies, users) {
  const investments = [];
  const investmentTypes = ['equity', 'convertible_note', 'safe', 'debt'];
  const statuses = ['active', 'exited', 'pending', 'closed'];
  
  // Create 15-20 investments
  for (let i = 0; i < 18; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const investor = users[Math.floor(Math.random() * users.length)];
    const investmentType = investmentTypes[Math.floor(Math.random() * investmentTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
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
    
    const investmentDate = new Date();
    investmentDate.setDate(investmentDate.getDate() - Math.floor(Math.random() * 730));
    
    let exitDate = null;
    let actualReturn = null;
    if (status === 'exited') {
      exitDate = new Date(investmentDate);
      exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 365));
      actualReturn = amount * (1 + (Math.random() * 0.8 - 0.2));
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
      expectedReturn: Math.round(amount * (1.2 + Math.random() * 0.8)),
      actualReturn: actualReturn ? Math.round(actualReturn) : null,
      exitDate,
      notes: `${investmentType} investment in ${company.name} - ${company.fundingStage} round`
    });
  }
  
  return await Investment.insertMany(investments);
}

// Transaction creation function (same logic as before)
async function createTransactions(investments, companies, users) {
  const transactions = [];
  
  for (const investment of investments) {
    // Initial investment transaction
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
    
    // Dividend transactions for active investments
    if (investment.status === 'active' && Math.random() > 0.4) {
      const dividendCount = Math.floor(Math.random() * 4) + 1;
      for (let i = 0; i < dividendCount; i++) {
        const dividendDate = new Date(investment.investmentDate);
        dividendDate.setMonth(dividendDate.getMonth() + (i + 1) * 3);
        
        if (dividendDate <= new Date()) {
          transactions.push({
            investmentId: investment._id,
            investorId: investment.investorId,
            companyId: investment.companyId,
            type: 'dividend',
            amount: Math.round(investment.amount * 0.02 * (1 + Math.random() * 0.5)),
            date: dividendDate,
            description: `Quarterly dividend payment`,
            status: 'completed'
          });
        }
      }
    }
    
    // Exit transactions
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
    
    // Management fees
    if (Math.random() > 0.6) {
      const feeDate = new Date(investment.investmentDate);
      feeDate.setMonth(feeDate.getMonth() + 6);
      
      if (feeDate <= new Date()) {
        transactions.push({
          investmentId: investment._id,
          investorId: investment.investorId,
          companyId: investment.companyId,
          type: 'fee',
          amount: -Math.round(investment.amount * 0.015),
          date: feeDate,
          description: `Annual management fee`,
          status: 'completed'
        });
      }
    }
  }
  
  return await Transaction.insertMany(transactions);
}

// Activity logs creation function (same logic as before)
async function createActivityLogs(users, companies, investments) {
  const activities = [];
  const actions = [
    'user_login', 'user_logout', 'investment_created', 'investment_updated', 
    'company_viewed', 'portfolio_viewed', 'report_generated', 'profile_updated',
    'transaction_processed', 'document_uploaded', 'notification_sent'
  ];
  
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];
  
  for (let i = 0; i < 75; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const activityDate = new Date();
    activityDate.setDate(activityDate.getDate() - Math.floor(Math.random() * 180));
    
    let description = `User ${user.firstName} ${user.lastName} performed ${action.replace('_', ' ')}`;
    let metadata = { action: action };
    
    if (action === 'company_viewed' && companies.length > 0) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      description = `User viewed ${company.name} company profile`;
      metadata = { companyName: company.name, sector: company.sector };
    }
    
    activities.push({
      userId: user._id,
      action,
      entityType: 'user',
      entityId: user._id.toString(),
      description,
      metadata,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      createdAt: activityDate
    });
  }
  
  return await ActivityLog.insertMany(activities);
}

completeDemoData();
