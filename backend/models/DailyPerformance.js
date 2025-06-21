import mongoose from 'mongoose';

const dailyPerformanceSchema = new mongoose.Schema({
  // Reference to the investment
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Investment',
    required: true
  },
  // Date of the performance update
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Market value on this date
  marketValue: {
    type: Number,
    required: true,
    min: 0
  },
  // Daily change in value
  dailyChange: {
    type: Number,
    default: 0
  },
  // Daily change percentage
  dailyChangePercent: {
    type: Number,
    default: 0
  },
  // Profit/Loss for the day
  dailyProfitLoss: {
    type: Number,
    default: 0
  },
  // Volume traded (if applicable)
  volume: {
    type: Number,
    min: 0,
    default: 0
  },
  // Opening value for the day
  openingValue: {
    type: Number,
    min: 0
  },
  // Closing value for the day
  closingValue: {
    type: Number,
    min: 0
  },
  // Highest value during the day
  highValue: {
    type: Number,
    min: 0
  },
  // Lowest value during the day
  lowValue: {
    type: Number,
    min: 0
  },
  // Market conditions and notes
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  marketConditions: {
    type: String,
    enum: ['Bullish', 'Bearish', 'Neutral', 'Volatile', 'Stable'],
    default: 'Neutral'
  },
  // External factors affecting performance
  externalFactors: [{
    factor: {
      type: String,
      trim: true,
      maxlength: 100
    },
    impact: {
      type: String,
      enum: ['Positive', 'Negative', 'Neutral'],
      default: 'Neutral'
    }
  }],
  // Who updated this performance data
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Data source (manual, API, etc.)
  dataSource: {
    type: String,
    enum: ['Manual', 'API', 'Import', 'System'],
    default: 'Manual'
  },
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
dailyPerformanceSchema.index({ investmentId: 1, date: 1 }, { unique: true });
dailyPerformanceSchema.index({ investmentId: 1 });
dailyPerformanceSchema.index({ date: 1 });
dailyPerformanceSchema.index({ updatedBy: 1 });
dailyPerformanceSchema.index({ marketConditions: 1 });
dailyPerformanceSchema.index({ isVerified: 1 });

// Compound indexes for common queries
dailyPerformanceSchema.index({ investmentId: 1, date: -1 }); // Latest first
dailyPerformanceSchema.index({ investmentId: 1, isVerified: 1, date: -1 });

// Virtual for ROI calculation from initial investment
dailyPerformanceSchema.virtual('roiFromInitial').get(function() {
  // This will be calculated when populated with investment data
  return 0;
});

// Pre-save middleware to calculate daily profit/loss
dailyPerformanceSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Find previous day's performance to calculate daily change
    const previousPerformance = await this.constructor.findOne({
      investmentId: this.investmentId,
      date: { $lt: this.date }
    }).sort({ date: -1 });

    if (previousPerformance) {
      this.dailyChange = this.marketValue - previousPerformance.marketValue;
      this.dailyChangePercent = previousPerformance.marketValue > 0 ? 
        (this.dailyChange / previousPerformance.marketValue) * 100 : 0;
    }

    this.dailyProfitLoss = this.dailyChange;
  }
  next();
});

// Static method to get performance summary for an investment
dailyPerformanceSchema.statics.getPerformanceSummary = async function(investmentId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const performances = await this.find({
    investmentId: investmentId,
    date: { $gte: startDate }
  }).sort({ date: 1 });

  if (performances.length === 0) {
    return {
      totalDays: 0,
      totalChange: 0,
      totalChangePercent: 0,
      averageDailyChange: 0,
      bestDay: null,
      worstDay: null,
      volatility: 0
    };
  }

  const totalChange = performances[performances.length - 1].marketValue - performances[0].marketValue;
  const totalChangePercent = performances[0].marketValue > 0 ? 
    (totalChange / performances[0].marketValue) * 100 : 0;

  const dailyChanges = performances.map(p => p.dailyChangePercent);
  const averageDailyChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length;

  const bestDay = performances.reduce((best, current) => 
    current.dailyChangePercent > best.dailyChangePercent ? current : best
  );

  const worstDay = performances.reduce((worst, current) => 
    current.dailyChangePercent < worst.dailyChangePercent ? current : worst
  );

  // Calculate volatility (standard deviation of daily changes)
  const variance = dailyChanges.reduce((sum, change) => 
    sum + Math.pow(change - averageDailyChange, 2), 0) / dailyChanges.length;
  const volatility = Math.sqrt(variance);

  return {
    totalDays: performances.length,
    totalChange,
    totalChangePercent,
    averageDailyChange,
    bestDay: {
      date: bestDay.date,
      change: bestDay.dailyChange,
      changePercent: bestDay.dailyChangePercent
    },
    worstDay: {
      date: worstDay.date,
      change: worstDay.dailyChange,
      changePercent: worstDay.dailyChangePercent
    },
    volatility
  };
};

// Static method to get latest performance for multiple investments
dailyPerformanceSchema.statics.getLatestPerformances = async function(investmentIds) {
  const pipeline = [
    { $match: { investmentId: { $in: investmentIds } } },
    { $sort: { investmentId: 1, date: -1 } },
    { $group: {
        _id: '$investmentId',
        latestPerformance: { $first: '$$ROOT' }
      }
    }
  ];

  const results = await this.aggregate(pipeline);
  return results.reduce((acc, result) => {
    acc[result._id] = result.latestPerformance;
    return acc;
  }, {});
};

export default mongoose.model('DailyPerformance', dailyPerformanceSchema);
