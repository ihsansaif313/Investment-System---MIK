import mongoose from 'mongoose';
import { config } from './config/environment.js';
import { ActivityLog, User, SubCompany } from './models/index.js';

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

// Seed activity logs
const seedActivityLogs = async () => {
  try {
    console.log('🌱 Starting activity logs seeding...');

    // Get existing users and companies
    const users = await User.find().limit(10);
    const companies = await SubCompany.find().limit(5);

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create some users first.');
      return;
    }

    // Clear existing activity logs
    await ActivityLog.deleteMany({});
    console.log('🗑️ Cleared existing activity logs');

    const activityLogs = [];
    const now = new Date();

    // Generate sample activities for the last 30 days
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDaysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

      // Random activity types
      const activities = [
        {
          action: 'user_login',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `${randomUser.firstName} ${randomUser.lastName} logged in successfully`,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          action: 'user_logout',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `${randomUser.firstName} ${randomUser.lastName} logged out`,
            ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        }
      ];

      // Add company-related activities if companies exist
      if (companies.length > 0) {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        activities.push(
          {
            action: 'company_created',
            entity: 'company',
            entityId: randomCompany._id,
            details: {
              description: `Created company: ${randomCompany.name}`,
              companyName: randomCompany.name,
              industry: randomCompany.industry
            },
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'info'
          },
          {
            action: 'company_updated',
            entity: 'company',
            entityId: randomCompany._id,
            details: {
              description: `Updated company: ${randomCompany.name}`,
              companyName: randomCompany.name,
              changes: ['name', 'description', 'contactEmail'][Math.floor(Math.random() * 3)]
            },
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            severity: 'info'
          }
        );
      }

      // Add investment-related activities
      const investmentName = ['TikTok Growth Fund', 'Meta Expansion', 'Tech Startup Portfolio', 'Green Energy Initiative'][Math.floor(Math.random() * 4)];
      const profitAmount = Math.floor(Math.random() * 50000) + 1000;
      const reportType = ['financial', 'performance', 'analytics'][Math.floor(Math.random() * 3)];

      activities.push(
        {
          action: 'investment_created',
          entity: 'investment',
          entityId: randomUser._id, // Use user ID as placeholder since we don't have investment IDs
          details: {
            description: `Created investment: ${investmentName}`,
            investmentName,
            amount: Math.floor(Math.random() * 1000000) + 10000
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          action: 'profit_recorded',
          entity: 'investment',
          entityId: randomUser._id, // Use user ID as placeholder
          details: {
            description: `Recorded profit: $${profitAmount.toLocaleString()}`,
            amount: profitAmount,
            type: 'profit'
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          action: 'admin_assigned',
          entity: 'user',
          entityId: randomUser._id,
          details: {
            description: `Assigned admin to company`,
            adminUserId: randomUser._id.toString(),
            companyId: companies.length > 0 ? companies[0]._id.toString() : 'unknown'
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        },
        {
          action: 'report_generated',
          entity: 'system',
          entityId: randomUser._id, // Use user ID since system actions need an entity
          details: {
            description: `Generated ${reportType} report`,
            reportType
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          severity: 'info'
        }
      );

      const randomActivity = activities[Math.floor(Math.random() * activities.length)];

      activityLogs.push({
        userId: randomUser._id,
        action: randomActivity.action,
        entity: randomActivity.entity,
        entityId: randomActivity.entityId,
        details: randomActivity.details,
        ipAddress: randomActivity.ipAddress,
        userAgent: randomActivity.userAgent,
        severity: randomActivity.severity,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    // Insert all activity logs
    await ActivityLog.insertMany(activityLogs);
    console.log(`✅ Created ${activityLogs.length} activity logs`);

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

    console.log('\n🎉 Activity logs seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding activity logs:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedActivityLogs();
  await mongoose.disconnect();
  console.log('👋 Disconnected from MongoDB');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script error:', error);
  process.exit(1);
});
