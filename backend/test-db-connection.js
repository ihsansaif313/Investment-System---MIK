import mongoose from 'mongoose';

const testConnection = async () => {
  try {
    console.log('🔌 Testing MongoDB connection...');
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB successfully');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    await mongoose.connection.close();
    console.log('✅ Connection test completed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
};

testConnection();
