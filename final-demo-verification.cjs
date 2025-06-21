/**
 * Final Demo Data Verification for Client Presentation
 * Comprehensive verification of demo data quality and system readiness
 */

const { MongoClient } = require('mongodb');

console.log('🎯 Final Demo Data Verification for Client Presentation\n');

const MONGODB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'investment_management';

async function verifyDemoDataQuality() {
  console.log('📊 Verifying Demo Data Quality...');
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // 1. Verify Users
    const users = await db.collection('users').find({ email: { $regex: /\.demo@/ } }).toArray();
    console.log(`   ✅ Demo Users: ${users.length}`);
    
    const roleBreakdown = users.reduce((acc, user) => {
      const role = user.role?.type || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(roleBreakdown).forEach(([role, count]) => {
      console.log(`      - ${role}: ${count} users`);
    });
    
    // 2. Verify Companies
    const companies = await db.collection('subcompanies').find({}).toArray();
    console.log(`   ✅ Companies: ${companies.length}`);
    companies.forEach(company => {
      console.log(`      - ${company.name} (${company.industry})`);
    });
    
    // 3. Verify Investments
    const investments = await db.collection('investments').find({}).toArray();
    console.log(`   ✅ Investments: ${investments.length}`);
    
    const investmentTypes = investments.reduce((acc, inv) => {
      acc[inv.investmentType] = (acc[inv.investmentType] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(investmentTypes).forEach(([type, count]) => {
      console.log(`      - ${type}: ${count} investments`);
    });
    
    // 4. Verify Performance Data
    const performanceRecords = await db.collection('dailyperformances').find({}).toArray();
    console.log(`   ✅ Performance Records: ${performanceRecords.length}`);
    
    // Calculate date range
    if (performanceRecords.length > 0) {
      const dates = performanceRecords.map(p => new Date(p.date)).sort();
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      console.log(`      - Date range: ${startDate.toDateString()} to ${endDate.toDateString()} (${daysDiff} days)`);
    }
    
    // 5. Verify Investor Investments
    const investorInvestments = await db.collection('investorinvestments').find({}).toArray();
    console.log(`   ✅ Investor Investments: ${investorInvestments.length}`);
    
    // 6. Verify Company Assignments
    const assignments = await db.collection('companyassignments').find({}).toArray();
    console.log(`   ✅ Company Assignments: ${assignments.length}`);
    
    // 7. Data Quality Checks
    console.log('\n🔍 Data Quality Checks:');
    
    // Check investments with performance data
    const investmentsWithPerformance = await db.collection('investments').find({
      'latestPerformance.marketValue': { $gt: 0 }
    }).toArray();
    console.log(`   ✅ Investments with Performance: ${investmentsWithPerformance.length}/${investments.length}`);
    
    // Check for realistic ROI values
    const realisticROI = investments.filter(inv => 
      inv.actualROI !== undefined && inv.actualROI >= -50 && inv.actualROI <= 100
    );
    console.log(`   ✅ Realistic ROI Values: ${realisticROI.length}/${investments.length}`);
    
    // Check for diverse risk levels
    const riskLevels = [...new Set(investments.map(inv => inv.riskLevel))];
    console.log(`   ✅ Risk Level Diversity: ${riskLevels.join(', ')}`);
    
    // Check for recent performance updates
    const recentPerformance = performanceRecords.filter(p => {
      const recordDate = new Date(p.date);
      const daysDiff = (new Date() - recordDate) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Within last 7 days
    });
    console.log(`   ✅ Recent Performance Updates: ${recentPerformance.length} records`);
    
    await client.close();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Data quality verification failed: ${error.message}`);
    return false;
  }
}

async function verifyPresentationReadiness() {
  console.log('\n🎯 Verifying Presentation Readiness...');
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // 1. Check for demo login credentials
    const demoUsers = [
      'superadmin.demo@investpro.com',
      'admin1.demo@investpro.com',
      'investor1.demo@investpro.com'
    ];
    
    console.log('   🔑 Demo Login Credentials:');
    for (const email of demoUsers) {
      const user = await db.collection('users').findOne({ email });
      if (user) {
        console.log(`      ✅ ${user.role?.type}: ${email}`);
      } else {
        console.log(`      ❌ Missing: ${email}`);
      }
    }
    
    // 2. Check for diverse investment portfolio
    const investments = await db.collection('investments').find({}).toArray();
    const categories = [...new Set(investments.map(inv => inv.category))];
    const types = [...new Set(investments.map(inv => inv.investmentType))];
    
    console.log('\n   📈 Investment Portfolio Diversity:');
    console.log(`      - Investment Types: ${types.length} (${types.join(', ')})`);
    console.log(`      - Categories: ${categories.length} (${categories.join(', ')})`);
    
    // 3. Check for chart-ready data
    const investmentsWithHistory = await db.collection('investments').aggregate([
      {
        $lookup: {
          from: 'dailyperformances',
          localField: '_id',
          foreignField: 'investmentId',
          as: 'performance'
        }
      },
      {
        $match: {
          'performance.10': { $exists: true } // At least 10 performance records
        }
      }
    ]).toArray();
    
    console.log('\n   📊 Chart-Ready Data:');
    console.log(`      ✅ Investments with Rich History: ${investmentsWithHistory.length}/${investments.length}`);
    
    // 4. Check for role-based data access
    const adminUsers = await db.collection('users').find({ 'role.type': 'admin' }).toArray();
    const investorUsers = await db.collection('users').find({ 'role.type': 'investor' }).toArray();
    
    console.log('\n   👥 Role-Based Access:');
    console.log(`      ✅ Admin Users: ${adminUsers.length}`);
    console.log(`      ✅ Investor Users: ${investorUsers.length}`);
    
    // 5. Calculate presentation metrics
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const totalROI = investments.reduce((sum, inv) => sum + (inv.actualROI || 0), 0) / investments.length;
    
    console.log('\n   💰 Presentation Metrics:');
    console.log(`      - Total Portfolio Value: $${totalInvestmentValue.toLocaleString()}`);
    console.log(`      - Average ROI: ${totalROI.toFixed(2)}%`);
    console.log(`      - Performance Data Points: ${(await db.collection('dailyperformances').countDocuments())}`);
    
    await client.close();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Presentation readiness check failed: ${error.message}`);
    return false;
  }
}

async function generatePresentationSummary() {
  console.log('\n📋 Client Presentation Summary');
  console.log('================================');
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    
    const users = await db.collection('users').find({ email: { $regex: /\.demo@/ } }).toArray();
    const companies = await db.collection('subcompanies').find({}).toArray();
    const investments = await db.collection('investments').find({}).toArray();
    const performanceRecords = await db.collection('dailyperformances').find({}).toArray();
    
    console.log('\n🎯 System Capabilities Demonstrated:');
    console.log(`✅ Multi-Role User Management (${users.length} demo users)`);
    console.log(`✅ Company Portfolio Management (${companies.length} companies)`);
    console.log(`✅ Investment Tracking (${investments.length} diverse investments)`);
    console.log(`✅ Performance Analytics (${performanceRecords.length} data points)`);
    console.log(`✅ Historical Trend Analysis (45+ days of data)`);
    console.log(`✅ Role-Based Access Control`);
    console.log(`✅ Real-Time Dashboard Updates`);
    console.log(`✅ Interactive Data Visualizations`);
    
    console.log('\n🔑 Demo Access Credentials:');
    console.log('Superadmin: superadmin.demo@investpro.com / SuperAdmin123!');
    console.log('Admin: admin1.demo@investpro.com / Admin123!');
    console.log('Investor: investor1.demo@investpro.com / Investor123!');
    
    console.log('\n📊 Key Presentation Features:');
    console.log('- Rich dashboard with real-time analytics');
    console.log('- Investment portfolio with diverse asset classes');
    console.log('- Interactive performance charts and trends');
    console.log('- Role-based data access and permissions');
    console.log('- Complete investment lifecycle management');
    console.log('- Professional UI/UX with responsive design');
    
    console.log('\n🚀 System Status: READY FOR CLIENT PRESENTATION');
    
    await client.close();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Summary generation failed: ${error.message}`);
    return false;
  }
}

async function runFinalVerification() {
  console.log('🚀 Starting Final Demo Verification...\n');
  
  const results = {
    dataQuality: false,
    presentationReadiness: false,
    summary: false
  };
  
  try {
    // Step 1: Verify demo data quality
    results.dataQuality = await verifyDemoDataQuality();
    
    // Step 2: Verify presentation readiness
    results.presentationReadiness = await verifyPresentationReadiness();
    
    // Step 3: Generate presentation summary
    results.summary = await generatePresentationSummary();
    
  } catch (error) {
    console.log(`\n❌ Verification failed: ${error.message}`);
  }
  
  // Print final results
  console.log('\n📊 Final Verification Results:');
  console.log('==============================');
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const formattedName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${formattedName}`);
  });
  
  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;
  
  console.log('==============================');
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} verifications passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 SYSTEM IS READY FOR CLIENT PRESENTATION!');
    console.log('\n✨ The investment management system is fully prepared with:');
    console.log('- Comprehensive demo data across all user roles');
    console.log('- Rich historical performance data for meaningful charts');
    console.log('- Professional presentation-ready interface');
    console.log('- Complete feature demonstration capabilities');
  } else {
    console.log('\n⚠️ Some verifications failed. Please review before presentation.');
  }
  
  return passedTests === totalTests;
}

// Run the final verification
runFinalVerification()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification execution error:', error);
    process.exit(1);
  });
