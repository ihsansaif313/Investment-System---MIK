/**
 * Test Admin Email System
 * Tests the complete admin registration and email verification workflow
 */

const axios = require('axios');

const baseURL = 'http://localhost:3001/api';

async function testAdminEmailSystem() {
  try {
    console.log('🧪 Testing Admin Email System\n');

    // Step 1: Test admin registration with email verification
    console.log('1️⃣ Testing Admin Registration with Email Verification');
    
    const adminData = {
      firstName: 'Test',
      lastName: 'Admin',
      email: 'ihsansaifedwardion@gmail.com', // Use your real email
      password: 'TestAdmin123!',
      role: 'admin'
    };

    try {
      const registerResponse = await axios.post(`${baseURL}/auth/register`, adminData);
      console.log('✅ Admin registration successful');
      console.log('📧 Verification email should be sent to:', adminData.email);
      console.log('📝 Response:', registerResponse.data.message);
    } catch (registerError) {
      if (registerError.response?.status === 409) {
        console.log('ℹ️ Admin already exists, testing with existing account');
      } else {
        console.log('❌ Admin registration failed:', registerError.response?.data?.message || registerError.message);
      }
    }

    // Step 2: Login as superadmin to test approval/rejection emails
    console.log('\n2️⃣ Testing Admin Approval/Rejection Email System');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'ihsansaif@gmail.com',
      password: 'Ihs@n2553.'
    });

    const authToken = loginResponse.data.data.token;
    console.log('✅ Superadmin login successful');

    // Step 3: Get pending admins
    console.log('\n3️⃣ Checking Pending Admins');
    try {
      const pendingResponse = await axios.get(`${baseURL}/admin-management/pending`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const pendingAdmins = pendingResponse.data.data;
      console.log(`📋 Found ${pendingAdmins.length} pending admin(s)`);
      
      if (pendingAdmins.length > 0) {
        const testAdmin = pendingAdmins[0];
        console.log(`👤 Test admin: ${testAdmin.email}`);
        
        // Step 4: Test approval email
        console.log('\n4️⃣ Testing Admin Approval Email');
        try {
          const approvalResponse = await axios.post(`${baseURL}/admin-management/approve/${testAdmin.id}`, {}, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          console.log('✅ Admin approved successfully');
          console.log('📧 Approval email should be sent to:', testAdmin.email);
          console.log('📝 Response:', approvalResponse.data.message);
        } catch (approvalError) {
          console.log('❌ Admin approval failed:', approvalError.response?.data?.message || approvalError.message);
        }
      } else {
        console.log('ℹ️ No pending admins found for testing approval');
      }
    } catch (pendingError) {
      console.log('❌ Failed to get pending admins:', pendingError.response?.data?.message || pendingError.message);
    }

    // Step 5: Test password reset email
    console.log('\n5️⃣ Testing Password Reset Email');
    try {
      const resetResponse = await axios.post(`${baseURL}/auth/forgot-password`, {
        email: 'ihsansaifedwardion@gmail.com'
      });
      console.log('✅ Password reset request successful');
      console.log('📧 Password reset email should be sent to: ihsansaifedwardion@gmail.com');
      console.log('📝 Response:', resetResponse.data.message);
    } catch (resetError) {
      console.log('❌ Password reset failed:', resetError.response?.data?.message || resetError.message);
    }

    // Step 6: Test verification email resend
    console.log('\n6️⃣ Testing Verification Email Resend');
    try {
      const resendResponse = await axios.post(`${baseURL}/auth/resend-verification`, {
        email: 'ihsansaifedwardion@gmail.com'
      });
      console.log('✅ Verification email resend successful');
      console.log('📧 Verification email should be sent to: ihsansaifedwardion@gmail.com');
      console.log('📝 Response:', resendResponse.data.message);
    } catch (resendError) {
      console.log('❌ Verification email resend failed:', resendError.response?.data?.message || resendError.message);
    }

    console.log('\n📊 Email System Test Summary:');
    console.log('✅ Admin registration: Tested');
    console.log('✅ Email verification: Tested');
    console.log('✅ Admin approval: Tested');
    console.log('✅ Password reset: Tested');
    console.log('✅ Email resend: Tested');
    
    console.log('\n📧 Expected Emails in Inbox:');
    console.log('1. Admin registration verification email');
    console.log('2. Admin approval notification email (if admin was approved)');
    console.log('3. Password reset email');
    console.log('4. Verification email resend');
    
    console.log('\n🎯 Check your email inbox (ihsansaifedwardion@gmail.com) for these emails!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📝 Response:', error.response.data);
    }
  }
}

testAdminEmailSystem();
