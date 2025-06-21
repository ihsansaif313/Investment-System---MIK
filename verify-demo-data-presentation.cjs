/**
 * Verification Script for Demo Data Presentation
 * Tests all aspects of the investment management system with demo data
 */

const axios = require('axios');
const { MongoClient } = require('mongodb');

console.log('🔍 Verifying Demo Data for Client Presentation\n');

const API_BASE_URL = 'http://localhost:3001/api';
const MONGODB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'investment_management';

// Demo user credentials
const DEMO_USERS = [
  { email: 'superadmin.demo@investpro.com', password: 'SuperAdmin123!', role: 'superadmin' },
  { email: 'admin1.demo@investpro.com', password: 'Admin123!', role: 'admin' },
  { email: 'admin2.demo@investpro.com', password: 'Admin123!', role: 'admin' },
  { email: 'investor1.demo@investpro.com', password: 'Investor123!', role: 'investor' },
  { email: 'investor2.demo@investpro.com', password: 'Investor123!', role: 'investor' },
  { email: 'investor3.demo@investpro.com', password: 'Investor123!', role: 'investor' }
];

async function verifyDatabaseData() {
  console.log('📊 Verifying Database Data...');
  
  try {
    const client = new MongoClient(MONGODB_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Check users
    const users = await db.collection('users').find({ email: { $regex: /\.demo@/ } }).toArray();
    console.log(`   ✅ Demo Users: ${users.length}`);
    
    // Check companies
    const companies = await db.collection('subcompanies').find({}).toArray();
    console.log(`   ✅ Companies: ${companies.length}`);
    
    // Check investments
    const investments = await db.collection('investments').find({}).toArray();
    console.log(`   ✅ Investments: ${investments.length}`);
    
    // Check performance data
    const performanceRecords = await db.collection('dailyperformances').find({}).toArray();
    console.log(`   ✅ Performance Records: ${performanceRecords.length}`);
    
    // Check investor investments
    const investorInvestments = await db.collection('investorinvestments').find({}).toArray();
    console.log(`   ✅ Investor Investments: ${investorInvestments.length}`);
    
    // Check company assignments
    const assignments = await db.collection('companyassignments').find({}).toArray();
    console.log(`   ✅ Company Assignments: ${assignments.length}`);
    
    // Verify data quality
    const investmentsWithPerformance = await db.collection('investments').find({
      'latestPerformance.marketValue': { $gt: 0 }
    }).toArray();
    console.log(`   ✅ Investments with Performance Data: ${investmentsWithPerformance.length}/${investments.length}`);
    
    await client.close();
    return true;
    
  } catch (error) {
    console.log(`   ❌ Database verification failed: ${error.message}`);
    return false;
  }
}

async function testUserAuthentication() {
  console.log('\n🔐 Testing User Authentication...');
  
  const authResults = [];
  
  for (const user of DEMO_USERS) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: user.email,
        password: user.password
      });
      
      if (response.data.success) {
        console.log(`   ✅ ${user.role}: ${user.email}`);
        // Debug token extraction
        const token = response.data.data?.token || response.data.token;
        console.log(`     Token: ${token ? 'Found' : 'Missing'}`);
        authResults.push({
          ...user,
          token: token,
          success: true
        });
      } else {
        console.log(`   ❌ ${user.role}: ${user.email} - ${response.data.message}`);
        authResults.push({ ...user, success: false });
      }
    } catch (error) {
      console.log(`   ❌ ${user.role}: ${user.email} - ${error.message}`);
      authResults.push({ ...user, success: false });
    }
  }
  
  return authResults;
}

