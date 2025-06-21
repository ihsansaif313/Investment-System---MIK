/**
 * Initialize Database with Admin User
 * Creates the admin user and necessary collections
 */

const mongoose = require('./backend/node_modules/mongoose');
const bcrypt = require('./backend/node_modules/bcryptjs');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  cnic: String,
  address: String,
  dateOfBirth: Date,
  accountStatus: { type: String, default: 'active' },
  isFirstLogin: { type: Boolean, default: false },
  createdBy: mongoose.Schema.Types.ObjectId,
  investmentPreferences: {
    riskTolerance: String,
    preferredSectors: [String],
    investmentGoals: [String],
    timeHorizon: String
  },
  initialInvestmentAmount: Number,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Role Schema
const roleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true, enum: ['superadmin', 'admin', 'investor'] },
  status: { type: String, default: 'active', enum: ['active', 'inactive', 'suspended'] },
  permissions: [String],
  companyId: mongoose.Schema.Types.ObjectId
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const Role = mongoose.model('Role', roleSchema);

async function initializeDatabase() {
  console.log('🔄 Initializing Database...\n');

  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'ihsansaif@gmail.com' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      
      // Check if role exists
      const existingRole = await Role.findOne({ userId: existingAdmin._id });
      if (!existingRole) {
        console.log('🔄 Creating admin role...');
        await Role.create({
          userId: existingAdmin._id,
          type: 'superadmin',
          status: 'active',
          permissions: ['all']
        });
        console.log('✅ Admin role created');
      } else {
        console.log('✅ Admin role already exists');
      }
    } else {
      console.log('🔄 Creating admin user...');
      
      // Create admin user
      const adminUser = await User.create({
        firstName: 'Ihsan',
        lastName: 'Saif',
        email: 'ihsansaif@gmail.com',
        password: 'Ihs@n2553.',
        phone: '+92-300-1234567',
        accountStatus: 'active',
        isFirstLogin: false
      });

      console.log('✅ Admin user created');

      // Create admin role
      await Role.create({
        userId: adminUser._id,
        type: 'superadmin',
        status: 'active',
        permissions: ['all']
      });

      console.log('✅ Admin role created');
    }

    // Verify the setup
    const adminUser = await User.findOne({ email: 'ihsansaif@gmail.com' });
    const adminRole = await Role.findOne({ userId: adminUser._id });

    console.log('\n📊 Database Status:');
    console.log('✅ Admin User:', adminUser.email);
    console.log('✅ Admin Role:', adminRole.type);
    console.log('✅ Account Status:', adminUser.accountStatus);
    console.log('✅ Database initialized successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

initializeDatabase();
