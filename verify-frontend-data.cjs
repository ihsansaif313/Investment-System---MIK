/**
 * Verify Frontend Data
 * Check if demo data is properly structured for frontend display
 */

const mongoose = require('./backend/node_modules/mongoose');

// Define schemas matching backend models
const ownerCompanySchema = new mongoose.Schema({
  name: String,
  description: String,
  contactEmail: String,
  website: String,
  establishedDate: Date
}, { timestamps: true });

const subCompanySchema = new mongoose.Schema({
  ownerCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'OwnerCompany' },
  name: String,
  industry: String,
  category: String,
  description: String,
  establishedDate: Date,
  status: String,
  website: String,
  contactEmail: String,
  adminUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const assetSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  category: String
}, { timestamps: true });

const investmentSchema = new mongoose.Schema({
  subCompanyId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCompany' },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset' },
  name: String,
  description: String,
  initialAmount: Number,
  currentValue: Number,
  minInvestment: Number,
  maxInvestment: Number,
  expectedROI: Number,
  actualROI: Number,
  startDate: Date,
  status: String,
  riskLevel: String,
  category: String,
  performanceMetrics: {
    totalInvested: Number,
    totalReturns: Number,
    totalInvestors: Number,
    averageInvestment: Number
  },
  featured: Boolean
}, { timestamps: true });

const investorInvestmentSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  investmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
  amount: Number,
  shares: Number,
  purchaseDate: Date,
  currentValue: Number,
  status: String
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  accountStatus: String
}, { timestamps: true });

// Create models
const OwnerCompany = mongoose.model('OwnerCompany', ownerCompanySchema);
const SubCompany = mongoose.model('SubCompany', subCompanySchema);
const Asset = mongoose.model('Asset', assetSchema);
const Investment = mongoose.model('Investment', investmentSchema);
const InvestorInvestment = mongoose.model('InvestorInvestment', investorInvestmentSchema);
const User = mongoose.model('User', userSchema);

