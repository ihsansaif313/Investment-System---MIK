// Form dropdown options and constants
// These can be moved to database configuration in the future

export const INDUSTRY_OPTIONS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Real Estate',
  'Energy',
  'Manufacturing',
  'Retail',
  'Transportation',
  'Education',
  'Entertainment',
  'Agriculture',
  'Construction',
  'Media',
  'Telecommunications',
  'Automotive',
  'Aerospace',
  'Biotechnology',
  'Pharmaceuticals',
  'Food & Beverage',
  'Hospitality',
  'Other'
];

export const CATEGORY_OPTIONS = [
  'General',
  'Startup',
  'Growth',
  'Mature',
  'Acquisition',
  'Joint Venture',
  'Subsidiary',
  'Division',
  'Branch',
  'Franchise',
  'Partnership',
  'Other'
];

export const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' }
];

// Investor role removed - investors are now created by admins only
export const ADMIN_ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'superadmin', label: 'Super Admin' }
];

export const RISK_LEVEL_OPTIONS = [
  { value: 'Low', label: 'Low Risk' },
  { value: 'Medium', label: 'Medium Risk' },
  { value: 'High', label: 'High Risk' }
];

export const ASSET_TYPE_OPTIONS = [
  'Stock',
  'Bond',
  'Real Estate',
  'Cryptocurrency',
  'Commodity',
  'Business',
  'Mutual Fund',
  'ETF',
  'Other'
];

export const INVESTMENT_STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export const REPORT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'performance', label: 'Performance' },
  { value: 'investment', label: 'Investment' },
  { value: 'financial', label: 'Financial' },
  { value: 'risk', label: 'Risk' },
  { value: 'market', label: 'Market' },
  { value: 'investor', label: 'Investor' },
  { value: 'tax', label: 'Tax' }
];

export const ANALYTICS_METRIC_OPTIONS = [
  { value: 'value', label: 'Total Value' },
  { value: 'roi', label: 'ROI' },
  { value: 'profit', label: 'Profit/Loss' },
  { value: 'growth', label: 'Growth Rate' }
];

export const TIME_RANGE_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' }
];

export const USER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
];

export const COMPANY_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' }
];

// Currency options for international support
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
  { value: 'AUD', label: 'Australian Dollar (A$)' }
];

// Country options (subset - can be expanded)
export const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'Australia',
  'Singapore',
  'Switzerland',
  'Netherlands',
  'Other'
];
