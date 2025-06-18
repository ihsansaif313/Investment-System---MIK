/**
 * MongoDB Models
 * Production-ready models with proper validation and middleware
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  userSchema,
  roleSchema,
  ownerCompanySchema,
  subCompanySchema,
  assetSchema,
  investmentSchema,
  investorInvestmentSchema,
  profitLossSchema,
  activityLogSchema,
  auditTrailSchema,
  sessionSchema
} from '../database/schema.js';

// ============================================================================
// USER MODEL WITH MIDDLEWARE
// ============================================================================

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// ============================================================================
// INVESTMENT MODEL WITH MIDDLEWARE
// ============================================================================

// Pre-save middleware to calculate ROI
investmentSchema.pre('save', function(next) {
  if (this.totalInvested > 0) {
    this.actualROI = ((this.currentValue - this.totalInvested) / this.totalInvested) * 100;
  }
  next();
});

// Method to check if investment is active
investmentSchema.methods.isInvestmentActive = function() {
  return this.status === 'active' && 
         this.startDate <= new Date() && 
         this.endDate >= new Date();
};

// Method to check if investment can accept new investors
investmentSchema.methods.canAcceptInvestors = function() {
  return this.isInvestmentActive() && 
         (!this.targetAmount || this.totalInvested < this.targetAmount);
};

// ============================================================================
// INVESTOR INVESTMENT MODEL WITH MIDDLEWARE
// ============================================================================

// Pre-save middleware to calculate current value
investorInvestmentSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('amountInvested')) {
    try {
      const investment = await mongoose.model('Investment').findById(this.investmentId);
      if (investment && investment.totalInvested > 0) {
        // Calculate proportional current value
        const proportion = this.amountInvested / investment.totalInvested;
        this.currentValue = investment.currentValue * proportion;
      }
    } catch (error) {
      console.error('Error calculating current value:', error);
    }
  }
  next();
});

// ============================================================================
// AUDIT TRAIL MIDDLEWARE
// ============================================================================

// Function to create audit trail
const createAuditTrail = async function(doc, operation, userId, oldData = null) {
  try {
    const AuditTrail = mongoose.model('AuditTrail');
    
    const changes = [];
    if (operation === 'update' && oldData) {
      // Calculate changes
      for (const key in doc.toObject()) {
        if (oldData[key] !== doc[key] && key !== 'updatedAt') {
          changes.push({
            field: key,
            oldValue: oldData[key],
            newValue: doc[key]
          });
        }
      }
    }
    
    await AuditTrail.create({
      collection: doc.constructor.modelName,
      documentId: doc._id,
      operation,
      userId,
      oldData: operation === 'update' ? oldData : undefined,
      newData: operation !== 'delete' ? doc.toObject() : undefined,
      changes: operation === 'update' ? changes : undefined
    });
  } catch (error) {
    console.error('Error creating audit trail:', error);
  }
};

// Add audit trail middleware to all schemas
const addAuditMiddleware = (schema, modelName) => {
  schema.post('save', async function(doc) {
    const userId = this.$locals?.userId || this.createdBy || this.userId;
    await createAuditTrail(doc, this.isNew ? 'create' : 'update', userId, this.$locals?.oldData);
  });
  
  schema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
      const userId = this.getOptions()?.userId;
      await createAuditTrail(doc, 'update', userId, this.getOptions()?.oldData);
    }
  });
  
  schema.post('findOneAndDelete', async function(doc) {
    if (doc) {
      const userId = this.getOptions()?.userId;
      await createAuditTrail(doc, 'delete', userId);
    }
  });
};

// Apply audit middleware to relevant schemas
addAuditMiddleware(userSchema, 'User');
addAuditMiddleware(investmentSchema, 'Investment');
addAuditMiddleware(investorInvestmentSchema, 'InvestorInvestment');
addAuditMiddleware(subCompanySchema, 'SubCompany');

// ============================================================================
// CREATE MODELS (with overwrite protection)
// ============================================================================

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);
const OwnerCompany = mongoose.models.OwnerCompany || mongoose.model('OwnerCompany', ownerCompanySchema);
const SubCompany = mongoose.models.SubCompany || mongoose.model('SubCompany', subCompanySchema);
const Asset = mongoose.models.Asset || mongoose.model('Asset', assetSchema);
const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);
const InvestorInvestment = mongoose.models.InvestorInvestment || mongoose.model('InvestorInvestment', investorInvestmentSchema);
const ProfitLoss = mongoose.models.ProfitLoss || mongoose.model('ProfitLoss', profitLossSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
const AuditTrail = mongoose.models.AuditTrail || mongoose.model('AuditTrail', auditTrailSchema);
const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export {
  User,
  Role,
  OwnerCompany,
  SubCompany,
  Asset,
  Investment,
  InvestorInvestment,
  ProfitLoss,
  ActivityLog,
  AuditTrail,
  Session
};
