/**
 * SAMPLE LOGS CREATION SCRIPT - DISABLED FOR PRODUCTION USE
 * This file has been disabled to ensure clean production deployment
 */

console.error('❌ SAMPLE LOGS CREATION DISABLED');
console.error('❌ This file contains test/dummy data and is disabled for production use');
console.error('💡 Activity logs will be generated naturally through real user actions');
process.exit(1);

/*
import mongoose from 'mongoose';
import { config } from './config/environment.js';
import { ActivityLog, User } from './models/index.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample activity logs
const createSampleLogs = async () => {
  try {
    console.log('🌱 Creating sample activity logs...');

    // Get existing users
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('⚠️ No users found. Please create some users first.');
      return;
    }

    console.log(`Found ${users.length} users to create logs for`);

    // Clear existing activity logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared existing activity logs');

    const sampleLogs = [];
    const now = new Date();

    // Create sample logs for the last 7 days
    for (let i = 0; i < 20; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDaysAgo = Math.floor(Math.random() * 7);
      const timestamp = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

      const activities = [
        {
          userId: randomUser._id,
          action: 'user_login',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `${randomUser.firstName} ${randomUser.lastName} logged in successfully`,
            loginTime: timestamp
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          userId: randomUser._id,
          action: 'user_logout',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `${randomUser.firstName} ${randomUser.lastName} logged out`,
            logoutTime: timestamp
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          userId: randomUser._id,
          action: 'company_created',
          entity: 'company',
          entityId: randomUser._id, // Using user ID as placeholder
          details: {
            description: `Created company: ${['TechCorp', 'InvestCo', 'GrowthFund', 'StartupHub'][Math.floor(Math.random() * 4)]}`,
            companyName: ['TechCorp', 'InvestCo', 'GrowthFund', 'StartupHub'][Math.floor(Math.random() * 4)],
            industry: ['Technology', 'Finance', 'Healthcare', 'Education'][Math.floor(Math.random() * 4)]
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          userId: randomUser._id,
          action: 'investment_created',
          entity: 'investment',
          entityId: randomUser._id, // Using user ID as placeholder
          details: {
            description: `Created investment: ${['Growth Portfolio', 'Tech Stocks', 'Real Estate Fund', 'Crypto Portfolio'][Math.floor(Math.random() * 4)]}`,
            investmentName: ['Growth Portfolio', 'Tech Stocks', 'Real Estate Fund', 'Crypto Portfolio'][Math.floor(Math.random() * 4)],
            amount: Math.floor(Math.random() * 100000) + 10000
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          createdAt: timestamp,
          updatedAt: timestamp
        },
        {
          userId: randomUser._id,
          action: 'admin_assigned',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `Admin assigned to company`,
            adminUserId: randomUser._id.toString(),
            companyName: ['TechCorp', 'InvestCo', 'GrowthFund'][Math.floor(Math.random() * 3)]
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info',
          createdAt: timestamp,
          updatedAt: timestamp
        }
      ];

      // Pick a random activity
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      sampleLogs.push(randomActivity);
    }

    // Insert all activity logs
    await ActivityLog.insertMany(sampleLogs);
    console.log(`✅ Created ${sampleLogs.length} sample activity logs`);

    // Show summary
    const summary = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    console.log('\n📊 Activity Summary:');
    summary.forEach(item => {
      console.log(`   ${item._id}: ${item.count} activities`);
    });

    console.log('\n🎉 Sample activity logs created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample logs:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await createSampleLogs();
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
*/
