/**
 * Migration script to add category field to existing SubCompany documents
 * Run this script to update existing companies with a default category
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import the SubCompany model
import { SubCompany } from '../models/Company.js';

const addCategoryField = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all SubCompany documents that don't have a category field
    const companiesWithoutCategory = await SubCompany.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });

    console.log(`📊 Found ${companiesWithoutCategory.length} companies without category field`);

    if (companiesWithoutCategory.length === 0) {
      console.log('✅ All companies already have category field');
      return;
    }

    // Update each company with a default category based on industry
    const industryToCategoryMap = {
      'Technology': 'Growth',
      'Finance': 'Mature',
      'Healthcare': 'Growth',
      'Real Estate': 'Mature',
      'Energy': 'Mature',
      'Manufacturing': 'Mature',
      'Retail': 'General',
      'Transportation': 'General',
      'Education': 'General',
      'Entertainment': 'General',
      'Agriculture': 'General',
      'Construction': 'General',
      'Media': 'General',
      'Telecommunications': 'Mature',
      'Automotive': 'Mature',
      'Aerospace': 'Growth',
      'Biotechnology': 'Growth',
      'Pharmaceuticals': 'Growth',
      'Food & Beverage': 'General',
      'Hospitality': 'General'
    };

    let updatedCount = 0;

    for (const company of companiesWithoutCategory) {
      const defaultCategory = industryToCategoryMap[company.industry] || 'General';
      
      await SubCompany.updateOne(
        { _id: company._id },
        { $set: { category: defaultCategory } }
      );

      console.log(`✅ Updated ${company.name} (${company.industry}) -> Category: ${defaultCategory}`);
      updatedCount++;
    }

    console.log(`🎉 Successfully updated ${updatedCount} companies with category field`);

    // Verify the update
    const companiesStillWithoutCategory = await SubCompany.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { category: '' }
      ]
    });

    if (companiesStillWithoutCategory.length === 0) {
      console.log('✅ Migration completed successfully - all companies now have category field');
    } else {
      console.log(`⚠️  ${companiesStillWithoutCategory.length} companies still missing category field`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('📝 Database connection closed');
  }
};

// Run the migration
addCategoryField();
