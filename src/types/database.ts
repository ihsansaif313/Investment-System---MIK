// Database Types based on ER Diagram
export type UserRole = 'superadmin' | 'admin' | 'investor';
export type UserStatus = 'active' | 'pending' | 'rejected';
export type InvestmentStatus = 'Active' | 'Completed' | 'Paused';
export type AssetType = 'Stock' | 'Crypto' | 'RealEstate' | 'Business';
export type ProfitLossPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';

// Core Database Entities
export interface User {
  id: string;
  email: string;
  password_hash?: string; // Only for backend
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  created_at: Date;
  last_login?: Date;
  updated_at: Date;
}

export interface Role {
  id: string;
  user_id: string;
  type: UserRole;
  created_at: Date;
}

export interface OwnerCompany {
  id: string;
  name: string;
  description?: string;
  address: string;
  contact_email: string;
  phone?: string;
  website?: string;
  logo?: string;
  established_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface SubCompany {
  id: string;
  owner_company_id: string;
  name: string;
  industry: string;
  description?: string;
  address?: string;
  contact_email?: string;
  phone?: string;
  logo?: string;
  established_date: Date;
  status: 'active' | 'inactive' | 'pending';
  created_at: Date;
  updated_at: Date;
}

export interface SubCompanyAdmin {
  id: string;
  sub_company_id: string;
  user_id: string;
  assigned_date: Date;
  status: 'active' | 'inactive';
  permissions?: string[];
  created_at: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  market_symbol?: string;
  description?: string;
  sector?: string;
  current_price?: number;
  price_change_24h?: number;
  price_change_percentage?: number;
  market_cap?: number;
  volume_24h?: number;
  logo?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Investment {
  id: string;
  sub_company_id: string;
  asset_id: string;
  name: string;
  description?: string;
  initial_amount: number;
  current_value: number;
  target_amount?: number;
  min_investment?: number;
  max_investment?: number;
  expected_roi?: number;
  start_date: Date;
  end_date?: Date;
  status: InvestmentStatus;
  risk_level: 'Low' | 'Medium' | 'High';
  terms_conditions?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvestorInvestment {
  id: string;
  user_id: string;
  investment_id: string;
  amount_invested: number;
  investment_date: Date;
  status: 'active' | 'withdrawn' | 'completed';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProfitLoss {
  id: string;
  investment_id?: string;
  investor_investment_id?: string;
  record_date: Date;
  profit_amount: number;
  loss_amount: number;
  net_amount: number;
  percentage_change: number;
  period: ProfitLossPeriod;
  notes?: string;
  created_at: Date;
}

// Extended types for UI components
export interface UserWithRole extends User {
  role: Role;
  subCompanyAdmin?: SubCompanyAdmin;
}

export interface SubCompanyWithDetails extends SubCompany {
  ownerCompany: OwnerCompany;
  admin?: UserWithRole;
  totalInvestments: number;
  totalInvestors: number;
  totalValue: number;
  profitLoss: {
    profit: number;
    loss: number;
    roi: number;
  };
}

export interface InvestmentWithDetails extends Investment {
  asset: Asset;
  subCompany: SubCompanyWithDetails;
  investorInvestments: InvestorInvestment[];
  profitLossRecords: ProfitLoss[];
  totalInvested: number;
  totalInvestors: number;
  currentROI: number;
}

export interface InvestorInvestmentWithDetails extends InvestorInvestment {
  investment: InvestmentWithDetails;
  user: UserWithRole;
  profitLossRecords: ProfitLoss[];
  currentValue: number;
  totalReturn: number;
  roi: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  user: UserWithRole;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Dashboard Analytics types
export interface DashboardAnalytics {
  totalInvestments: number;
  totalInvestors: number;
  totalValue: number;
  totalProfit: number;
  totalLoss: number;
  roi: number;
  monthlyGrowth: number;
  activeInvestments: number;
  pendingInvestments: number;
  completedInvestments: number;
}

export interface SuperadminAnalytics extends DashboardAnalytics {
  totalSubCompanies: number;
  totalAdmins: number;
  topPerformingCompanies: SubCompanyWithDetails[];
  recentActivities: ActivityLog[];
}

export interface AdminAnalytics extends DashboardAnalytics {
  subCompany: SubCompanyWithDetails;
  topInvestments: InvestmentWithDetails[];
  recentInvestors: UserWithRole[];
  monthlyPerformance: MonthlyPerformance[];
}

export interface InvestorAnalytics extends DashboardAnalytics {
  portfolio: InvestorInvestmentWithDetails[];
  availableInvestments: InvestmentWithDetails[];
  recentTransactions: InvestorInvestment[];
  portfolioDistribution: PortfolioDistribution[];
}

export interface MonthlyPerformance {
  month: string;
  year: number;
  totalInvestment: number;
  totalReturn: number;
  roi: number;
  profit: number;
  loss: number;
}

export interface PortfolioDistribution {
  assetType: AssetType;
  value: number;
  percentage: number;
  count: number;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Filter and Search types
export interface InvestmentFilters {
  status?: InvestmentStatus[];
  assetType?: AssetType[];
  riskLevel?: string[];
  minAmount?: number;
  maxAmount?: number;
  subCompanyId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface UserFilters {
  role?: UserRole[];
  status?: UserStatus[];
  subCompanyId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Form types
export interface CreateSubCompanyForm {
  name: string;
  industry: string;
  description?: string;
  address?: string;
  contact_email?: string;
  phone?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone?: string;
}

export interface CreateInvestmentForm {
  name: string;
  description?: string;
  asset_id: string;
  initial_amount: number;
  target_amount?: number;
  min_investment?: number;
  max_investment?: number;
  expected_roi?: number;
  end_date?: Date;
  risk_level: 'Low' | 'Medium' | 'High';
  terms_conditions?: string;
}

export interface InvestForm {
  investment_id: string;
  amount_invested: number;
  notes?: string;
}

// Real-time calculation interfaces
export interface CalculatedMetrics {
  totalValue: number;
  totalInvested: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  roi: number;
  investmentCount: number;
  investorCount: number;
  lastUpdated: Date;
}

export interface PerformanceTrend {
  period: string;
  totalInvestment: number;
  totalReturn: number;
  netProfit: number;
  roi: number;
  investmentCount: number;
}

export interface InvestmentStatusDistribution {
  status: InvestmentStatus;
  count: number;
  totalValue: number;
  percentage: number;
}

export interface RealTimeUpdate {
  type: 'investment_created' | 'investment_updated' | 'profit_loss_recorded' | 'investor_investment';
  entityId: string;
  subCompanyId?: string;
  timestamp: Date;
  data: any;
}
