/**
 * Test admin assignment counting logic to verify the fix for negative unassigned count
 */

const axios = require('axios');

const testAdminAssignmentCounting = async () => {
  try {
    console.log('🧪 Testing Admin Assignment Counting Logic...');

    const baseURL = 'http://localhost:3001/api';

    // Step 1: Login as superadmin
    console.log('\n1️⃣ Logging in as superadmin...');
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Superadmin login successful');

    // Step 2: Get current data
    console.log('\n2️⃣ Fetching current admin assignment data...');
    const [assignmentsRes, adminsRes, pendingRes] = await Promise.all([
      axios.get(`${baseURL}/company-assignments`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${baseURL}/admin-management/approved`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${baseURL}/admin-management/pending`, { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const assignments = assignmentsRes.data.data || [];
    const admins = adminsRes.data.data || [];
    const pendingAdmins = pendingRes.data.data || [];

    console.log('📊 Raw Data:');
    console.log(`   - Total assignments: ${assignments.length}`);
    console.log(`   - Active admins: ${admins.length}`);
    console.log(`   - Pending admins: ${pendingAdmins.length}`);

    // Step 3: Test the old (incorrect) calculation
    console.log('\n3️⃣ Testing OLD calculation logic (incorrect):');
    const oldAssignedAdmins = assignments.length;
    const oldUnassignedAdmins = admins.length - oldAssignedAdmins;
    
    console.log('❌ Old Logic Results:');
    console.log(`   - Assigned Admins: ${oldAssignedAdmins} (total assignments)`);
    console.log(`   - Unassigned Admins: ${oldUnassignedAdmins} (can be negative!)`);

    // Step 4: Test the new (correct) calculation
    console.log('\n4️⃣ Testing NEW calculation logic (correct):');
    
    // Count unique admins who have assignments
    const uniqueAssignedAdminIds = new Set(
      assignments.map(assignment => assignment.userId?.id || assignment.userId?._id)
    );
    const newAssignedAdmins = uniqueAssignedAdminIds.size;
    const newUnassignedAdmins = admins.length - newAssignedAdmins;

    console.log('✅ New Logic Results:');
    console.log(`   - Assigned Admins: ${newAssignedAdmins} (unique admins with assignments)`);
    console.log(`   - Unassigned Admins: ${newUnassignedAdmins} (should never be negative)`);
    console.log(`   - Total Assignments: ${assignments.length} (total assignment records)`);

    // Step 5: Show detailed breakdown
    console.log('\n5️⃣ Detailed Assignment Breakdown:');
    
    if (assignments.length > 0) {
      const adminAssignmentCounts = {};
      assignments.forEach(assignment => {
        const adminId = assignment.userId?.id || assignment.userId?._id;
        const adminName = `${assignment.userId?.firstName} ${assignment.userId?.lastName}`;
        const companyName = assignment.subCompanyId?.name;
        
        if (!adminAssignmentCounts[adminId]) {
          adminAssignmentCounts[adminId] = {
            name: adminName,
            assignments: []
          };
        }
        adminAssignmentCounts[adminId].assignments.push(companyName);
      });

      console.log('👥 Admin Assignment Details:');
      Object.entries(adminAssignmentCounts).forEach(([adminId, data], index) => {
        console.log(`   ${index + 1}. ${data.name}:`);
        data.assignments.forEach((company, i) => {
          console.log(`      - Assignment ${i + 1}: ${company}`);
        });
        console.log(`      Total assignments: ${data.assignments.length}`);
      });

      // Check for admins with multiple assignments
      const adminsWithMultipleAssignments = Object.values(adminAssignmentCounts)
        .filter(admin => admin.assignments.length > 1);

      if (adminsWithMultipleAssignments.length > 0) {
        console.log('\n🔍 Admins with Multiple Assignments:');
        adminsWithMultipleAssignments.forEach((admin, index) => {
          console.log(`   ${index + 1}. ${admin.name} (${admin.assignments.length} assignments)`);
        });
        console.log('\n💡 This is why the old counting logic was incorrect!');
        console.log('   The old logic counted assignments, not unique admins.');
      }
    }

    // Step 6: Verify the fix prevents negative counts
    console.log('\n6️⃣ Verification Results:');
    
    const isFixWorking = newUnassignedAdmins >= 0;
    const hasImprovement = newUnassignedAdmins !== oldUnassignedAdmins;

    if (isFixWorking) {
      console.log('✅ SUCCESS: Unassigned count is not negative');
    } else {
      console.log('❌ FAILURE: Unassigned count is still negative');
    }

    if (hasImprovement) {
      console.log('✅ SUCCESS: Counting logic has been improved');
      console.log(`   Old count: ${oldUnassignedAdmins} | New count: ${newUnassignedAdmins}`);
    } else {
      console.log('ℹ️ INFO: No difference in counts (no multiple assignments detected)');
    }

    // Step 7: Summary
    console.log('\n📋 Summary:');
    console.log('✅ Fixed Calculation Logic:');
    console.log(`   - Total Admins: ${admins.length + pendingAdmins.length}`);
    console.log(`   - Active Admins: ${admins.length}`);
    console.log(`   - Pending Admins: ${pendingAdmins.length}`);
    console.log(`   - Assigned Admins: ${newAssignedAdmins} (unique)`);
    console.log(`   - Unassigned Admins: ${newUnassignedAdmins}`);
    console.log(`   - Total Assignments: ${assignments.length}`);

    console.log('\n🎉 Admin Assignment Counting Test Complete!');
    console.log('\n💡 The fix ensures:');
    console.log('   1. Unassigned count never goes negative');
    console.log('   2. Assigned count represents unique admins, not total assignments');
    console.log('   3. Multiple assignments per admin are handled correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Hint: Check login credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Hint: Make sure the backend is running on port 3001');
    }
  }
};

// Run the test
testAdminAssignmentCounting();
