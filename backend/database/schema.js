/**
 * MongoDB Database Schema Design
 * Production-ready schema with proper indexing, validation, and relationships
 */

import mongoose from 'mongoose';

// ============================================================================
// USER SCHEMA
// ============================================================================
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ emailVerified: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ============================================================================
// ROLE SCHEMA
// ============================================================================
const roleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['superadmin', 'admin', 'investor'],
    index: true
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete', 'manage']
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for user-role lookup
roleSchema.index({ userId: 1, type: 1 });
roleSchema.index({ type: 1, isActive: 1 });

// ============================================================================
// OWNER COMPANY SCHEMA
// ============================================================================
const ownerCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  establishedDate: {
    type: Date,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  taxId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  logo: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
ownerCompanySchema.index({ registrationNumber: 1 });
ownerCompanySchema.index({ taxId: 1 });
ownerCompanySchema.index({ isActive: 1 });

// ============================================================================
// SUB COMPANY SCHEMA
// ============================================================================
const subCompanySchema = new mongoose.Schema({
  ownerCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OwnerCompany',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  establishedDate: {
    type: Date,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  taxId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  logo: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
subCompanySchema.index({ ownerCompanyId: 1 });
subCompanySchema.index({ adminUserId: 1 });
subCompanySchema.index({ registrationNumber: 1 });
subCompanySchema.index({ taxId: 1 });
subCompanySchema.index({ isActive: 1 });

// ============================================================================
// ASSET SCHEMA
// ============================================================================
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    maxlength: 10
  },
  type: {
    type: String,
    required: true,
    enum: ['stock', 'bond', 'crypto', 'commodity', 'real_estate', 'mutual_fund', 'etf', 'other']
  },
  sector: {
    type: String,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    maxlength: 3
  },
  marketCap: {
    type: Number,
    min: 0
  },
  volume24h: {
    type: Number,
    min: 0
  },
  priceChange24h: {
    type: Number
  },
  priceChangePercent24h: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    exchange: String,
    isin: String,
    cusip: String,
    website: String,
    logoUrl: String
  }
}, {
  timestamps: true
});

// Indexes
assetSchema.index({ symbol: 1, type: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ sector: 1 });
assetSchema.index({ isActive: 1 });
assetSchema.index({ lastUpdated: -1 });

// ============================================================================
// INVESTMENT SCHEMA
// ============================================================================
const investmentSchema = new mongoose.Schema({
  subCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCompany',
    required: true
  },
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  minInvestment: {
    type: Number,
    required: true,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  totalInvested: {
    type: Number,
    default: 0,
    min: 0
  },
  totalInvestors: {
    type: Number,
    default: 0,
    min: 0
  },
  expectedROI: {
    type: Number,
    min: -100,
    max: 1000
  },
  actualROI: {
    type: Number,
    default: 0
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'closed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    maxlength: 3
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  terms: {
    lockPeriod: Number, // in days
    earlyWithdrawalPenalty: Number, // percentage
    managementFee: Number, // percentage
    performanceFee: Number // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
investmentSchema.index({ subCompanyId: 1 });
investmentSchema.index({ assetId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ riskLevel: 1 });
investmentSchema.index({ startDate: 1, endDate: 1 });
investmentSchema.index({ createdBy: 1 });
investmentSchema.index({ isActive: 1 });

// ============================================================================
// INVESTOR INVESTMENT SCHEMA
// ============================================================================
const investorInvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  amountInvested: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: {
    type: Number,
    min: 0
  },
  pricePerShare: {
    type: Number,
    min: 0
  },
  investmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'active', 'withdrawn', 'matured'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  withdrawnAt: {
    type: Date
  },
  maturedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
investorInvestmentSchema.index({ userId: 1 });
investorInvestmentSchema.index({ investmentId: 1 });
investorInvestmentSchema.index({ status: 1 });
investorInvestmentSchema.index({ investmentDate: -1 });
investorInvestmentSchema.index({ userId: 1, investmentId: 1 }, { unique: true });

// ============================================================================
// PROFIT LOSS SCHEMA
// ============================================================================
const profitLossSchema = new mongoose.Schema({
  investorInvestmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InvestorInvestment',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['profit', 'loss', 'dividend', 'fee', 'withdrawal']
  },
  amount: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  calculatedBy: {
    type: String,
    enum: ['system', 'manual'],
    default: 'system'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
profitLossSchema.index({ investorInvestmentId: 1 });
profitLossSchema.index({ userId: 1 });
profitLossSchema.index({ investmentId: 1 });
profitLossSchema.index({ type: 1 });
profitLossSchema.index({ date: -1 });

// ============================================================================
// ACTIVITY LOG SCHEMA
// ============================================================================
const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  entity: {
    type: String,
    required: true,
    enum: ['user', 'investment', 'company', 'asset', 'role', 'system']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info'
  }
}, {
  timestamps: true
});

// Indexes
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ entity: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ severity: 1 });

// ============================================================================
// AUDIT TRAIL SCHEMA
// ============================================================================
const auditTrailSchema = new mongoose.Schema({
  collection: {
    type: String,
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  operation: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldData: {
    type: mongoose.Schema.Types.Mixed
  },
  newData: {
    type: mongoose.Schema.Types.Mixed
  },
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
auditTrailSchema.index({ collection: 1, documentId: 1 });
auditTrailSchema.index({ userId: 1 });
auditTrailSchema.index({ operation: 1 });
auditTrailSchema.index({ timestamp: -1 });

// ============================================================================
// SESSION SCHEMA (for JWT token management)
// ============================================================================
const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: String,
    browser: String,
    os: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ isActive: 1 });

export {
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
};
