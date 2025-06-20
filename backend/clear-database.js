import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management');
    
    console.log('📊 Current Database Contents:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    let totalDocuments = 0;
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
      totalDocuments += count;
    }
    
    console.log(`\n📈 Total documents: ${totalDocuments}`);
    
    if (totalDocuments > 0) {
      console.log('\n🗑️ Clearing all development data...');
      
      // Drop all collections individually to preserve indexes
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
        console.log(`  ✅ Cleared ${collection.name}`);
      }
      
      console.log('\n✅ All development data cleared successfully');
    } else {
      console.log('\n✅ Database is already empty');
    }
    
    console.log('\n🔍 Verifying database is clean...');
    const remainingCollections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of remainingCollections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  ${collection.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
    console.log('\n🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