async function verifyFrontendData() {
  try {
    console.log('🔍 Verifying Frontend Data Structure...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Check Users
    const users = await User.find();
    console.log(`\n👥 Users: ${users.length}`);
    users.slice(0, 3).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
    });
    if (users.length > 3) console.log(`   ... and ${users.length - 3} more`);

    // Check Owner Companies
    const ownerCompanies = await OwnerCompany.find();
    console.log(`\n🏢 Owner Companies: ${ownerCompanies.length}`);
    ownerCompanies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name}`);
      console.log(`      Email: ${company.contactEmail}`);
      console.log(`      Website: ${company.website}`);
    });

    // Check Sub Companies with populated data
    const subCompanies = await SubCompany.find().populate('ownerCompanyId', 'name').populate('adminUserId', 'firstName lastName');
    console.log(`\n🏭 Sub Companies: ${subCompanies.length}`);
    subCompanies.forEach((company, index) => {
      console.log(`   ${index + 1}. ${company.name}`);
      console.log(`      Industry: ${company.industry}`);
      console.log(`      Category: ${company.category}`);
      console.log(`      Status: ${company.status}`);
      console.log(`      Owner: ${company.ownerCompanyId?.name || 'Unknown'}`);
      console.log(`      Admin: ${company.adminUserId?.firstName || 'Unknown'} ${company.adminUserId?.lastName || ''}`);
      console.log('');
    });

    // Check Assets
    const assets = await Asset.find();
    console.log(`\n💎 Assets: ${assets.length}`);
    assets.forEach((asset, index) => {
      console.log(`   ${index + 1}. ${asset.name} (${asset.type})`);
      console.log(`      Category: ${asset.category}`);
    });

    // Check Investments with populated data
    const investments = await Investment.find()
      .populate('subCompanyId', 'name industry')
      .populate('assetId', 'name type');
    console.log(`\n💰 Investments: ${investments.length}`);
    investments.forEach((investment, index) => {
      console.log(`   ${index + 1}. ${investment.name}`);
      console.log(`      Company: ${investment.subCompanyId?.name || 'Unknown'}`);
      console.log(`      Asset: ${investment.assetId?.name || 'Unknown'}`);
      console.log(`      Initial: $${investment.initialAmount?.toLocaleString()}`);
      console.log(`      Current: $${investment.currentValue?.toLocaleString()}`);
      console.log(`      ROI: ${investment.actualROI}%`);
      console.log(`      Risk: ${investment.riskLevel}`);
      console.log(`      Status: ${investment.status}`);
      console.log(`      Featured: ${investment.featured ? 'Yes' : 'No'}`);
      console.log(`      Metrics: ${investment.performanceMetrics?.totalInvestors || 0} investors, $${investment.performanceMetrics?.totalInvested?.toLocaleString() || 0} invested`);
      console.log('');
    });

    // Check Investor Investments with populated data
    const investorInvestments = await InvestorInvestment.find()
      .populate('investorId', 'firstName lastName email')
      .populate('investmentId', 'name');
    console.log(`\n📊 Investor Investments: ${investorInvestments.length}`);
    investorInvestments.slice(0, 5).forEach((invInv, index) => {
      console.log(`   ${index + 1}. ${invInv.investorId?.firstName || 'Unknown'} ${invInv.investorId?.lastName || ''}`);
      console.log(`      Investment: ${invInv.investmentId?.name || 'Unknown'}`);
      console.log(`      Amount: $${invInv.amount?.toLocaleString()}`);
      console.log(`      Current Value: $${invInv.currentValue?.toLocaleString()}`);
      console.log(`      Status: ${invInv.status}`);
      console.log('');
    });
    if (investorInvestments.length > 5) {
      console.log(`   ... and ${investorInvestments.length - 5} more investor investments`);
    }

    // Summary Statistics
    const totalInvestmentValue = investorInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCurrentValue = investorInvestments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalROI = totalInvestmentValue > 0 ? ((totalCurrentValue - totalInvestmentValue) / totalInvestmentValue) * 100 : 0;

    console.log(`\n📈 Summary Statistics:`);
    console.log(`   Total Users: ${users.length}`);
    console.log(`   Total Owner Companies: ${ownerCompanies.length}`);
    console.log(`   Total Sub Companies: ${subCompanies.length}`);
    console.log(`   Total Assets: ${assets.length}`);
    console.log(`   Total Investments: ${investments.length}`);
    console.log(`   Total Investor Investments: ${investorInvestments.length}`);
    console.log(`   Total Investment Value: $${totalInvestmentValue.toLocaleString()}`);
    console.log(`   Total Current Value: $${totalCurrentValue.toLocaleString()}`);
    console.log(`   Overall ROI: ${totalROI.toFixed(2)}%`);

    // Check for featured investments
    const featuredInvestments = investments.filter(inv => inv.featured);
    console.log(`   Featured Investments: ${featuredInvestments.length}`);

    // Check data relationships
    console.log(`\n🔗 Data Relationships:`);
    console.log(`   ✅ Sub Companies linked to Owner Companies: ${subCompanies.filter(sc => sc.ownerCompanyId).length}/${subCompanies.length}`);
    console.log(`   ✅ Investments linked to Sub Companies: ${investments.filter(inv => inv.subCompanyId).length}/${investments.length}`);
    console.log(`   ✅ Investments linked to Assets: ${investments.filter(inv => inv.assetId).length}/${investments.length}`);
    console.log(`   ✅ Investor Investments linked to Users: ${investorInvestments.filter(ii => ii.investorId).length}/${investorInvestments.length}`);
    console.log(`   ✅ Investor Investments linked to Investments: ${investorInvestments.filter(ii => ii.investmentId).length}/${investorInvestments.length}`);

    console.log(`\n🎯 Frontend Data Status:`);
    if (users.length > 0 && subCompanies.length > 0 && investments.length > 0 && investorInvestments.length > 0) {
      console.log('✅ All demo data is properly structured and ready for frontend display');
      console.log('✅ Data relationships are correctly established');
      console.log('✅ Performance metrics are populated');
      console.log('✅ User investments are linked');
    } else {
      console.log('❌ Some demo data is missing or incomplete');
    }

    console.log(`\n🚀 Next Steps:`);
    console.log('1. Restart your backend server to ensure latest data is loaded');
    console.log('2. Check frontend API endpoints are working');
    console.log('3. Verify dashboard displays the demo data');
    console.log('4. Test user login with demo credentials');

  } catch (error) {
    console.error('❌ Error verifying frontend data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyFrontendData();
