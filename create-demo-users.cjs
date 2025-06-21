/**
 * Create Demo Users for Investment Management System
 * Creates verified demo users with known passwords for client demonstration
 */

const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

// Define schemas
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  phone: String,
  address: String,
  dateOfBirth: Date,
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: true },
  twoFactorEnabled: { type: Boolean, default: false },
  cnic: String,
  accountStatus: { type: String, default: 'active' },
  isFirstLogin: { type: Boolean, default: false },
  investmentPreferences: {
    riskTolerance: { type: String, default: 'medium' },
    preferredSectors: [String],
    investmentGoals: [String],
    timeHorizon: { type: String, default: 'medium' }
  },
  initialInvestmentAmount: Number,
  lastPasswordChange: Date,
  securityQuestions: [String],
  loginHistory: [Object],
  refreshTokens: [String]
}, { timestamps: true });

const roleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['superadmin', 'admin', 'investor'], required: true },
  permissions: [String],
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function createDemoUsers() {
  try {
    console.log('👥 Creating Demo Users for Investment Management System...\n');

    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // Demo users data with known passwords
    const demoUsers = [
      // Admin Users
      {
        email: 'admin.demo@investpro.com',
        password: 'Admin123!',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1-555-0101',
        address: '123 Admin Street, New York, NY 10001',
        dateOfBirth: new Date('1985-03-15'),
        cnic: '12345-6789012-1',
        role: 'admin',
        permissions: [
          'create_company', 'edit_company', 'delete_company', 'view_all_companies',
          'create_investment', 'edit_investment', 'delete_investment', 'view_all_investments',
          'manage_users', 'view_analytics', 'generate_reports'
        ]
      },
      {
        email: 'manager.demo@investpro.com',
        password: 'Manager123!',
        firstName: 'Michael',
        lastName: 'Chen',
        phone: '+1-555-0102',
        address: '456 Management Ave, San Francisco, CA 94105',
        dateOfBirth: new Date('1982-07-22'),
        cnic: '12345-6789012-2',
        role: 'admin',
        permissions: [
          'create_company', 'edit_company', 'view_all_companies',
          'create_investment', 'edit_investment', 'view_all_investments',
          'view_analytics', 'generate_reports'
        ]
      },

      // Investor Users
      {
        email: 'investor1.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'Emily',
        lastName: 'Rodriguez',
        phone: '+1-555-0201',
        address: '789 Investment Blvd, Austin, TX 78701',
        dateOfBirth: new Date('1988-11-10'),
        cnic: '12345-6789012-3',
        role: 'investor',
        initialInvestmentAmount: 500000,
        investmentPreferences: {
          riskTolerance: 'high',
          preferredSectors: ['Technology', 'Healthcare', 'Clean Energy'],
          investmentGoals: ['growth', 'diversification'],
          timeHorizon: 'long'
        }
      },
      {
        email: 'investor2.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'David',
        lastName: 'Thompson',
        phone: '+1-555-0202',
        address: '321 Portfolio Drive, Boston, MA 02101',
        dateOfBirth: new Date('1975-05-18'),
        cnic: '12345-6789012-4',
        role: 'investor',
        initialInvestmentAmount: 1200000,
        investmentPreferences: {
          riskTolerance: 'medium',
          preferredSectors: ['Financial Technology', 'Cybersecurity'],
          investmentGoals: ['income', 'stability'],
          timeHorizon: 'medium'
        }
      },
      {
        email: 'investor3.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'Lisa',
        lastName: 'Wang',
        phone: '+1-555-0203',
        address: '654 Capital Street, Seattle, WA 98101',
        dateOfBirth: new Date('1990-09-25'),
        cnic: '12345-6789012-5',
        role: 'investor',
        initialInvestmentAmount: 750000,
        investmentPreferences: {
          riskTolerance: 'high',
          preferredSectors: ['Education Technology', 'Agriculture Technology'],
          investmentGoals: ['growth', 'impact'],
          timeHorizon: 'long'
        }
      },
      {
        email: 'investor4.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'Robert',
        lastName: 'Miller',
        phone: '+1-555-0204',
        address: '987 Wealth Way, Chicago, IL 60601',
        dateOfBirth: new Date('1970-12-03'),
        cnic: '12345-6789012-6',
        role: 'investor',
        initialInvestmentAmount: 2000000,
        investmentPreferences: {
          riskTolerance: 'low',
          preferredSectors: ['Logistics & Supply Chain', 'Financial Technology'],
          investmentGoals: ['income', 'preservation'],
          timeHorizon: 'short'
        }
      },
      {
        email: 'investor5.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'Jennifer',
        lastName: 'Davis',
        phone: '+1-555-0205',
        address: '147 Fortune Lane, Denver, CO 80202',
        dateOfBirth: new Date('1983-04-14'),
        cnic: '12345-6789012-7',
        role: 'investor',
        initialInvestmentAmount: 900000,
        investmentPreferences: {
          riskTolerance: 'medium',
          preferredSectors: ['Healthcare', 'Clean Energy', 'Technology'],
          investmentGoals: ['growth', 'diversification'],
          timeHorizon: 'medium'
        }
      },
      {
        email: 'investor6.demo@gmail.com',
        password: 'Investor123!',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '+1-555-0206',
        address: '258 Equity Plaza, Washington, DC 20001',
        dateOfBirth: new Date('1978-08-07'),
        cnic: '12345-6789012-8',
        role: 'investor',
        initialInvestmentAmount: 1500000,
        investmentPreferences: {
          riskTolerance: 'high',
          preferredSectors: ['Cybersecurity', 'Technology', 'Financial Technology'],
          investmentGoals: ['growth', 'innovation'],
          timeHorizon: 'long'
        }
      }
    ];

    console.log(`📝 Creating ${demoUsers.length} demo users...\n`);

    const createdUsers = [];
    const userCredentials = [];

    for (const userData of demoUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`⚠️  User ${userData.email} already exists - skipping`);
        continue;
      }

      // Create user
      const user = new User({
        email: userData.email,
        password: userData.password, // Will be hashed by pre-save middleware
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        address: userData.address,
        dateOfBirth: userData.dateOfBirth,
        cnic: userData.cnic,
        isActive: true,
        emailVerified: true,
        accountStatus: 'active',
        isFirstLogin: false,
        investmentPreferences: userData.investmentPreferences || {
          riskTolerance: 'medium',
          preferredSectors: [],
          investmentGoals: [],
          timeHorizon: 'medium'
        },
        initialInvestmentAmount: userData.initialInvestmentAmount || null,
        lastPasswordChange: new Date()
      });

      await user.save();
      createdUsers.push(user);

      // Create role
      const role = new Role({
        userId: user._id,
        type: userData.role,
        permissions: userData.permissions || [],
        status: 'active'
      });

      await role.save();

      // Store credentials for display
      userCredentials.push({
        email: userData.email,
        password: userData.password,
        name: `${userData.firstName} ${userData.lastName}`,
        role: userData.role
      });

      console.log(`✅ Created ${userData.role}: ${userData.firstName} ${userData.lastName} (${userData.email})`);
    }

    console.log(`\n🎉 Successfully created ${createdUsers.length} demo users!`);

    // Display credentials
    console.log('\n🔑 Demo User Credentials:');
    console.log('=' .repeat(80));
    
    const adminUsers = userCredentials.filter(u => u.role === 'admin');
    const investorUsers = userCredentials.filter(u => u.role === 'investor');

    if (adminUsers.length > 0) {
      console.log('\n👑 ADMIN USERS:');
      adminUsers.forEach(user => {
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   Role: ${user.role.toUpperCase()}`);
        console.log('   ---');
      });
    }

    if (investorUsers.length > 0) {
      console.log('\n💰 INVESTOR USERS:');
      investorUsers.forEach(user => {
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${user.password}`);
        console.log(`   Role: ${user.role.toUpperCase()}`);
        console.log('   ---');
      });
    }

    console.log('\n📋 Quick Reference - All Passwords: Investor123! or Admin123! or Manager123!');
    console.log('\n🎯 Next Steps:');
    console.log('1. Test login with any of the above credentials');
    console.log('2. Run: node complete-demo-data.cjs (to add investments & transactions)');
    console.log('3. Run: node verify-demo-data.cjs (to verify complete setup)');

  } catch (error) {
    console.error('❌ Error creating demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

createDemoUsers();
