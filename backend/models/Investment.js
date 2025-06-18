import mongoose from 'mongoose';

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
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
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
    required: true,
    min: 0
  },
  maxInvestment: {
    type: Number,
    min: 0
  },
  expectedROI: {
    type: Number,
    required: true,
    min: 0
  },
  actualROI: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
    default: 'Active'
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
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
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for performance
investmentSchema.index({ subCompanyId: 1 });
investmentSchema.index({ assetId: 1 });
investmentSchema.index({ status: 1 });
investmentSchema.index({ riskLevel: 1 });
investmentSchema.index({ startDate: 1 });
investmentSchema.index({ featured: 1 });

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
  
  return this.save();
};

// Pre-save middleware to update actual ROI
investmentSchema.pre('save', function(next) {
  this.actualROI = this.currentROI;
  next();
});

export default mongoose.model('Investment', investmentSchema);
