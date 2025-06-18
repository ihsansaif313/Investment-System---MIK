/**
 * WebSocket Event Handlers
 * Handles real-time event broadcasting for data synchronization
 */

import webSocketManager from './server.js';
import logger from '../utils/logger.js';

/**
 * Investment Events
 */
export const investmentEvents = {
  /**
   * Investment created event
   */
  created: (investment) => {
    const message = {
      type: 'investment_created',
      data: {
        id: investment._id,
        name: investment.name,
        subCompanyId: investment.subCompanyId,
        targetAmount: investment.targetAmount,
        status: investment.status,
        createdAt: investment.createdAt
      },
      timestamp: new Date().toISOString()
    };

    // Send to superadmin
    webSocketManager.sendToRoom('superadmin', message);

    // Send to relevant admin
    if (investment.subCompanyId) {
      webSocketManager.sendToRoom(`admin_${investment.subCompanyId}`, message);
    }

    // Send to investors
    webSocketManager.sendToRoom('investor', message);

    logger.info('Investment created event broadcasted', {
      investmentId: investment._id,
      name: investment.name
    });
  },

  /**
   * Investment updated event
   */
  updated: (investment, changes = {}) => {
    const message = {
      type: 'investment_updated',
      data: {
        id: investment._id,
        name: investment.name,
        subCompanyId: investment.subCompanyId,
        currentValue: investment.currentValue,
        totalInvested: investment.totalInvested,
        totalInvestors: investment.totalInvestors,
        status: investment.status,
        changes,
        updatedAt: investment.updatedAt
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendInvestmentUpdate(message.data, investment.subCompanyId);

    logger.info('Investment updated event broadcasted', {
      investmentId: investment._id,
      changes: Object.keys(changes)
    });
  },

  /**
   * Investment deleted event
   */
  deleted: (investmentId, subCompanyId) => {
    const message = {
      type: 'investment_deleted',
      data: {
        id: investmentId,
        subCompanyId
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendToRoom('superadmin', message);
    
    if (subCompanyId) {
      webSocketManager.sendToRoom(`admin_${subCompanyId}`, message);
    }

    logger.info('Investment deleted event broadcasted', {
      investmentId,
      subCompanyId
    });
  },

  /**
   * New investor investment event
   */
  newInvestor: (investorInvestment) => {
    const message = {
      type: 'new_investor',
      data: {
        id: investorInvestment._id,
        investmentId: investorInvestment.investmentId,
        userId: investorInvestment.userId,
        amountInvested: investorInvestment.amountInvested,
        status: investorInvestment.status,
        investmentDate: investorInvestment.investmentDate
      },
      timestamp: new Date().toISOString()
    };

    // Send to superadmin and relevant admin
    webSocketManager.sendToRoom('superadmin', message);
    webSocketManager.sendToRoom('admin', message);

    // Send to the specific investor
    webSocketManager.sendToUser(investorInvestment.userId, message);

    logger.info('New investor event broadcasted', {
      investorInvestmentId: investorInvestment._id,
      investmentId: investorInvestment.investmentId,
      userId: investorInvestment.userId
    });
  },

  /**
   * Investment approved event
   */
  approved: (investorInvestment) => {
    const message = {
      type: 'investment_approved',
      data: {
        id: investorInvestment._id,
        investmentId: investorInvestment.investmentId,
        userId: investorInvestment.userId,
        amountInvested: investorInvestment.amountInvested,
        approvedAt: investorInvestment.approvedAt
      },
      timestamp: new Date().toISOString()
    };

    // Send to the investor
    webSocketManager.sendToUser(investorInvestment.userId, message);

    // Send to admins
    webSocketManager.sendToRoom('admin', message);
    webSocketManager.sendToRoom('superadmin', message);

    logger.info('Investment approved event broadcasted', {
      investorInvestmentId: investorInvestment._id,
      userId: investorInvestment.userId
    });
  }
};

/**
 * User Events
 */
export const userEvents = {
  /**
   * User created event
   */
  created: (user) => {
    const message = {
      type: 'user_created',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendUserUpdate(message.data);

    logger.info('User created event broadcasted', {
      userId: user._id,
      email: user.email,
      role: user.role?.id
    });
  },

  /**
   * User updated event
   */
  updated: (user, changes = {}) => {
    const message = {
      type: 'user_updated',
      data: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        changes,
        updatedAt: user.updatedAt
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendUserUpdate(message.data);

    // Send to the user themselves
    webSocketManager.sendToUser(user._id, message);

    logger.info('User updated event broadcasted', {
      userId: user._id,
      changes: Object.keys(changes)
    });
  },

  /**
   * User login event
   */
  login: (user) => {
    const message = {
      type: 'user_login',
      data: {
        id: user._id,
        email: user.email,
        lastLogin: new Date()
      },
      timestamp: new Date().toISOString()
    };

    // Send to admins for monitoring
    webSocketManager.sendToRoom('admin', message);
    webSocketManager.sendToRoom('superadmin', message);

    logger.info('User login event broadcasted', {
      userId: user._id,
      email: user.email
    });
  },

  /**
   * User logout event
   */
  logout: (userId) => {
    const message = {
      type: 'user_logout',
      data: {
        id: userId,
        logoutTime: new Date()
      },
      timestamp: new Date().toISOString()
    };

    // Send to admins for monitoring
    webSocketManager.sendToRoom('admin', message);
    webSocketManager.sendToRoom('superadmin', message);

    logger.info('User logout event broadcasted', { userId });
  }
};

/**
 * Company Events
 */
export const companyEvents = {
  /**
   * Sub-company created event
   */
  created: (subCompany) => {
    const message = {
      type: 'company_created',
      data: {
        id: subCompany._id,
        name: subCompany.name,
        adminUserId: subCompany.adminUserId,
        isActive: subCompany.isActive,
        createdAt: subCompany.createdAt
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendToRoom('superadmin', message);

    logger.info('Sub-company created event broadcasted', {
      subCompanyId: subCompany._id,
      name: subCompany.name
    });
  },

  /**
   * Sub-company updated event
   */
  updated: (subCompany, changes = {}) => {
    const message = {
      type: 'company_updated',
      data: {
        id: subCompany._id,
        name: subCompany.name,
        adminUserId: subCompany.adminUserId,
        isActive: subCompany.isActive,
        changes,
        updatedAt: subCompany.updatedAt
      },
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendToRoom('superadmin', message);

    // Send to company admin
    if (subCompany.adminUserId) {
      webSocketManager.sendToUser(subCompany.adminUserId, message);
    }

    logger.info('Sub-company updated event broadcasted', {
      subCompanyId: subCompany._id,
      changes: Object.keys(changes)
    });
  }
};

/**
 * Analytics Events
 */
export const analyticsEvents = {
  /**
   * Analytics updated event
   */
  updated: (analyticsData, targetRole = 'all') => {
    const message = {
      type: 'analytics_updated',
      data: analyticsData,
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendAnalyticsUpdate(analyticsData, targetRole);

    logger.info('Analytics updated event broadcasted', {
      targetRole,
      dataKeys: Object.keys(analyticsData)
    });
  },

  /**
   * Performance metrics updated event
   */
  performanceUpdated: (metricsData, subCompanyId = null) => {
    const message = {
      type: 'performance_updated',
      data: metricsData,
      timestamp: new Date().toISOString()
    };

    webSocketManager.sendToRoom('superadmin', message);
    
    if (subCompanyId) {
      webSocketManager.sendToRoom(`admin_${subCompanyId}`, message);
    }

    logger.info('Performance metrics updated event broadcasted', {
      subCompanyId,
      metricsKeys: Object.keys(metricsData)
    });
  }
};

/**
 * System Events
 */
export const systemEvents = {
  /**
   * System maintenance event
   */
  maintenance: (maintenanceInfo) => {
    const message = {
      type: 'system_maintenance',
      data: maintenanceInfo,
      timestamp: new Date().toISOString()
    };

    webSocketManager.broadcast(message);

    logger.info('System maintenance event broadcasted', maintenanceInfo);
  },

  /**
   * System alert event
   */
  alert: (alertInfo, targetRole = 'all') => {
    const message = {
      type: 'system_alert',
      data: alertInfo,
      timestamp: new Date().toISOString()
    };

    if (targetRole === 'all') {
      webSocketManager.broadcast(message);
    } else {
      webSocketManager.sendToRoom(targetRole, message);
    }

    logger.info('System alert event broadcasted', {
      targetRole,
      alert: alertInfo
    });
  }
};

/**
 * Trigger event based on type
 */
export const triggerEvent = (eventType, eventData, options = {}) => {
  const [category, action] = eventType.split('.');

  switch (category) {
    case 'investment':
      if (investmentEvents[action]) {
        investmentEvents[action](eventData, options);
      }
      break;
    case 'user':
      if (userEvents[action]) {
        userEvents[action](eventData, options);
      }
      break;
    case 'company':
      if (companyEvents[action]) {
        companyEvents[action](eventData, options);
      }
      break;
    case 'analytics':
      if (analyticsEvents[action]) {
        analyticsEvents[action](eventData, options.targetRole);
      }
      break;
    case 'system':
      if (systemEvents[action]) {
        systemEvents[action](eventData, options.targetRole);
      }
      break;
    default:
      logger.warn('Unknown event category:', category);
  }
};

export default {
  investmentEvents,
  userEvents,
  companyEvents,
  analyticsEvents,
  systemEvents,
  triggerEvent
};
