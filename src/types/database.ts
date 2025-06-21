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
  // Investor-specific fields
  cnic?: string;
  dateOfBirth?: Date;
  address?: string;
  investmentPreferences?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredSectors?: string[];
    investmentGoals?: string[];
    timeHorizon?: 'short' | 'medium' | 'long';
  };
  initialInvestmentAmount?: number;
  accountStatus?: 'pending_setup' | 'active' | 'suspended' | 'inactive';
  isFirstLogin?: boolean;
  createdBy?: string; // ID of admin who created this investor account
}

export interface Role {
  id: string;
  user_id: string;
  type: UserRole;
  status: 'active' | 'pending' | 'inactive';
  permissions?: string[];
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
  category?: string;
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

export interface CompanyAssignment {
  id: string;
  userId: string;
  subCompanyId: string;
  assignedBy: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
  assignedDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
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
  companyAssignments?: CompanyAssignmentWithDetails[];
}

export interface CompanyAssignmentWithDetails {
  id: string;
  companyId: string;
  companyName: string;
  companyIndustry: string;
  companyDescription?: string;
  companyLogo?: string;
  permissions: string[];
  assignedDate: Date;
  status: 'active' | 'inactive' | 'pending';
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

export interface SalesmanAnalytics {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  totalSales: number;
  totalCommission: number;
  monthlyTarget: number;
  targetProgress: number;
  monthlyGrowth: number;
  activePipeline: number;
  closedDeals: number;
  averageDealSize: number;
  topPerformingInvestments: {
    id: string;
    name: string;
    salesCount: number;
    totalValue: number;
    commission: number;
  }[];
  recentSales: {
    id: string;
    clientName: string;
    investmentName: string;
    amount: number;
    commission: number;
    date: Date;
  }[];
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
  userName: string;
  userEmail: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  description: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    companyId?: string;
    investmentId?: string;
    amount?: number;
    previousValue?: any;
    newValue?: any;
    additionalInfo?: any;
  };
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
  category?: string;
  description?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  establishedDate?: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
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

export interface CreateInvestorForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cnic: string;
  address: string;
  dateOfBirth: string;
  investmentPreferences?: {
    riskTolerance?: 'low' | 'medium' | 'high';
    preferredSectors?: string[];
    investmentGoals?: string[];
    timeHorizon?: 'short' | 'medium' | 'long';
  };
  initialInvestmentAmount?: number;
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
