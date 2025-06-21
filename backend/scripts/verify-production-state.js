/**
 * Production State Verification Script
 * Verifies that the system is in a clean, production-ready state
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const verifyProductionState = async () => {
  try {
    console.log('🔍 Verifying Production State...');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get database instance
    const db = mongoose.connection.db;
    
    // Check all collections for dummy data patterns
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Found ${collections.length} collections`);

    let totalDocuments = 0;
    let dummyDataFound = false;
    const report = [];

    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      totalDocuments += count;

      let status = '✅ CLEAN';
      let details = '';

      if (count > 0) {
        // Check for dummy data patterns
        const samples = await db.collection(collectionName).find({}).limit(5).toArray();
        
        for (const doc of samples) {
          const docStr = JSON.stringify(doc).toLowerCase();
          if (docStr.includes('example.com') || 
              docStr.includes('test') || 
              docStr.includes('demo') || 
              docStr.includes('sample') ||
              docStr.includes('dummy') ||
              docStr.includes('fake')) {
            status = '🔴 DUMMY DATA DETECTED';
            dummyDataFound = true;
            details = 'Contains test/dummy data patterns';
            break;
          }
        }

        if (status === '✅ CLEAN' && count > 0) {
          status = '📊 HAS DATA';
          details = 'Contains real data';
        }
      }

      report.push({
        collection: collectionName,
        count,
        status,
        details
      });
    }

    // Display report
    console.log('\n📊 Collection Analysis:');
    report.forEach(item => {
      console.log(`   ${item.collection.padEnd(20)} ${item.count.toString().padStart(3)} docs ${item.status}`);
      if (item.details) {
        console.log(`   ${' '.repeat(20)} ${item.details}`);
      }
    });

    // Overall assessment
    console.log('\n🎯 Production Readiness Assessment:');
    console.log(`   📊 Total Documents: ${totalDocuments}`);
    
    if (dummyDataFound) {
      console.log('   ❌ DUMMY DATA DETECTED - NOT PRODUCTION READY');
      console.log('   💡 Run: node scripts/production-init.js to clean and initialize');
    } else if (totalDocuments === 0) {
      console.log('   ⚠️  EMPTY DATABASE - Needs initialization');
      console.log('   💡 Run: node scripts/production-init.js to initialize');
    } else {
      console.log('   ✅ PRODUCTION READY - Clean real data only');
    }

    // Check for essential super admin
    const adminCount = await db.collection('users').countDocuments({
      email: { $regex: /system\.local$/ }
    });
    
    if (adminCount > 0) {
      console.log('   ✅ Essential super admin account exists');
    } else {
      console.log('   ⚠️  No essential super admin found');
    }

    console.log('=' .repeat(50));

    return {
      success: true,
      isProductionReady: !dummyDataFound && totalDocuments > 0,
      hasDummyData: dummyDataFound,
      totalDocuments,
      hasEssentialAdmin: adminCount > 0
    };

  } catch (error) {
    console.error('❌ Verification failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the verification
verifyProductionState().then((result) => {
  if (result.success) {
    if (result.isProductionReady) {
      console.log('\n🎉 System is PRODUCTION READY!');
      process.exit(0);
    } else {
      console.log('\n⚠️  System needs attention before production use');
      process.exit(1);
    }
  } else {
    console.error('\n❌ Verification failed:', result.error);
    process.exit(1);
  }
}).catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

export default verifyProductionState;
