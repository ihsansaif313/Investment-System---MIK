import mongoose from 'mongoose';

const ownerCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
    unique: true,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  logo: {
    type: String
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const subCompanySchema = new mongoose.Schema({
  ownerCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OwnerCompany',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  establishedDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  logo: {
    type: String
  },
  website: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for performance
ownerCompanySchema.index({ name: 1 });
ownerCompanySchema.index({ contactEmail: 1 });

subCompanySchema.index({ ownerCompanyId: 1 });
subCompanySchema.index({ name: 1 });
subCompanySchema.index({ industry: 1 });
subCompanySchema.index({ status: 1 });

// Virtual for sub-company investments
subCompanySchema.virtual('investments', {
  ref: 'Investment',
  localField: '_id',
  foreignField: 'subCompanyId'
});

// Virtual for total investment value
subCompanySchema.virtual('totalValue').get(function() {
  // This would be calculated from related investments
  return 0; // Placeholder
});

// Company Assignment Schema for multiple admin assignments
const companyAssignmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subCompanyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCompany',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: [
      'view_company_data',
      'manage_investments',
      'view_analytics',
      'manage_users',
      'generate_reports'
    ]
  }],
  assignedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
companyAssignmentSchema.index({ userId: 1, subCompanyId: 1 }, { unique: true });
companyAssignmentSchema.index({ userId: 1 });
companyAssignmentSchema.index({ subCompanyId: 1 });
companyAssignmentSchema.index({ status: 1 });

// Set default permissions for admin assignments
companyAssignmentSchema.pre('save', function(next) {
  if (this.isNew && this.permissions.length === 0) {
    this.permissions = [
      'view_company_data',
      'manage_investments',
      'view_analytics',
      'generate_reports'
    ];
  }
  next();
});

export const OwnerCompany = mongoose.model('OwnerCompany', ownerCompanySchema);
export const SubCompany = mongoose.model('SubCompany', subCompanySchema);
export const CompanyAssignment = mongoose.model('CompanyAssignment', companyAssignmentSchema);
