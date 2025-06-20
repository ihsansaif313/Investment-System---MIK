import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const optimizeDatabaseSchema = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management');
    
    console.log('🔍 Optimizing database schema for production...');
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // 1. Create production-ready indexes
    console.log('\n📊 Creating production indexes...');
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ firstName: 1, lastName: 1 });
    await db.collection('users').createIndex({ isActive: 1 });
    await db.collection('users').createIndex({ emailVerified: 1 });
    await db.collection('users').createIndex({ lastLogin: 1 });
    await db.collection('users').createIndex({ createdAt: 1 });
    console.log('  ✅ Users indexes created');
    
    // Roles collection indexes
    await db.collection('roles').createIndex({ userId: 1 }, { unique: true });
    await db.collection('roles').createIndex({ type: 1 });
    await db.collection('roles').createIndex({ status: 1 });
    await db.collection('roles').createIndex({ userId: 1, type: 1 });
    console.log('  ✅ Roles indexes created');
    
    // Companies collection indexes
    await db.collection('ownercompanies').createIndex({ name: 1 });
    await db.collection('ownercompanies').createIndex({ contactEmail: 1 });
    await db.collection('ownercompanies').createIndex({ registrationNumber: 1 }, { unique: true, sparse: true });
    
    await db.collection('subcompanies').createIndex({ name: 1 });
    await db.collection('subcompanies').createIndex({ industry: 1 });
    await db.collection('subcompanies').createIndex({ status: 1 });
    await db.collection('subcompanies').createIndex({ ownerCompanyId: 1 });
    await db.collection('subcompanies').createIndex({ adminUserId: 1 });
    await db.collection('subcompanies').createIndex({ createdAt: 1 });
    console.log('  ✅ Companies indexes created');
    
    // Company assignments collection indexes
    await db.collection('companyassignments').createIndex({ userId: 1, subCompanyId: 1 }, { unique: true });
    await db.collection('companyassignments').createIndex({ userId: 1 });
    await db.collection('companyassignments').createIndex({ subCompanyId: 1 });
    await db.collection('companyassignments').createIndex({ status: 1 });
    await db.collection('companyassignments').createIndex({ assignedDate: 1 });
    console.log('  ✅ Company assignments indexes created');
    
    // Investments collection indexes
    await db.collection('investments').createIndex({ subCompanyId: 1 });
    await db.collection('investments').createIndex({ assetId: 1 });
    await db.collection('investments').createIndex({ status: 1 });
    await db.collection('investments').createIndex({ investmentDate: 1 });
    await db.collection('investments').createIndex({ createdAt: 1 });
    console.log('  ✅ Investments indexes created');
    
    // Assets collection indexes
    await db.collection('assets').createIndex({ name: 1 });
    await db.collection('assets').createIndex({ type: 1 });
    await db.collection('assets').createIndex({ status: 1 });
    await db.collection('assets').createIndex({ subCompanyId: 1 });
    console.log('  ✅ Assets indexes created');
    
    // Activity logs collection indexes
    await db.collection('activitylogs').createIndex({ userId: 1 });
    await db.collection('activitylogs').createIndex({ action: 1 });
    await db.collection('activitylogs').createIndex({ timestamp: 1 });
    await db.collection('activitylogs').createIndex({ entityType: 1 });
    console.log('  ✅ Activity logs indexes created');
    
    // Sessions collection indexes (for session management)
    await db.collection('sessions').createIndex({ userId: 1 });
    await db.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await db.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('  ✅ Sessions indexes created');
    
    // 2. Set up TTL indexes for cleanup
    console.log('\n⏰ Setting up TTL indexes for automatic cleanup...');
    
    // Expire old activity logs after 1 year
    await db.collection('activitylogs').createIndex({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
    
    // Expire old audit trails after 2 years
    await db.collection('audittrails').createIndex({ timestamp: 1 }, { expireAfterSeconds: 2 * 365 * 24 * 60 * 60 });
    
    console.log('  ✅ TTL indexes created');
    
    // 3. Verify all indexes
    console.log('\n🔍 Verifying created indexes...');
    const collections = ['users', 'roles', 'ownercompanies', 'subcompanies', 'companyassignments', 'investments', 'assets', 'activitylogs', 'sessions'];
    
    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`  ${collectionName}: ${indexes.length} indexes`);
      } catch (error) {
        console.log(`  ${collectionName}: Collection doesn't exist yet`);
      }
    }
    
    // 4. Create validation rules for production
    console.log('\n🛡️ Setting up production validation rules...');
    
    // User validation
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: {
              bsonType: 'string',
              pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
            },
            password: {
              bsonType: 'string',
              minLength: 6
            },
            firstName: {
              bsonType: 'string',
              minLength: 1
            },
            lastName: {
              bsonType: 'string',
              minLength: 1
            }
          }
        }
      },
      validationAction: 'warn' // Use 'warn' instead of 'error' for production flexibility
    });
    
    console.log('  ✅ Validation rules created');
    
    await mongoose.connection.close();
    console.log('\n🎉 Database schema optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error optimizing database schema:', error);
    process.exit(1);
  }
};

optimizeDatabaseSchema();
