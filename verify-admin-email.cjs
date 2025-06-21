/**
 * Verify Admin Email
 * Manually verify the admin user's email in the database
 */

const mongoose = require('./backend/node_modules/mongoose');

async function verifyAdminEmail() {
  try {
    console.log('🔄 Verifying Admin Email...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/investment_management');
    console.log('✅ Connected to MongoDB');

    // User Schema
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      emailVerified: { type: Boolean, default: false },
      emailVerificationToken: String,
      emailVerificationExpires: Date,
      accountStatus: String,
      isFirstLogin: Boolean
    }, { timestamps: true });

    const User = mongoose.model('User', userSchema);

    // Find admin user
    const adminUser = await User.findOne({ email: 'ihsansaif@gmail.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('👤 Admin user found:', adminUser.email);
    console.log('📧 Email verified:', adminUser.emailVerified);
    console.log('🔐 Account status:', adminUser.accountStatus);

    // Verify email
    adminUser.emailVerified = true;
    adminUser.emailVerificationToken = undefined;
    adminUser.emailVerificationExpires = undefined;
    await adminUser.save();

    console.log('✅ Admin email verified successfully!');

    // Verify the update
    const updatedUser = await User.findOne({ email: 'ihsansaif@gmail.com' });
    console.log('📧 Updated email verified status:', updatedUser.emailVerified);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

verifyAdminEmail();
