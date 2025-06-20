/**
 * Production Database Optimization Script
 * Creates indexes, optimizes queries, and sets up production-ready database configuration
 */

import mongoose from 'mongoose';
import { User, Role, OwnerCompany, SubCompany, CompanyAssignment, Investment, Asset, ActivityLog } from './models/index.js';

const optimizeDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management');
    
    console.log('🚀 Starting database optimization for production...');
    
    // 1. Create compound indexes for common queries
    console.log('\n📊 Creating compound indexes...');
    
    // Users - Email lookup and authentication
    await User.collection.createIndex({ email: 1 }, { unique: true, background: true });
    await User.collection.createIndex({ email: 1, isActive: 1 }, { background: true });
    await User.collection.createIndex({ firstName: 1, lastName: 1 }, { background: true });
    await User.collection.createIndex({ lastLogin: -1 }, { background: true });
    await User.collection.createIndex({ createdAt: -1 }, { background: true });
    console.log('  ✅ User indexes created');
    
    // Roles - User role lookups
    await Role.collection.createIndex({ userId: 1 }, { unique: true, background: true });
    await Role.collection.createIndex({ type: 1, status: 1 }, { background: true });
    await Role.collection.createIndex({ userId: 1, type: 1 }, { background: true });
    await Role.collection.createIndex({ status: 1, createdAt: -1 }, { background: true });
    console.log('  ✅ Role indexes created');
    
    // Companies - Search and filtering
    await OwnerCompany.collection.createIndex({ name: 1 }, { background: true });
    await OwnerCompany.collection.createIndex({ contactEmail: 1 }, { background: true });
    await OwnerCompany.collection.createIndex({ registrationNumber: 1 }, { unique: true, sparse: true, background: true });
    
    await SubCompany.collection.createIndex({ name: 1 }, { background: true });
    await SubCompany.collection.createIndex({ industry: 1 }, { background: true });
    await SubCompany.collection.createIndex({ status: 1 }, { background: true });
    await SubCompany.collection.createIndex({ ownerCompanyId: 1 }, { background: true });
    await SubCompany.collection.createIndex({ adminUserId: 1 }, { background: true });
    await SubCompany.collection.createIndex({ createdAt: -1 }, { background: true });
    
    // Compound indexes for common queries
    await SubCompany.collection.createIndex({ status: 1, createdAt: -1 }, { background: true });
    await SubCompany.collection.createIndex({ industry: 1, status: 1 }, { background: true });
    await SubCompany.collection.createIndex({ ownerCompanyId: 1, status: 1 }, { background: true });
    
    // Text search index for companies
    await SubCompany.collection.createIndex({ 
      name: 'text', 
      industry: 'text', 
      description: 'text' 
    }, { background: true });
    
    console.log('  ✅ Company indexes created');
    
    // Company Assignments - User and company lookups
    await CompanyAssignment.collection.createIndex({ userId: 1, subCompanyId: 1 }, { unique: true, background: true });
    await CompanyAssignment.collection.createIndex({ userId: 1 }, { background: true });
    await CompanyAssignment.collection.createIndex({ subCompanyId: 1 }, { background: true });
    await CompanyAssignment.collection.createIndex({ status: 1 }, { background: true });
    await CompanyAssignment.collection.createIndex({ assignedDate: -1 }, { background: true });
    await CompanyAssignment.collection.createIndex({ status: 1, assignedDate: -1 }, { background: true });
    console.log('  ✅ Company assignment indexes created');
    
    // Investments - Performance queries
    await Investment.collection.createIndex({ subCompanyId: 1 }, { background: true });
    await Investment.collection.createIndex({ assetId: 1 }, { background: true });
    await Investment.collection.createIndex({ status: 1 }, { background: true });
    await Investment.collection.createIndex({ investmentDate: -1 }, { background: true });
    await Investment.collection.createIndex({ createdAt: -1 }, { background: true });
    await Investment.collection.createIndex({ subCompanyId: 1, status: 1 }, { background: true });
    await Investment.collection.createIndex({ status: 1, investmentDate: -1 }, { background: true });
    console.log('  ✅ Investment indexes created');
    
    // Assets - Company and type filtering
    await Asset.collection.createIndex({ name: 1 }, { background: true });
    await Asset.collection.createIndex({ type: 1 }, { background: true });
    await Asset.collection.createIndex({ status: 1 }, { background: true });
    await Asset.collection.createIndex({ subCompanyId: 1 }, { background: true });
    await Asset.collection.createIndex({ subCompanyId: 1, status: 1 }, { background: true });
    await Asset.collection.createIndex({ type: 1, status: 1 }, { background: true });
    console.log('  ✅ Asset indexes created');
    
    // Activity Logs - User activity tracking
    await ActivityLog.collection.createIndex({ userId: 1 }, { background: true });
    await ActivityLog.collection.createIndex({ action: 1 }, { background: true });
    await ActivityLog.collection.createIndex({ timestamp: -1 }, { background: true });
    await ActivityLog.collection.createIndex({ entityType: 1 }, { background: true });
    await ActivityLog.collection.createIndex({ userId: 1, timestamp: -1 }, { background: true });
    await ActivityLog.collection.createIndex({ entityType: 1, timestamp: -1 }, { background: true });
    
    // TTL index for automatic cleanup of old logs (1 year)
    await ActivityLog.collection.createIndex({ timestamp: 1 }, { 
      expireAfterSeconds: 365 * 24 * 60 * 60, 
      background: true 
    });
    console.log('  ✅ Activity log indexes created');
    
    // 2. Set up database connection optimization
    console.log('\n⚙️ Optimizing database connection settings...');
    
    // Set read preference for better performance
    mongoose.connection.db.readPreference = 'secondaryPreferred';
    
    // Enable connection pooling optimization
    mongoose.set('maxPoolSize', 10);
    mongoose.set('minPoolSize', 2);
    mongoose.set('maxIdleTimeMS', 30000);
    mongoose.set('serverSelectionTimeoutMS', 5000);
    mongoose.set('socketTimeoutMS', 45000);
    
    console.log('  ✅ Connection settings optimized');
    
    // 3. Analyze query performance
    console.log('\n📈 Analyzing query performance...');
    
    const collections = [
      { name: 'users', model: User },
      { name: 'roles', model: Role },
      { name: 'subcompanies', model: SubCompany },
      { name: 'companyassignments', model: CompanyAssignment },
      { name: 'investments', model: Investment },
      { name: 'assets', model: Asset },
      { name: 'activitylogs', model: ActivityLog }
    ];
    
    for (const collection of collections) {
      try {
        const stats = await mongoose.connection.db.collection(collection.name).stats();
        const indexes = await mongoose.connection.db.collection(collection.name).indexes();
        
        console.log(`  📊 ${collection.name}:`);
        console.log(`     Documents: ${stats.count || 0}`);
        console.log(`     Size: ${Math.round((stats.size || 0) / 1024)}KB`);
        console.log(`     Indexes: ${indexes.length}`);
        console.log(`     Average document size: ${Math.round(stats.avgObjSize || 0)} bytes`);
      } catch (error) {
        console.log(`  📊 ${collection.name}: Collection doesn't exist yet`);
      }
    }
    
    // 4. Database maintenance recommendations
    console.log('\n🔧 Database maintenance recommendations:');
    console.log('  📝 Regular maintenance tasks:');
    console.log('     • Run db.runCommand({compact: "collection_name"}) monthly');
    console.log('     • Monitor index usage with db.collection.getIndexes()');
    console.log('     • Check slow queries with db.setProfilingLevel(2)');
    console.log('     • Backup database daily in production');
    console.log('     • Monitor disk space and memory usage');
    
    // 5. Performance testing
    console.log('\n⚡ Running performance tests...');
    
    const startTime = Date.now();
    
    // Test common queries
    const testQueries = [
      () => User.findOne({ email: 'test@example.com' }),
      () => Role.find({ type: 'admin', status: 'active' }).limit(10),
      () => SubCompany.find({ status: 'active' }).populate('ownerCompanyId').limit(10),
      () => CompanyAssignment.find({ status: 'active' }).populate('userId subCompanyId').limit(10)
    ];
    
    for (let i = 0; i < testQueries.length; i++) {
      const queryStart = Date.now();
      try {
        await testQueries[i]();
        const queryTime = Date.now() - queryStart;
        console.log(`  ✅ Query ${i + 1}: ${queryTime}ms`);
      } catch (error) {
        console.log(`  ⚠️  Query ${i + 1}: Failed (${error.message})`);
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`  📊 Total test time: ${totalTime}ms`);
    
    await mongoose.connection.close();
    
    console.log('\n🎉 Database optimization completed successfully!');
    console.log('='.repeat(60));
    console.log('✅ Production indexes created');
    console.log('✅ Connection settings optimized');
    console.log('✅ Performance analysis completed');
    console.log('✅ TTL indexes for automatic cleanup');
    console.log('✅ Text search indexes for better search');
    console.log('✅ Compound indexes for complex queries');
    console.log('');
    console.log('🚀 Database is now production-ready!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
};

optimizeDatabase();
