/**
 * Verify Demo Data Population
 * Check what demo data has been created in the system
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define schemas
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
  currentValuation: Number,
  fundingStage: String,
  totalFundingRaised: Number,
  status: String,
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
  actualReturn: Number
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
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

// Create models
const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Investment = mongoose.model('Investment', investmentSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

async function verifyDemoData() {
  try {
    console.log('🔍 Verifying Demo Data Population...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Check Users
    const users = await User.find();
    console.log(`\n👥 Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    });

    // Check Companies
    const companies = await Company.find();
    console.log(`\n🏢 Companies: ${companies.length}`);
    companies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name}`);
      console.log(`      Sector: ${company.sector}`);
      console.log(`      Stage: ${company.fundingStage}`);
      console.log(`      Valuation: $${company.currentValuation.toLocaleString()}`);
      console.log(`      Revenue: $${company.financialMetrics.revenue.toLocaleString()}`);
      console.log(`      Growth Rate: ${company.financialMetrics.growthRate}%`);
      console.log('');
    });

    // Check Investments
    const investments = await Investment.find().populate('companyId', 'name').populate('investorId', 'firstName lastName');
    console.log(`\n💰 Investments: ${investments.length}`);
    investments.forEach((investment, index) => {
      console.log(`   ${index + 1}. $${investment.amount.toLocaleString()} in ${investment.companyId?.name || 'Unknown Company'}`);
      console.log(`      Investor: ${investment.investorId?.firstName || 'Unknown'} ${investment.investorId?.lastName || ''}`);
      console.log(`      Type: ${investment.investmentType}`);
      console.log(`      Status: ${investment.status}`);
      console.log('');
    });

    // Check Transactions
    const transactions = await Transaction.find().populate('companyId', 'name');
    console.log(`\n💳 Transactions: ${transactions.length}`);
    const transactionSummary = transactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(transactionSummary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} transactions`);
    });

    // Check Activity Logs
    const activityLogs = await ActivityLog.find();
    console.log(`\n📊 Activity Logs: ${activityLogs.length}`);
    const activitySummary = activityLogs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(activitySummary).forEach(([action, count]) => {
      console.log(`   ${action}: ${count} activities`);
    });

    // Summary Statistics
    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Companies: ${companies.length}`);
    console.log(`   Total Investments: ${investments.length}`);
    console.log(`   Total Transactions: ${transactions.length}`);
    console.log(`   Total Activity Logs: ${activityLogs.length}`);

    if (investments.length > 0) {
      const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.amount, 0);
      const avgInvestmentSize = totalInvestmentValue / investments.length;
      console.log(`   Total Investment Value: $${totalInvestmentValue.toLocaleString()}`);
      console.log(`   Average Investment Size: $${Math.round(avgInvestmentSize).toLocaleString()}`);
    }

    if (companies.length > 0) {
      const totalValuation = companies.reduce((sum, comp) => sum + comp.currentValuation, 0);
      const avgValuation = totalValuation / companies.length;
      console.log(`   Total Company Valuation: $${totalValuation.toLocaleString()}`);
      console.log(`   Average Company Valuation: $${Math.round(avgValuation).toLocaleString()}`);
    }

    console.log('\n🎯 Demo Data Status:');
    if (users.length === 0) {
      console.log('⚠️  No users found - add users manually then run populate script again');
    } else if (investments.length === 0) {
      console.log('⚠️  No investments found - run populate script again to add investment data');
    } else {
      console.log('✅ Demo data is complete and ready for demonstration');
    }

  } catch (error) {
    console.error('❌ Error verifying demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyDemoData();
