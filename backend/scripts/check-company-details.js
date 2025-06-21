/**
 * Check company details script
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const checkCompanyDetails = async () => {
  try {
    console.log('🔍 Checking company details...');

    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Get database instance
    const db = mongoose.connection.db;
    
    // Get all companies with full details
    const companies = await db.collection('subcompanies').find({}).toArray();
    
    console.log(`\n📊 Found ${companies.length} companies:`);
    
    companies.forEach((company, index) => {
      console.log(`\n🏢 Company ${index + 1}:`);
      console.log('  _id:', company._id);
      console.log('  name:', company.name);
      console.log('  industry:', company.industry || '❌ MISSING');
      console.log('  category:', company.category || '❌ MISSING');
      console.log('  description:', company.description);
      console.log('  contactEmail:', company.contactEmail);
      console.log('  contactPhone:', company.contactPhone);
      console.log('  website:', company.website);
      console.log('  address:', company.address);
      console.log('  establishedDate:', company.establishedDate);
      console.log('  registrationNumber:', company.registrationNumber);
      console.log('  taxId:', company.taxId);
      console.log('  adminUserId:', company.adminUserId);
      console.log('  createdAt:', company.createdAt);
      console.log('  updatedAt:', company.updatedAt);
      
      // Check which fields are missing
      const missingFields = [];
      if (!company.industry) missingFields.push('industry');
      if (!company.category) missingFields.push('category');
      
      if (missingFields.length > 0) {
        console.log('  ❌ Missing fields:', missingFields.join(', '));
      } else {
        console.log('  ✅ All required fields present');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the check
checkCompanyDetails();
