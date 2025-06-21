/**
 * Direct test of company creation to debug the issue
 */

const mongoose = require('mongoose');

const debugCompanyCreation = async () => {
  try {
    console.log('🔧 Direct company creation debug...');

    // Connect to MongoDB
    const mongoURI = 'mongodb://localhost:27017/investment_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Import the SubCompany model
    const subCompanySchema = new mongoose.Schema({
      ownerCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OwnerCompany',
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      industry: {
        type: String,
        required: true,
        trim: true
      },
      category: {
        type: String,
        trim: true,
        default: 'General'
      },
      description: {
        type: String,
        trim: true
      },
      address: {
        type: String,
        trim: true
      },
      contactEmail: {
        type: String,
        trim: true
      },
      contactPhone: {
        type: String,
        trim: true
      },
      website: {
        type: String,
        trim: true
      },
      establishedDate: {
        type: Date,
        default: Date.now
      },
      registrationNumber: {
        type: String,
        unique: true,
        required: true
      },
      taxId: {
        type: String,
        unique: true,
        required: true
      },
      logo: {
        type: String
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
      },
      isActive: {
        type: Boolean,
        default: true
      },
      adminUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }, {
      timestamps: true
    });

    const SubCompany = mongoose.model('SubCompany', subCompanySchema);

    // Get an existing owner company
    const db = mongoose.connection.db;
    const ownerCompanies = await db.collection('ownercompanies').find({}).toArray();
    const users = await db.collection('users').find({}).toArray();

    if (ownerCompanies.length === 0 || users.length === 0) {
      console.log('❌ No owner companies or users found');
      return;
    }

    const ownerCompanyId = ownerCompanies[0]._id;
    const adminUserId = users[0]._id;

    console.log('\n🧪 Testing direct company creation...');
    
    const testData = {
      ownerCompanyId: ownerCompanyId,
      name: "Direct Test Company " + Date.now(),
      industry: "Technology",
      category: "Startup",
      description: "Direct test company creation",
      contactEmail: "direct@test.com",
      contactPhone: "+1234567890",
      establishedDate: new Date("2024-01-01"),
      website: "https://directtest.com",
      address: "123 Direct Test St",
      registrationNumber: `DIRECT-${Date.now()}`,
      taxId: `DIRECTTAX-${Date.now()}`,
      adminUserId: adminUserId
    };

    console.log('📋 Creating company with data:');
    console.log(JSON.stringify(testData, null, 2));

    const company = new SubCompany(testData);
    await company.save();

    console.log('\n✅ Company created successfully!');
    console.log('🔍 Saved company data:');
    console.log('  ID:', company._id);
    console.log('  Name:', company.name);
    console.log('  Industry:', company.industry || '❌ MISSING');
    console.log('  Category:', company.category || '❌ MISSING');
    console.log('  Website:', company.website || '❌ MISSING');

    // Verify in database
    const savedCompany = await SubCompany.findById(company._id);
    console.log('\n🗄️ Verification from database:');
    console.log('  Industry:', savedCompany.industry || '❌ MISSING');
    console.log('  Category:', savedCompany.category || '❌ MISSING');
    console.log('  Website:', savedCompany.website || '❌ MISSING');

    if (savedCompany.industry && savedCompany.category) {
      console.log('\n🎉 SUCCESS: Direct creation works! The issue is in the API route.');
    } else {
      console.log('\n❌ FAILURE: Even direct creation fails. Schema issue.');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📝 Database connection closed');
  }
};

// Run the debug
debugCompanyCreation();
