/**
 * Database Analysis Script
 * Analyzes current database structure and content
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const analyzeDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get database instance
    const db = mongoose.connection.db;
    
    // List all databases
    const admin = db.admin();
    const databases = await admin.listDatabases();
    console.log('\n📊 Available Databases:');
    databases.databases.forEach(db => {
      console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // List all collections in current database
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections in investment_management:');
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      console.log(`  - ${collectionName}: ${count} documents`);
      
      // Show sample data for analysis
      if (count > 0) {
        const sample = await db.collection(collectionName).findOne();
        console.log(`    Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
      }
    }

    // Check for specific dummy data patterns
    console.log('\n🔍 Checking for Dummy Data Patterns:');
    
    // Check users collection for test accounts
    const users = await db.collection('users').find({}).toArray();
    console.log(`\n👥 Users Analysis (${users.length} total):`);
    users.forEach(user => {
      const isDummy = user.email.includes('example.com') || 
                     user.email.includes('test') || 
                     user.firstName === 'Test' ||
                     user.firstName === 'Demo';
      console.log(`  - ${user.email} (${user.firstName} ${user.lastName}) ${isDummy ? '🔴 DUMMY' : '✅ REAL'}`);
    });

    // Check companies for test data
    const companies = await db.collection('subcompanies').find({}).toArray();
    console.log(`\n🏢 Companies Analysis (${companies.length} total):`);
    companies.forEach(company => {
      const isDummy = company.name.includes('Test') || 
                     company.name.includes('Demo') || 
                     company.name.includes('Sample') ||
                     company.contactEmail?.includes('example.com');
      console.log(`  - ${company.name} ${isDummy ? '🔴 DUMMY' : '✅ REAL'}`);
    });

    // Check for other collections that might contain dummy data
    const otherCollections = ['investments', 'transactions', 'profitlosses', 'ownercompanies'];
    for (const collName of otherCollections) {
      const count = await db.collection(collName).countDocuments();
      if (count > 0) {
        console.log(`\n📈 ${collName}: ${count} documents`);
      }
    }

  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the analysis
analyzeDatabase();
