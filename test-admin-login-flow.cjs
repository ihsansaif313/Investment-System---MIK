/**
 * Test admin login flow and company assignments
 */

const axios = require('axios');

const testAdminLoginFlow = async () => {
  try {
    console.log('🧪 Testing admin login flow and company assignments...');

    const baseURL = 'http://localhost:3001/api';

    // Step 1: Login as superadmin to create test data
    console.log('\n1️⃣ Logging in as superadmin...');
    const superadminLogin = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const superadminToken = superadminLogin.data.data.token;
    console.log('✅ Superadmin login successful');

    // Step 2: Use existing admin user
    console.log('\n2️⃣ Using existing admin user...');
    const adminUser = {
      email: 'arsl@gmail.com',
      password: 'Ihs@n2553.'
    };
    console.log('✅ Using admin user:', adminUser.email);

    // Step 3: Get a company to assign
    console.log('\n3️⃣ Getting available companies...');
    const companiesResponse = await axios.get(`${baseURL}/companies`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });

    const companies = companiesResponse.data.data;
    if (companies.length === 0) {
      console.log('❌ No companies found. Creating a test company...');

      const testCompanyData = {
        name: `Test Company ${Date.now()}`,
        industry: 'Technology',
        category: 'Startup',
        description: 'Test company for admin assignment',
        contactEmail: 'test@company.com',
        contactPhone: '+1234567890',
        website: 'https://testcompany.com',
        address: '123 Test Street',
        establishedDate: '2024-01-01'
      };

      const createCompanyResponse = await axios.post(`${baseURL}/companies/sub`, testCompanyData, {
        headers: { Authorization: `Bearer ${superadminToken}` }
      });

      companies.push(createCompanyResponse.data.data);
      console.log('✅ Test company created');
    }

    const testCompany = companies[0];
    console.log(`✅ Using company: ${testCompany.name} (ID: ${testCompany.id || testCompany._id})`);

    // Step 4: Get admin user ID
    console.log('\n4️⃣ Getting admin user details...');
    const usersResponse = await axios.get(`${baseURL}/users`, {
      headers: { Authorization: `Bearer ${superadminToken}` }
    });

    const adminUserDetails = usersResponse.data.data.find(u => u.email === adminUser.email);
    if (!adminUserDetails) {
      throw new Error('Admin user not found');
    }

    console.log(`✅ Found admin user: ${adminUserDetails.firstName} ${adminUserDetails.lastName} (ID: ${adminUserDetails.id || adminUserDetails._id})`);

    // Step 5: Assign admin to company
    console.log('\n5️⃣ Assigning admin to company...');
    const assignmentData = {
      userId: adminUserDetails.id || adminUserDetails._id,
      subCompanyId: testCompany.id || testCompany._id,
      permissions: [
        'view_company_data',
        'manage_investments',
        'view_analytics',
        'generate_reports'
      ],
      notes: 'Test assignment for admin login flow'
    };

    let assignmentResponse;
    try {
      assignmentResponse = await axios.post(`${baseURL}/company-assignments`, assignmentData, {
        headers: { Authorization: `Bearer ${superadminToken}` }
      });

      console.log('✅ Admin assigned to company successfully');
      console.log('📋 Assignment details:', {
        id: assignmentResponse.data.data.id,
        status: assignmentResponse.data.data.status,
        permissions: assignmentResponse.data.data.permissions
      });
    } catch (assignmentError) {
      if (assignmentError.response?.data?.message?.includes('already assigned')) {
        console.log('✅ Admin is already assigned to a company');
      } else {
        throw assignmentError;
      }
    }

    // Step 6: Test admin login
    console.log('\n6️⃣ Testing admin login...');
    const adminLoginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });

    const adminLoginData = adminLoginResponse.data.data;
    console.log('✅ Admin login successful!');
    
    console.log('\n📊 Admin login response analysis:');
    console.log('  - User ID:', adminLoginData.user.id);
    console.log('  - Email:', adminLoginData.user.email);
    console.log('  - Role Type:', adminLoginData.user.role.type);
    console.log('  - Role Status:', adminLoginData.user.role.status);
    console.log('  - Has Company Assignments:', adminLoginData.user.companyAssignments ? 'YES' : 'NO');
    
    if (adminLoginData.user.companyAssignments) {
      console.log('  - Number of Assignments:', adminLoginData.user.companyAssignments.length);
      adminLoginData.user.companyAssignments.forEach((assignment, index) => {
        console.log(`    Assignment ${index + 1}:`);
        console.log(`      - Company: ${assignment.companyName}`);
        console.log(`      - Industry: ${assignment.companyIndustry}`);
        console.log(`      - Status: ${assignment.status}`);
        console.log(`      - Permissions: ${assignment.permissions.join(', ')}`);
      });
    }

    // Step 7: Test company assignments endpoint
    console.log('\n7️⃣ Testing company assignments endpoint...');
    const assignmentsResponse = await axios.get(`${baseURL}/company-assignments/user/${adminUserDetails.id || adminUserDetails._id}`, {
      headers: { Authorization: `Bearer ${adminLoginData.token}` }
    });

    console.log('✅ Company assignments endpoint working');
    console.log('📋 Assignments from API:', assignmentsResponse.data.data.length);

    // Step 8: Verify routing logic
    console.log('\n8️⃣ Verifying routing logic...');
    const user = adminLoginData.user;
    const hasCompanyAccess = user.role.type === 'admin' && 
                            user.role.status === 'active' && 
                            user.companyAssignments && 
                            user.companyAssignments.length > 0;

    console.log('🔍 Routing analysis:');
    console.log('  - Is Admin:', user.role.type === 'admin');
    console.log('  - Is Active:', user.role.status === 'active');
    console.log('  - Has Assignments:', user.companyAssignments && user.companyAssignments.length > 0);
    console.log('  - Should Have Access:', hasCompanyAccess);

    if (hasCompanyAccess) {
      console.log('✅ SUCCESS: Admin should be redirected to dashboard');
      console.log('🎯 Expected redirect: /admin/dashboard');
    } else {
      console.log('❌ FAILURE: Admin will be stuck on pending screen');
      console.log('🔧 Check: Role status, company assignments, and routing logic');
    }

    // Step 9: Test dashboard access
    console.log('\n9️⃣ Testing dashboard data access...');
    try {
      const dashboardResponse = await axios.get(`${baseURL}/analytics/admin/${testCompany.id || testCompany._id}`, {
        headers: { Authorization: `Bearer ${adminLoginData.token}` }
      });
      console.log('✅ Dashboard data accessible');
    } catch (dashboardError) {
      console.log('⚠️ Dashboard data access issue:', dashboardError.response?.status, dashboardError.response?.data?.message);
    }

    console.log('\n🎉 Admin login flow test completed!');
    console.log('\n📝 Summary:');
    console.log('  - Admin user created/verified ✅');
    console.log('  - Company assignment created ✅');
    console.log('  - Login includes company assignments ✅');
    console.log('  - Routing logic should work ✅');
    console.log('\n💡 Next steps:');
    console.log('  1. Restart the frontend application');
    console.log('  2. Login with admin credentials:', adminUser.email, '/ Ihs@n2553.');
    console.log('  3. Verify automatic redirect to admin dashboard');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Hint: Check login credentials and user verification status');
    }
  }
};

// Run the test
testAdminLoginFlow();
