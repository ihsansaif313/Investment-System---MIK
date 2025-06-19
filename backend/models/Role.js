import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['superadmin', 'admin', 'investor', 'salesman'],
    required: true
  },
  permissions: [{
    type: String,
    enum: [
      'create_company',
      'edit_company',
      'delete_company',
      'view_all_companies',
      'create_investment',
      'edit_investment',
      'delete_investment',
      'view_all_investments',
      'manage_users',
      'view_analytics',
      'generate_reports',
      'manage_assets'
    ]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for performance
roleSchema.index({ userId: 1 });
roleSchema.index({ type: 1 });

// Set default permissions and status based on role type
roleSchema.pre('save', function(next) {
  if (this.isNew) {
    switch (this.type) {
      case 'superadmin':
        this.permissions = [
          'create_company',
          'edit_company',
          'delete_company',
          'view_all_companies',
          'create_investment',
          'edit_investment',
          'delete_investment',
          'view_all_investments',
          'manage_users',
          'view_analytics',
          'generate_reports',
          'manage_assets'
        ];
        this.status = 'active'; // Superadmins are automatically active
        break;
      case 'admin':
        this.permissions = [
          'create_investment',
          'edit_investment',
          'delete_investment',
          'view_all_investments',
          'view_analytics',
          'generate_reports'
        ];
        this.status = 'pending'; // Admins require approval
        break;
      case 'investor':
        this.permissions = [
          'view_analytics',
          'generate_reports'
        ];
        this.status = 'active'; // Investors are automatically active
        break;
      case 'salesman':
        this.permissions = [
          'view_analytics',
          'generate_reports',
          'view_all_investments'
        ];
        this.status = 'active'; // Salesmen are automatically active
        break;
    }
  }
  next();
});

export default mongoose.model('Role', roleSchema);
