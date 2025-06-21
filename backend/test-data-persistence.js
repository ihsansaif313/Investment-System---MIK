/**
 * TEST DATA PERSISTENCE SCRIPT - DISABLED FOR PRODUCTION USE
 * This file has been disabled to ensure clean production deployment
 */

console.error('❌ TEST DATA PERSISTENCE DISABLED');
console.error('❌ This file contains test/dummy data and is disabled for production use');
console.error('💡 Use real data through the application interface');
process.exit(1);

/*
import mongoose from 'mongoose';
import User from './models/User.js';
import { OwnerCompany, SubCompany, CompanyAssignment } from './models/Company.js';
import Role from './models/Role.js';

const testDataPersistence = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🧪 Testing Real Data Persistence - CRUD Operations');
    console.log('='.repeat(60));
    
    // Test 1: User Registration and Authentication
    console.log('\n👤 Test 1: User Registration and Authentication');
    console.log('-'.repeat(40));
    
    const testUser = {
      email: 'production.test@example.com',
      password: 'SecurePassword123!',
      firstName: 'Production',
      lastName: 'Test'
    };
    
    // CREATE: Register new user
    console.log('📝 Creating new user...');
    const newUser = new User(testUser);
    await newUser.save();
    console.log(`✅ User created with ID: ${newUser._id}`);
    
    // READ: Verify user exists
    console.log('🔍 Reading user from database...');
    const foundUser = await User.findById(newUser._id);
    console.log(`✅ User found: ${foundUser.email}`);
    
    // UPDATE: Update user information
    console.log('✏️ Updating user information...');
    foundUser.phone = '+1234567890';
    foundUser.address = '123 Production Street';
    await foundUser.save();
    console.log('✅ User updated successfully');
    
    // Test 2: Role Management
    console.log('\n🔑 Test 2: Role Management');
    console.log('-'.repeat(40));
    
    // CREATE: Assign role to user
    console.log('📝 Creating user role...');
    const userRole = new Role({
      userId: newUser._id,
      type: 'admin',
      status: 'active',
      permissions: ['manage_companies', 'view_analytics']
    });
    await userRole.save();
    console.log(`✅ Role created with ID: ${userRole._id}`);
    
    // READ: Verify role exists
    console.log('🔍 Reading role from database...');
    const foundRole = await Role.findOne({ userId: newUser._id });
    console.log(`✅ Role found: ${foundRole.type} (${foundRole.status})`);
    
    // Test 3: Company Management
    console.log('\n🏢 Test 3: Company Management');
    console.log('-'.repeat(40));
    
    // CREATE: Owner Company
    console.log('📝 Creating owner company...');
    const ownerCompany = new OwnerCompany({
      name: 'Production Test Holdings',
      address: '456 Business Avenue',
      contactEmail: 'contact@productiontest.com',
      establishedDate: new Date('2020-01-01'),
      registrationNumber: 'REG-PROD-001'
    });
    await ownerCompany.save();
    console.log(`✅ Owner company created with ID: ${ownerCompany._id}`);
    
    // CREATE: Sub Company
    console.log('📝 Creating sub company...');
    const subCompany = new SubCompany({
      ownerCompanyId: ownerCompany._id,
      name: 'Production Test Tech',
      industry: 'Technology',
      description: 'A test technology company for production testing',
      establishedDate: new Date('2021-01-01'),
      contactEmail: 'tech@productiontest.com',
      adminUserId: newUser._id
    });
    await subCompany.save();
    console.log(`✅ Sub company created with ID: ${subCompany._id}`);
    
    // READ: Verify companies with population
    console.log('🔍 Reading companies with populated data...');
    const populatedSubCompany = await SubCompany.findById(subCompany._id)
      .populate('ownerCompanyId', 'name')
      .populate('adminUserId', 'firstName lastName email');
    console.log(`✅ Sub company found: ${populatedSubCompany.name}`);
    console.log(`   Owner: ${populatedSubCompany.ownerCompanyId.name}`);
    console.log(`   Admin: ${populatedSubCompany.adminUserId.firstName} ${populatedSubCompany.adminUserId.lastName}`);
    
    // Test 4: Company Assignment
    console.log('\n👥 Test 4: Company Assignment');
    console.log('-'.repeat(40));
    
    // CREATE: Company Assignment
    console.log('📝 Creating company assignment...');
    const assignment = new CompanyAssignment({
      userId: newUser._id,
      subCompanyId: subCompany._id,
      assignedBy: newUser._id, // Self-assigned for test
      status: 'active',
      permissions: ['view_company_data', 'manage_investments'],
      notes: 'Production test assignment'
    });
    await assignment.save();
    console.log(`✅ Assignment created with ID: ${assignment._id}`);
    
    // READ: Verify assignment with population
    console.log('🔍 Reading assignment with populated data...');
    const populatedAssignment = await CompanyAssignment.findById(assignment._id)
      .populate('userId', 'firstName lastName email')
      .populate('subCompanyId', 'name industry')
      .populate('assignedBy', 'firstName lastName');
    console.log(`✅ Assignment found:`);
    console.log(`   User: ${populatedAssignment.userId.firstName} ${populatedAssignment.userId.lastName}`);
    console.log(`   Company: ${populatedAssignment.subCompanyId.name}`);
    console.log(`   Status: ${populatedAssignment.status}`);
    
    // Test 5: UPDATE Operations
    console.log('\n✏️ Test 5: UPDATE Operations');
    console.log('-'.repeat(40));
    
    // Update company industry
    console.log('📝 Updating company industry...');
    subCompany.industry = 'Financial Technology';
    subCompany.description = 'Updated description for production testing';
    await subCompany.save();
    console.log('✅ Company updated successfully');
    
    // Update assignment status
    console.log('📝 Updating assignment status...');
    assignment.status = 'active';
    assignment.notes = 'Updated notes for production testing';
    await assignment.save();
    console.log('✅ Assignment updated successfully');
    
    // Test 6: DELETE Operations
    console.log('\n🗑️ Test 6: DELETE Operations');
    console.log('-'.repeat(40));
    
    // Soft delete assignment (change status)
    console.log('📝 Soft deleting assignment...');
    assignment.status = 'inactive';
    await assignment.save();
    console.log('✅ Assignment soft deleted (status: inactive)');
    
    // Test 7: Data Integrity and Relationships
    console.log('\n🔗 Test 7: Data Integrity and Relationships');
    console.log('-'.repeat(40));
    
    // Verify all relationships are intact
    const userWithRole = await User.findById(newUser._id);
    const roleForUser = await Role.findOne({ userId: newUser._id });
    const companiesForUser = await SubCompany.find({ adminUserId: newUser._id });
    const assignmentsForUser = await CompanyAssignment.find({ userId: newUser._id });
    
    console.log('🔍 Verifying data relationships:');
    console.log(`   User exists: ${!!userWithRole}`);
    console.log(`   Role exists: ${!!roleForUser}`);
    console.log(`   Companies managed: ${companiesForUser.length}`);
    console.log(`   Assignments: ${assignmentsForUser.length}`);
    
    // Test 8: Query Performance
    console.log('\n⚡ Test 8: Query Performance');
    console.log('-'.repeat(40));
    
    const startTime = Date.now();
    
    // Complex query with multiple joins
    const complexQuery = await SubCompany.find({})
      .populate('ownerCompanyId', 'name contactEmail')
      .populate('adminUserId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const queryTime = Date.now() - startTime;
    console.log(`✅ Complex query completed in ${queryTime}ms`);
    console.log(`   Results: ${complexQuery.length} companies`);
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await CompanyAssignment.deleteOne({ _id: assignment._id });
    await SubCompany.deleteOne({ _id: subCompany._id });
    await OwnerCompany.deleteOne({ _id: ownerCompany._id });
    await Role.deleteOne({ _id: userRole._id });
    await User.deleteOne({ _id: newUser._id });
    console.log('✅ Test data cleaned up');
    
    await mongoose.connection.close();
    
    console.log('\n🎉 ALL DATA PERSISTENCE TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('✅ CREATE operations: Working');
    console.log('✅ READ operations: Working');
    console.log('✅ UPDATE operations: Working');
    console.log('✅ DELETE operations: Working');
    console.log('✅ Data relationships: Intact');
    console.log('✅ Query performance: Acceptable');
    console.log('✅ Database persistence: Verified');
    
  } catch (error) {
    console.error('❌ Data persistence test failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

testDataPersistence();
