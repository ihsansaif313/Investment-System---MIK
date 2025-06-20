import { ActivityLog } from '../models/index.js';
import logger from '../utils/logger.js';

/**
 * Activity Log Service
 * Centralized service for logging user activities throughout the system
 */
class ActivityLogService {
  
  /**
   * Log user authentication activities
   */
  static async logUserLogin(userId, metadata = {}) {
    try {
      const log = new ActivityLog({
        userId,
        action: 'user_login',
        entity: 'user',
        entityId: userId,
        details: {
          description: 'User logged in successfully',
          ...metadata
        },
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
        severity: 'info'
      });
      await log.save();
      return log;
    } catch (error) {
      logger.error('Failed to log user login', { error: error.message, userId });
      return null;
    }
  }

  static async logUserLogout(userId, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'user_logout',
      entityType: 'user',
      entityId: userId,
      description: 'User logged out',
      metadata
    });
  }

  static async logUserRegistration(userId, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'user_registered',
      entityType: 'user',
      entityId: userId,
      description: 'New user registered',
      metadata
    });
  }

  static async logUserApproval(adminUserId, targetUserId, metadata = {}) {
    return ActivityLog.logActivity({
      userId: adminUserId,
      action: 'user_approved',
      entityType: 'user',
      entityId: targetUserId,
      description: `User approved by admin`,
      metadata
    });
  }

  static async logUserRejection(adminUserId, targetUserId, reason, metadata = {}) {
    return ActivityLog.logActivity({
      userId: adminUserId,
      action: 'user_rejected',
      entityType: 'user',
      entityId: targetUserId,
      description: `User rejected by admin: ${reason}`,
      metadata: { ...metadata, reason }
    });
  }

  /**
   * Log company activities
   */
  static async logCompanyCreation(userId, companyId, companyName, metadata = {}) {
    try {
      const log = new ActivityLog({
        userId,
        action: 'company_created',
        entity: 'company',
        entityId: companyId,
        details: {
          description: `Created company: ${companyName}`,
          companyName,
          ...metadata
        },
        ipAddress: metadata.ip,
        userAgent: metadata.userAgent,
        severity: 'info'
      });
      await log.save();
      return log;
    } catch (error) {
      console.error('Failed to log company creation:', error);
      return null;
    }
  }

  static async logCompanyUpdate(userId, companyId, companyName, changes, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'company_updated',
      entityType: 'company',
      entityId: companyId,
      description: `Updated company: ${companyName}`,
      metadata: { ...metadata, companyName, changes }
    });
  }

  static async logCompanyDeletion(userId, companyId, companyName, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'company_deleted',
      entityType: 'company',
      entityId: companyId,
      description: `Deleted company: ${companyName}`,
      metadata: { ...metadata, companyName }
    });
  }

  /**
   * Log investment activities
   */
  static async logInvestmentCreation(userId, investmentId, investmentName, amount, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'investment_created',
      entityType: 'investment',
      entityId: investmentId,
      description: `Created investment: ${investmentName} (${amount})`,
      metadata: { ...metadata, investmentName, amount }
    });
  }

  static async logInvestmentUpdate(userId, investmentId, investmentName, changes, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'investment_updated',
      entityType: 'investment',
      entityId: investmentId,
      description: `Updated investment: ${investmentName}`,
      metadata: { ...metadata, investmentName, changes }
    });
  }

  static async logInvestmentDeletion(userId, investmentId, investmentName, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'investment_deleted',
      entityType: 'investment',
      entityId: investmentId,
      description: `Deleted investment: ${investmentName}`,
      metadata: { ...metadata, investmentName }
    });
  }

  static async logInvestmentCompletion(userId, investmentId, investmentName, finalAmount, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'investment_completed',
      entityType: 'investment',
      entityId: investmentId,
      description: `Completed investment: ${investmentName} (Final: ${finalAmount})`,
      metadata: { ...metadata, investmentName, finalAmount }
    });
  }

  /**
   * Log admin assignment activities
   */
  static async logAdminAssignment(superAdminUserId, adminUserId, companyId, companyName, metadata = {}) {
    return ActivityLog.logActivity({
      userId: superAdminUserId,
      action: 'admin_assigned',
      entityType: 'admin_assignment',
      entityId: `${adminUserId}_${companyId}`,
      description: `Assigned admin to company: ${companyName}`,
      metadata: { ...metadata, adminUserId, companyId, companyName }
    });
  }

  static async logAdminRemoval(superAdminUserId, adminUserId, companyId, companyName, metadata = {}) {
    return ActivityLog.logActivity({
      userId: superAdminUserId,
      action: 'admin_removed',
      entityType: 'admin_assignment',
      entityId: `${adminUserId}_${companyId}`,
      description: `Removed admin from company: ${companyName}`,
      metadata: { ...metadata, adminUserId, companyId, companyName }
    });
  }

  /**
   * Log financial activities
   */
  static async logProfitRecorded(userId, investmentId, amount, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'profit_recorded',
      entityType: 'investment',
      entityId: investmentId,
      description: `Recorded profit: $${amount}`,
      metadata: { ...metadata, amount, type: 'profit' }
    });
  }

  static async logLossRecorded(userId, investmentId, amount, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'loss_recorded',
      entityType: 'investment',
      entityId: investmentId,
      description: `Recorded loss: $${amount}`,
      metadata: { ...metadata, amount, type: 'loss' }
    });
  }

  /**
   * Log system activities
   */
  static async logReportGeneration(userId, reportType, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'report_generated',
      entityType: 'system',
      entityId: null,
      description: `Generated ${reportType} report`,
      metadata: { ...metadata, reportType }
    });
  }

  static async logSystemBackup(userId, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'system_backup',
      entityType: 'system',
      entityId: null,
      description: 'System backup completed',
      metadata
    });
  }

  static async logSystemMaintenance(userId, maintenanceType, metadata = {}) {
    return ActivityLog.logActivity({
      userId,
      action: 'system_maintenance',
      entityType: 'system',
      entityId: null,
      description: `System maintenance: ${maintenanceType}`,
      metadata: { ...metadata, maintenanceType }
    });
  }

  /**
   * Get activity statistics
   */
  static async getActivityStats(timeRange = '7d') {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const stats = await ActivityLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
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

    return stats;
  }
}

export default ActivityLogService;
