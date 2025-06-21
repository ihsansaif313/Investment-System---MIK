/**
 * Clear All Demo Data
 * Completely clear all demo data and indexes
 */

const mongoose = require('./backend/node_modules/mongoose');

async function clearAllDemoData() {
  try {
    console.log('🧹 Clearing All Demo Data...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Drop demo-related collections
    const demoCollections = [
      'companies', 'ownercompanies', 'subcompanies', 'assets', 
      'investments', 'investorinvestments', 'transactions', 
      'activitylogs', 'companyassignments'
    ];

    console.log('\n🗑️  Dropping demo collections...');
    for (const collectionName of demoCollections) {
      try {
        const collectionExists = collections.some(col => col.name === collectionName);
        if (collectionExists) {
          await mongoose.connection.db.dropCollection(collectionName);
          console.log(`✅ Dropped collection: ${collectionName}`);
        } else {
          console.log(`⚠️  Collection not found: ${collectionName}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not drop ${collectionName}: ${error.message}`);
      }
    }

    console.log('\n✅ All demo data cleared successfully!');
    console.log('🎯 Ready for fresh demo data population');

  } catch (error) {
    console.error('❌ Error clearing demo data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

clearAllDemoData();
