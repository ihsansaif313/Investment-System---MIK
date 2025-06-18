import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Stock', 'Bond', 'Crypto', 'Real Estate', 'Commodity', 'Business', 'Other'],
    trim: true
  },
  symbol: {
    type: String,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  priceChange24h: {
    type: Number,
    default: 0
  },
  priceChangePercentage: {
    type: Number,
    default: 0
  },
  marketCap: {
    type: Number,
    min: 0
  },
  volume24h: {
    type: Number,
    min: 0
  },
  logo: {
    type: String
  },
  website: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  exchange: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true,
    uppercase: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  priceHistory: [{
    date: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    volume: {
      type: Number,
      min: 0
    }
  }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
assetSchema.index({ name: 1 });
assetSchema.index({ type: 1 });
assetSchema.index({ symbol: 1 });
assetSchema.index({ isActive: 1 });
assetSchema.index({ 'priceHistory.date': 1 });

// Virtual for price trend
assetSchema.virtual('priceTrend').get(function() {
  if (this.priceChangePercentage > 0) return 'up';
  if (this.priceChangePercentage < 0) return 'down';
  return 'stable';
});

// Method to add price history
assetSchema.methods.addPriceHistory = function(price, volume = 0) {
  this.priceHistory.push({
    date: new Date(),
    price,
    volume
  });
  
  // Keep only last 365 days of history
  if (this.priceHistory.length > 365) {
    this.priceHistory = this.priceHistory.slice(-365);
  }
  
  // Update current price and calculate change
  const previousPrice = this.currentPrice;
  this.currentPrice = price;
  this.priceChange24h = price - previousPrice;
  this.priceChangePercentage = previousPrice > 0 ? ((price - previousPrice) / previousPrice) * 100 : 0;
  this.lastUpdated = new Date();
  
  return this.save();
};

// Method to get price history for a date range
assetSchema.methods.getPriceHistory = function(startDate, endDate) {
  return this.priceHistory.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
};

export default mongoose.model('Asset', assetSchema);