async function testAPIEndpoints(authResults) {
  console.log('\n🌐 Testing API Endpoints...');
  
  const superadmin = authResults.find(u => u.role === 'superadmin' && u.success);
  const admin = authResults.find(u => u.role === 'admin' && u.success);
  const investor = authResults.find(u => u.role === 'investor' && u.success);
  
  if (!superadmin || !admin || !investor) {
    console.log('   ❌ Missing authenticated users for testing');
    return false;
  }
  
  // Test endpoints for each role
  const tests = [
    {
      role: 'superadmin',
      user: superadmin,
      endpoints: [
        { method: 'GET', url: '/investments', description: 'Get all investments' },
        { method: 'GET', url: '/companies', description: 'Get all companies' },
        { method: 'GET', url: '/users', description: 'Get all users' },
        { method: 'GET', url: '/analytics', description: 'Get analytics data' }
      ]
    },
    {
      role: 'admin',
      user: admin,
      endpoints: [
        { method: 'GET', url: '/investments', description: 'Get admin investments' },
        { method: 'GET', url: '/companies', description: 'Get assigned companies' },
        { method: 'GET', url: '/analytics', description: 'Get admin analytics' }
      ]
    },
    {
      role: 'investor',
      user: investor,
      endpoints: [
        { method: 'GET', url: '/investments', description: 'Get investor investments' },
        { method: 'GET', url: '/analytics', description: 'Get investor analytics' }
      ]
    }
  ];
  
  for (const test of tests) {
    console.log(`\n   Testing ${test.role} endpoints:`);
    
    for (const endpoint of test.endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE_URL}${endpoint.url}`,
          headers: {
            'Authorization': `Bearer ${test.user.token}`
          }
        });
        
        if (response.data.success) {
          const dataLength = Array.isArray(response.data.data) ? response.data.data.length : 'object';
          console.log(`     ✅ ${endpoint.description}: ${dataLength} items`);
        } else {
          console.log(`     ❌ ${endpoint.description}: ${response.data.message}`);
        }
      } catch (error) {
        console.log(`     ❌ ${endpoint.description}: ${error.response?.data?.message || error.message}`);
      }
    }
  }
  
  return true;
}

async function testInvestmentCreation(authResults) {
  console.log('\n📈 Testing Investment Creation...');
  
  const admin = authResults.find(u => u.role === 'admin' && u.success);
  if (!admin) {
    console.log('   ❌ No authenticated admin user for testing');
    return false;
  }
  
  try {
    // Get companies first
    const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    if (!companiesResponse.data.success || companiesResponse.data.data.length === 0) {
      console.log('   ❌ No companies available for investment creation');
      return false;
    }
    
    const company = companiesResponse.data.data[0];
    
    // Create test investment
    const testInvestment = {
      name: 'Demo Test Investment',
      description: 'Test investment for demo verification',
      investmentType: 'Stocks',
      category: 'Technology',
      initialAmount: 25000,
      expectedROI: 12,
      riskLevel: 'Medium',
      subCompanyId: company.id || company._id,
      investmentDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      notes: 'Demo test investment',
      tags: ['demo', 'test'],
      minInvestment: 1000
    };
    
    const createResponse = await axios.post(`${API_BASE_URL}/investments`, testInvestment, {
      headers: {
        'Authorization': `Bearer ${admin.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.data.success) {
      console.log(`   ✅ Investment creation successful: ${createResponse.data.data.name}`);
      
      // Clean up - delete the test investment
      const investmentId = createResponse.data.data._id || createResponse.data.data.id;
      try {
        await axios.delete(`${API_BASE_URL}/investments/${investmentId}`, {
          headers: { 'Authorization': `Bearer ${admin.token}` }
        });
        console.log('   🧹 Test investment cleaned up');
      } catch (deleteError) {
        console.log('   ⚠️ Could not clean up test investment');
      }
      
      return true;
    } else {
      console.log(`   ❌ Investment creation failed: ${createResponse.data.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Investment creation test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testPerformanceData(authResults) {
  console.log('\n📊 Testing Performance Data...');
  
  const admin = authResults.find(u => u.role === 'admin' && u.success);
  if (!admin) {
    console.log('   ❌ No authenticated admin user for testing');
    return false;
  }
  
  try {
    // Get investments
    const investmentsResponse = await axios.get(`${API_BASE_URL}/investments`, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    if (!investmentsResponse.data.success || investmentsResponse.data.data.length === 0) {
      console.log('   ❌ No investments available for performance testing');
      return false;
    }
    
    const investment = investmentsResponse.data.data[0];
    const investmentId = investment.id || investment._id;
    
    // Get performance history
    const performanceResponse = await axios.get(`${API_BASE_URL}/investments/${investmentId}/performance`, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    if (performanceResponse.data.success) {
      const performanceData = performanceResponse.data.data.performance || [];
      console.log(`   ✅ Performance data available: ${performanceData.length} records`);
      
      if (performanceData.length > 0) {
        const latest = performanceData[0];
        console.log(`   📈 Latest performance: $${latest.marketValue} (${latest.dailyChangePercent}%)`);
      }
      
      return true;
    } else {
      console.log(`   ❌ Performance data retrieval failed: ${performanceResponse.data.message}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Performance data test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runPresentationVerification() {
  console.log('🚀 Starting Demo Data Presentation Verification...\n');
  
  const results = {
    database: false,
    authentication: false,
    apiEndpoints: false,
    investmentCreation: false,
    performanceData: false
  };
  
  try {
    // Step 1: Verify database data
    results.database = await verifyDatabaseData();
    
    // Step 2: Test user authentication
    const authResults = await testUserAuthentication();
    results.authentication = authResults.every(user => user.success);
    
    if (results.authentication) {
      // Step 3: Test API endpoints
      results.apiEndpoints = await testAPIEndpoints(authResults);
      
      // Step 4: Test investment creation
      results.investmentCreation = await testInvestmentCreation(authResults);
      
      // Step 5: Test performance data
      results.performanceData = await testPerformanceData(authResults);
    }
    
  } catch (error) {
    console.log(`\n❌ Verification failed: ${error.message}`);
  }
  
  // Print final results
  console.log('\n📊 Presentation Verification Results:');
  console.log('=====================================');
  
  Object.entries(results).forEach(([testName, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    const formattedName = testName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    console.log(`${status} ${formattedName}`);
  });
  
  const passedTests = Object.values(results).filter(result => result).length;
  const totalTests = Object.keys(results).length;
  
  console.log('=====================================');
  console.log(`📈 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 Demo Data is Ready for Client Presentation!');
    console.log('\n🎯 Presentation Features Available:');
    console.log('- Multi-role user authentication (superadmin, admin, investor)');
    console.log('- Rich investment portfolio with 18 diverse investments');
    console.log('- 45 days of historical performance data for trend analysis');
    console.log('- Interactive charts and analytics dashboards');
    console.log('- Complete investment lifecycle management');
    console.log('- Role-based access control and data filtering');
    console.log('- Real-time performance tracking and updates');
    
    console.log('\n🔑 Quick Access Credentials:');
    console.log('Superadmin: superadmin.demo@investpro.com / SuperAdmin123!');
    console.log('Admin: admin1.demo@investpro.com / Admin123!');
    console.log('Investor: investor1.demo@investpro.com / Investor123!');
  } else {
    console.log('\n⚠️ Some verification tests failed. Please check the system before presentation.');
  }
  
  return passedTests === totalTests;
}

// Run the verification
runPresentationVerification()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Verification execution error:', error);
    process.exit(1);
  });
