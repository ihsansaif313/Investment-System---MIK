import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  // Admin who created this investment
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Company this investment belongs to
  subCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCompany',
    required: true
  },
  // Optional asset reference (for existing asset-based investments)
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: false
  },
  // Basic investment information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  // Investment type/category
  investmentType: {
    type: String,
    required: true,
    enum: ['Stocks', 'Bonds', 'Real Estate', 'Cryptocurrency', 'Commodities', 'Mutual Funds', 'ETF', 'Private Equity', 'Venture Capital', 'Other'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: 100
  },
  // Financial details
  initialAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentValue: {
    type: Number,
    required: true,
    min: 0
  },
  minInvestment: {
    type: Number,
    default: 0,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  expectedROI: {
    type: Number,
    required: true,
    min: -100,
    max: 10000
  },
  actualROI: {
    type: Number,
    default: 0
  },
  // Investment timeline
  investmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  // Investment status and risk
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
    default: 'Active'
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Very High'],
    required: true
  },
  // Additional metadata
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // Document attachments
  documents: [{
    name: {
      type: String,
      required: true,
      maxlength: 200
    },
    url: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  // Performance tracking
  performanceMetrics: {
    totalInvested: {
      type: Number,
      default: 0
    },
    totalReturns: {
      type: Number,
      default: 0
    },
    totalInvestors: {
      type: Number,
      default: 0
    },
    averageInvestment: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  // Daily performance summary (latest values for quick access)
  latestPerformance: {
    date: {
      type: Date,
      default: Date.now
    },
    marketValue: {
      type: Number,
      default: 0
    },
    dailyChange: {
      type: Number,
      default: 0
    },
    dailyChangePercent: {
      type: Number,
      default: 0
    }
  },
  // Visibility and features
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Admin management fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
investmentSchema.index({ subCompanyId: 1 });
investmentSchema.index({ createdBy: 1 });
investmentSchema.index({ assetId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ riskLevel: 1 });
investmentSchema.index({ investmentType: 1 });
investmentSchema.index({ startDate: 1 });
investmentSchema.index({ investmentDate: 1 });
investmentSchema.index({ featured: 1 });
investmentSchema.index({ isActive: 1 });
investmentSchema.index({ 'latestPerformance.date': 1 });
// Compound indexes for common queries
investmentSchema.index({ subCompanyId: 1, status: 1 });
investmentSchema.index({ createdBy: 1, status: 1 });
investmentSchema.index({ investmentType: 1, riskLevel: 1 });

// Virtual for current ROI calculation
investmentSchema.virtual('currentROI').get(function() {
  if (this.initialAmount === 0) return 0;
  return ((this.currentValue - this.initialAmount) / this.initialAmount) * 100;
});

// Virtual for profit/loss
investmentSchema.virtual('profitLoss').get(function() {
  return this.currentValue - this.initialAmount;
});

// Virtual for investment duration
investmentSchema.virtual('duration').get(function() {
  const start = new Date(this.startDate);
  const end = this.endDate ? new Date(this.endDate) : new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to update performance metrics
investmentSchema.methods.updatePerformanceMetrics = async function() {
  const InvestorInvestment = mongoose.model('InvestorInvestment');

  const investments = await InvestorInvestment.find({ investmentId: this._id });

  this.performanceMetrics.totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  this.performanceMetrics.totalInvestors = investments.length;
  this.performanceMetrics.averageInvestment = investments.length > 0 ?
    this.performanceMetrics.totalInvested / investments.length : 0;

  // Calculate total returns based on current value proportion
  const valueMultiplier = this.initialAmount > 0 ? this.currentValue / this.initialAmount : 1;
  this.performanceMetrics.totalReturns = this.performanceMetrics.totalInvested * valueMultiplier;
  this.performanceMetrics.lastUpdated = new Date();

  return this.save();
};

// Method to update latest performance data
investmentSchema.methods.updateLatestPerformance = async function(marketValue, notes = '') {
  const previousValue = this.latestPerformance.marketValue || this.currentValue;
  const dailyChange = marketValue - previousValue;
  const dailyChangePercent = previousValue > 0 ? (dailyChange / previousValue) * 100 : 0;

  this.latestPerformance = {
    date: new Date(),
    marketValue: marketValue,
    dailyChange: dailyChange,
    dailyChangePercent: dailyChangePercent
  };

  this.currentValue = marketValue;

  // Create daily performance record
  const DailyPerformance = mongoose.model('DailyPerformance');
  await DailyPerformance.create({
    investmentId: this._id,
    date: new Date(),
    marketValue: marketValue,
    dailyChange: dailyChange,
    dailyChangePercent: dailyChangePercent,
    notes: notes,
    updatedBy: this.lastModifiedBy
  });

  return this.save();
};

// Method to get performance history
investmentSchema.methods.getPerformanceHistory = async function(days = 30) {
  const DailyPerformance = mongoose.model('DailyPerformance');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await DailyPerformance.find({
    investmentId: this._id,
    date: { $gte: startDate }
  }).sort({ date: 1 });
};

// Pre-save middleware to update actual ROI
investmentSchema.pre('save', function(next) {
  this.actualROI = this.currentROI;
  next();
});

export default mongoose.model('Investment', investmentSchema);
