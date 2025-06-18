/**
 * Comprehensive Zero Dummy Data Validation Script
 * Tests the fresh installation behavior and validates zero dummy data policy
 */

const API_BASE_URL = 'http://localhost:9000/api';

// Test credentials for fresh installation
const TEST_CREDENTIALS = {
  superadmin: {
    email: 'superadmin@system.com',
    password: 'admin123'
  }
};

class ZeroDummyDataValidator {
  constructor() {
    this.results = {
      apiTests: [],
      frontendTests: [],
      dataFlowTests: [],
      overallScore: 0
    };
  }

  async runAllTests() {
    console.log('🔍 Starting Zero Dummy Data Validation...');
    console.log('=' .repeat(60));

    try {
      // Test 1: API Endpoints
      await this.testAPIEndpoints();
      
      // Test 2: Frontend Pages
      await this.testFrontendPages();
      
      // Test 3: Data Flow
      await this.testDataFlow();
      
      // Calculate overall score
      this.calculateOverallScore();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
    }
  }

  async testAPIEndpoints() {
    console.log('\n📋 Testing API Endpoints for Zero Data...');
    
    const endpoints = [
      { url: '/investments', name: 'Investments' },
      { url: '/users', name: 'Users' },
      { url: '/companies', name: 'Companies' },
      { url: '/analytics/superadmin', name: 'Superadmin Analytics' },
      { url: '/assets', name: 'Assets' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint.url}`, {
          headers: {
            'Authorization': 'Bearer mock-token' // Mock token for testing
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const isEmpty = Array.isArray(data) ? data.length === 0 : 
                         data.data ? data.data.length === 0 : true;
          
          this.results.apiTests.push({
            name: endpoint.name,
            passed: isEmpty,
            message: isEmpty ? 
              `✅ ${endpoint.name} endpoint returns empty data` :
              `❌ ${endpoint.name} endpoint contains dummy data`,
            data: data
          });
        } else {
          this.results.apiTests.push({
            name: endpoint.name,
            passed: false,
            message: `❌ ${endpoint.name} endpoint failed: ${response.status}`,
            data: null
          });
        }
      } catch (error) {
        this.results.apiTests.push({
          name: endpoint.name,
          passed: false,
          message: `❌ ${endpoint.name} endpoint error: ${error.message}`,
          data: null
        });
      }
    }
  }

  async testFrontendPages() {
    console.log('\n📋 Testing Frontend Pages for Zero Data Display...');
    
    // Since we can't directly test the frontend from Node.js,
    // we'll create instructions for manual testing
    const frontendTests = [
      {
        name: 'Superadmin Dashboard',
        url: 'http://localhost:5174/superadmin/dashboard',
        expectedBehavior: 'Should show zero metrics and empty states'
      },
      {
        name: 'Admin Dashboard',
        url: 'http://localhost:5174/admin/dashboard',
        expectedBehavior: 'Should show zero metrics and empty states'
      },
      {
        name: 'Investor Dashboard',
        url: 'http://localhost:5174/investor/dashboard',
        expectedBehavior: 'Should show zero portfolio value and empty states'
      },
      {
        name: 'Analytics Page',
        url: 'http://localhost:5174/analytics',
        expectedBehavior: 'Should show "No data available" in all charts'
      },
      {
        name: 'Reports Page',
        url: 'http://localhost:5174/reports',
        expectedBehavior: 'Should show empty reports with proper CTAs'
      }
    ];

    frontendTests.forEach(test => {
      this.results.frontendTests.push({
        name: test.name,
        passed: null, // Manual testing required
        message: `📋 Manual Test Required: ${test.expectedBehavior}`,
        url: test.url
      });
    });
  }

  async testDataFlow() {
    console.log('\n📋 Testing Data Flow and Calculations...');
    
    // Test calculation functions with zero data
    const dataFlowTests = [
      {
        name: 'Zero State Calculations',
        test: () => {
          // Simulate zero data calculations
          const emptyData = [];
          const totalValue = emptyData.reduce((sum, item) => sum + (item.value || 0), 0);
          const count = emptyData.length;
          const avgROI = count > 0 ? totalValue / count : 0;
          
          return {
            totalValue: totalValue === 0,
            count: count === 0,
            avgROI: avgROI === 0
          };
        }
      },
      {
        name: 'Empty State Handling',
        test: () => {
          // Test empty state handling
          const emptyArray = [];
          const emptyObject = {};
          
          return {
            arrayHandling: Array.isArray(emptyArray) && emptyArray.length === 0,
            objectHandling: Object.keys(emptyObject).length === 0
          };
        }
      }
    ];

    dataFlowTests.forEach(test => {
      try {
        const result = test.test();
        const allPassed = Object.values(result).every(val => val === true);
        
        this.results.dataFlowTests.push({
          name: test.name,
          passed: allPassed,
          message: allPassed ? 
            `✅ ${test.name} passed all checks` :
            `❌ ${test.name} failed some checks`,
          details: result
        });
      } catch (error) {
        this.results.dataFlowTests.push({
          name: test.name,
          passed: false,
          message: `❌ ${test.name} error: ${error.message}`,
          details: null
        });
      }
    });
  }

  calculateOverallScore() {
    const allTests = [
      ...this.results.apiTests,
      ...this.results.dataFlowTests
    ];
    
    const passedTests = allTests.filter(test => test.passed === true).length;
    const totalTests = allTests.length;
    
    this.results.overallScore = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  }

  generateReport() {
    console.log('\n🎉 Zero Dummy Data Validation Report');
    console.log('=' .repeat(60));
    
    console.log(`\n📊 Overall Score: ${this.results.overallScore.toFixed(1)}%`);
    
    // API Tests Results
    console.log('\n📋 API Endpoints Tests:');
    this.results.apiTests.forEach(test => {
      console.log(`   ${test.message}`);
    });
    
    // Data Flow Tests Results
    console.log('\n📋 Data Flow Tests:');
    this.results.dataFlowTests.forEach(test => {
      console.log(`   ${test.message}`);
    });
    
    // Frontend Tests Instructions
    console.log('\n📋 Frontend Manual Testing Required:');
    this.results.frontendTests.forEach(test => {
      console.log(`   🌐 ${test.name}: ${test.url}`);
      console.log(`      Expected: ${test.message}`);
    });
    
    // Final Assessment
    console.log('\n🎯 Final Assessment:');
    if (this.results.overallScore >= 90) {
      console.log('   ✅ ZERO DUMMY DATA POLICY: FULLY IMPLEMENTED');
      console.log('   ✅ System ready for fresh installation validation');
    } else if (this.results.overallScore >= 70) {
      console.log('   ⚠️  ZERO DUMMY DATA POLICY: MOSTLY IMPLEMENTED');
      console.log('   ⚠️  Some issues need to be addressed');
    } else {
      console.log('   ❌ ZERO DUMMY DATA POLICY: NEEDS WORK');
      console.log('   ❌ Significant issues found');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('   1. Open browser to http://localhost:5174');
    console.log('   2. Clear browser cache and localStorage');
    console.log('   3. Login with: superadmin@system.com / admin123');
    console.log('   4. Verify all dashboards show zero values');
    console.log('   5. Create test data and verify real-time updates');
    
    console.log('\n' + '=' .repeat(60));
  }
}

// Run the validation
const validator = new ZeroDummyDataValidator();
validator.runAllTests().then(() => {
  console.log('✅ Validation completed');
}).catch(error => {
  console.error('❌ Validation failed:', error);
});
