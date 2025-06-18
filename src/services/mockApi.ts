// Mock API service for development
import { 
  LoginResponse, 
  UserWithRole, 
  SubCompanyWithDetails, 
  InvestmentWithDetails, 
  InvestorInvestmentWithDetails,
  Asset,
  SuperadminAnalytics,
  AdminAnalytics,
  InvestorAnalytics,
  ActivityLog,
  ProfitLoss,
  CreateSubCompanyForm,
  CreateInvestmentForm,
  InvestForm
} from '../types/database';

/**
 * ⚠️ DEVELOPMENT MOCK DATA - NOT FOR PRODUCTION
 * This file contains mock data for frontend development only.
 * In production, all data should come from the secure backend API.
 * The backend authentication system is the source of truth.
 */

// Mock data for development/testing only
const mockUsers: UserWithRole[] = [
  // Note: These are mock users for frontend development only
  // Real authentication happens through the backend API
];

const mockAssets: Asset[] = [
  {
    id: 'asset1',
    name: 'TikTok',
    type: 'Business',
    market_symbol: 'TIKTOK',
    description: 'Social media platform investment',
    current_price: 150.50,
    price_change_24h: 2.5,
    price_change_percentage: 1.69,
    created_at: new Date('2023-01-01'),
    updated_at: new Date()
  },
  {
    id: 'asset2',
    name: 'Facebook (Meta)',
    type: 'Stock',
    market_symbol: 'META',
    description: 'Meta Platforms Inc.',
    current_price: 298.75,
    price_change_24h: -5.25,
    price_change_percentage: -1.73,
    created_at: new Date('2023-01-01'),
    updated_at: new Date()
  },
  {
    id: 'asset3',
    name: 'Walmart',
    type: 'Stock',
    market_symbol: 'WMT',
    description: 'Walmart Inc.',
    current_price: 165.20,
    price_change_24h: 1.80,
    price_change_percentage: 1.10,
    created_at: new Date('2023-01-01'),
    updated_at: new Date()
  }
];

const mockSubCompanies: SubCompanyWithDetails[] = [
  {
    id: 'comp1',
    owner_company_id: 'owner1',
    name: 'TechVest Inc.',
    industry: 'Technology',
    description: 'Technology investment company',
    established_date: new Date('2023-01-15'),
    status: 'active',
    created_at: new Date('2023-01-15'),
    updated_at: new Date(),
    ownerCompany: {
      id: 'owner1',
      name: 'Investment Holdings Corp',
      address: '123 Main St, New York, NY',
      contact_email: 'contact@holdings.com',
      established_date: new Date('2020-01-01'),
      created_at: new Date('2020-01-01'),
      updated_at: new Date()
    },
    admin: mockUsers[1],
    totalInvestments: 5,
    totalInvestors: 25,
    totalValue: 2500000,
    profitLoss: {
      profit: 450000,
      loss: 125000,
      roi: 15.2
    }
  }
];

const mockInvestments: InvestmentWithDetails[] = [
  {
    id: 'inv1',
    sub_company_id: 'comp1',
    asset_id: 'asset1',
    name: 'TikTok Growth Fund',
    description: 'Investment in TikTok advertising and growth',
    initial_amount: 500000,
    current_value: 612500,
    min_investment: 1000,
    max_investment: 50000,
    expected_roi: 20,
    start_date: new Date('2023-03-01'),
    status: 'Active',
    risk_level: 'Medium',
    created_at: new Date('2023-03-01'),
    updated_at: new Date(),
    asset: mockAssets[0],
    subCompany: mockSubCompanies[0],
    investorInvestments: [],
    profitLossRecords: [],
    totalInvested: 500000,
    totalInvestors: 15,
    currentROI: 22.5
  }
];

const mockSuperadminAnalytics: SuperadminAnalytics = {
  totalInvestments: 12,
  totalInvestors: 85,
  totalValue: 5250000,
  totalProfit: 875000,
  totalLoss: 125000,
  roi: 16.7,
  monthlyGrowth: 8.5,
  activeInvestments: 8,
  pendingInvestments: 3,
  completedInvestments: 1,
  totalSubCompanies: 3,
  totalAdmins: 3,
  topPerformingCompanies: mockSubCompanies,
  recentActivities: []
};

const mockAdminAnalytics: AdminAnalytics = {
  totalInvestments: 5,
  totalInvestors: 25,
  totalValue: 2500000,
  totalProfit: 450000,
  totalLoss: 125000,
  roi: 15.2,
  monthlyGrowth: 12.5,
  activeInvestments: 3,
  pendingInvestments: 1,
  completedInvestments: 1,
  subCompany: mockSubCompanies[0],
  topInvestments: mockInvestments,
  recentInvestors: [mockUsers[1]],
  monthlyPerformance: [
    { month: 'Jan', year: 2024, totalInvestment: 400000, totalReturn: 450000, roi: 12.5, profit: 50000, loss: 0 },
    { month: 'Feb', year: 2024, totalInvestment: 500000, totalReturn: 575000, roi: 15.0, profit: 75000, loss: 0 },
    { month: 'Mar', year: 2024, totalInvestment: 650000, totalReturn: 747500, roi: 15.0, profit: 97500, loss: 0 },
    { month: 'Apr', year: 2024, totalInvestment: 800000, totalReturn: 920000, roi: 15.0, profit: 120000, loss: 0 },
    { month: 'May', year: 2024, totalInvestment: 950000, totalReturn: 1092500, roi: 15.0, profit: 142500, loss: 0 },
    { month: 'Jun', year: 2024, totalInvestment: 1100000, totalReturn: 1265000, roi: 15.0, profit: 165000, loss: 0 }
  ]
};

const mockInvestorAnalytics: InvestorAnalytics = {
  totalInvestments: 3,
  totalInvestors: 1,
  totalValue: 75000,
  totalProfit: 12500,
  totalLoss: 2500,
  roi: 13.3,
  monthlyGrowth: 8.5,
  activeInvestments: 2,
  pendingInvestments: 1,
  completedInvestments: 0,
  portfolio: [],
  availableInvestments: mockInvestments,
  recentTransactions: [],
  portfolioDistribution: [
    { assetType: 'Business', value: 30000, percentage: 40, count: 1 },
    { assetType: 'Stock', value: 25000, percentage: 33.3, count: 1 },
    { assetType: 'Crypto', value: 20000, percentage: 26.7, count: 1 }
  ]
};

// Mock user database for authentication
interface MockUserAccount {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  verificationToken?: string;
  resetToken?: string;
  created_at: Date;
  last_login?: Date;
}

// Mock registered users database with localStorage persistence
const STORAGE_KEY = 'mockUserAccounts';

// Load existing accounts from localStorage or start fresh
const loadMockUserAccounts = (): MockUserAccount[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Failed to load mock user accounts from localStorage:', error);
    return [];
  }
};

// Save accounts to localStorage
const saveMockUserAccounts = (accounts: MockUserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.warn('Failed to save mock user accounts to localStorage:', error);
  }
};

// Initialize mock user accounts
let mockUserAccounts: MockUserAccount[] = loadMockUserAccounts();

// Clear all accounts function (for fresh start)
const clearAllMockAccounts = (): void => {
  mockUserAccounts = [];
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ All mock user accounts cleared!');
};

// Expose clear function globally for testing
(window as any).clearMockAccounts = clearAllMockAccounts;

// Mock API functions with realistic delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApiService = {
  // Authentication
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(1000);

    // Reload accounts from localStorage to ensure we have latest data
    mockUserAccounts = loadMockUserAccounts();

    // Find user in mock database
    const userAccount = mockUserAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userAccount) {
      throw new Error('Invalid email or password');
    }

    // Check password (in real app, this would use bcrypt.compare)
    if (userAccount.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Check if email is verified
    if (!userAccount.emailVerified) {
      const error = new Error('Please verify your email address before logging in.');
      (error as any).code = 'EMAIL_NOT_VERIFIED';
      (error as any).requiresEmailVerification = true;
      throw error;
    }

    // Update last login
    userAccount.last_login = new Date();

    // Create user response
    const user: UserWithRole = {
      id: userAccount.id,
      email: userAccount.email,
      firstName: userAccount.firstName,
      lastName: userAccount.lastName,
      created_at: userAccount.created_at,
      last_login: userAccount.last_login,
      updated_at: new Date(),
      role: {
        id: 'role_' + userAccount.id,
        user_id: userAccount.id,
        type: userAccount.role as any,
        created_at: userAccount.created_at
      }
    };

    return {
      user,
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 3600
    };
  },

  async logout(): Promise<void> {
    await delay(500);
  },

  async refreshToken(): Promise<LoginResponse> {
    await delay(500);
    return this.login('superadmin@example.com', 'password');
  },

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    role: string;
  }): Promise<any> {
    await delay(1500);

    // Check if email already exists
    const existingUser = mockUserAccounts.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate verification token
    const verificationToken = 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Create new user account
    const newUserAccount: MockUserAccount = {
      id: 'user_' + Date.now(),
      email: userData.email,
      password: userData.password, // In real app, this would be hashed
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      emailVerified: false, // Requires verification
      verificationToken: verificationToken,
      created_at: new Date()
    };

    // Add to mock database and save to localStorage
    mockUserAccounts.push(newUserAccount);
    saveMockUserAccounts(mockUserAccounts);

    // Create response user object (without sensitive data)
    const responseUser: UserWithRole = {
      id: newUserAccount.id,
      email: newUserAccount.email,
      firstName: newUserAccount.firstName,
      lastName: newUserAccount.lastName,
      created_at: newUserAccount.created_at,
      updated_at: newUserAccount.created_at,
      last_login: null,
      role: {
        id: 'role_' + newUserAccount.id,
        user_id: newUserAccount.id,
        type: userData.role as any,
        created_at: newUserAccount.created_at
      }
    };

    console.log('');
    console.log('🎉 REGISTRATION SUCCESSFUL!');
    console.log('📧 Email verification required before login');
    console.log('👤 Registered user:', userData.email);
    console.log('🔗 Verification Token:', verificationToken);
    console.log('📋 Verification URL:', 'http://localhost:5174/verify-email?token=' + verificationToken);
    console.log('👆 COPY THE URL ABOVE AND PASTE IT IN YOUR BROWSER TO VERIFY YOUR EMAIL');
    console.log('⚠️  You MUST verify your email before you can login!');
    console.log('');

    return {
      user: responseUser,
      requiresEmailVerification: true
    };
  },

  async verifyEmail(token: string): Promise<void> {
    await delay(1000);

    // Reload accounts from localStorage to ensure we have latest data
    mockUserAccounts = loadMockUserAccounts();

    console.log('🔍 Attempting to verify token:', token);
    console.log('📋 Current registered accounts:', mockUserAccounts.map(u => ({
      email: u.email,
      verified: u.emailVerified,
      token: u.verificationToken
    })));

    // Find user with this verification token
    const userAccount = mockUserAccounts.find(u => u.verificationToken === token);

    if (!userAccount) {
      console.log('❌ No user found with token:', token);
      throw new Error('Invalid or expired verification token');
    }

    if (userAccount.emailVerified) {
      console.log('⚠️ Email already verified for:', userAccount.email);
      throw new Error('Email is already verified');
    }

    // Verify the email
    userAccount.emailVerified = true;
    userAccount.verificationToken = undefined;

    // Save changes to localStorage
    saveMockUserAccounts(mockUserAccounts);

    console.log('✅ Email verified successfully for:', userAccount.email);
    console.log('🎉 Account is now active and can login!');
  },

  async resendVerification(email: string): Promise<void> {
    await delay(800);

    // Find user account
    const userAccount = mockUserAccounts.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!userAccount) {
      // Don't reveal if email exists - just return success
      console.log('📧 Verification email would be sent to:', email, '(if account exists)');
      return;
    }

    if (userAccount.emailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const newVerificationToken = 'verify_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    userAccount.verificationToken = newVerificationToken;

    // Save changes to localStorage
    saveMockUserAccounts(mockUserAccounts);

    console.log('');
    console.log('📧 VERIFICATION EMAIL RESENT!');
    console.log('🔗 New Verification Token:', newVerificationToken);
    console.log('📋 New Verification URL:', 'http://localhost:5174/verify-email?token=' + newVerificationToken);
    console.log('👆 Copy the URL above and paste it in your browser to verify your email');
    console.log('');
  },

  async forgotPassword(email: string): Promise<void> {
    await delay(1000);
    console.log('Password reset email sent to:', email);
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await delay(1200);

    // Simulate expired token for demo
    if (token === 'expired-reset-token') {
      throw new Error('Invalid or expired reset token');
    }

    console.log('Password reset successfully with token:', token);
  },

  // Users
  async getUsers(): Promise<UserWithRole[]> {
    await delay(800);
    return mockUsers;
  },

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await delay(500);
    console.log(`Updated user ${userId} status to ${status}`);
  },

  // Companies
  async getSubCompanies(): Promise<SubCompanyWithDetails[]> {
    await delay(1000);
    return mockSubCompanies;
  },

  async getSubCompanyById(id: string): Promise<SubCompanyWithDetails> {
    await delay(500);
    const company = mockSubCompanies.find(c => c.id === id);
    if (!company) throw new Error('Company not found');
    return company;
  },

  async createSubCompany(data: CreateSubCompanyForm): Promise<SubCompanyWithDetails> {
    await delay(1500);
    // Mock creation - in real app this would create the company and admin user
    const newCompany: SubCompanyWithDetails = {
      id: 'comp' + Date.now(),
      owner_company_id: 'owner1',
      name: data.name,
      industry: data.industry,
      description: data.description,
      established_date: new Date(),
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      ownerCompany: mockSubCompanies[0].ownerCompany,
      totalInvestments: 0,
      totalInvestors: 0,
      totalValue: 0,
      profitLoss: { profit: 0, loss: 0, roi: 0 }
    };
    mockSubCompanies.push(newCompany);
    return newCompany;
  },

  // Investments
  async getInvestments(): Promise<InvestmentWithDetails[]> {
    await delay(1000);
    return mockInvestments;
  },

  async createInvestment(data: CreateInvestmentForm): Promise<InvestmentWithDetails> {
    await delay(1200);
    const asset = mockAssets.find(a => a.id === data.asset_id);
    if (!asset) throw new Error('Asset not found');
    
    const newInvestment: InvestmentWithDetails = {
      id: 'inv' + Date.now(),
      sub_company_id: mockSubCompanies[0].id,
      asset_id: data.asset_id,
      name: data.name,
      description: data.description,
      initial_amount: data.initial_amount,
      current_value: data.initial_amount,
      min_investment: data.min_investment,
      max_investment: data.max_investment,
      expected_roi: data.expected_roi,
      start_date: new Date(),
      status: 'Active',
      risk_level: data.risk_level,
      created_at: new Date(),
      updated_at: new Date(),
      asset,
      subCompany: mockSubCompanies[0],
      investorInvestments: [],
      profitLossRecords: [],
      totalInvested: 0,
      totalInvestors: 0,
      currentROI: 0
    };
    mockInvestments.push(newInvestment);
    return newInvestment;
  },

  // Assets
  async getAssets(): Promise<Asset[]> {
    await delay(600);
    return mockAssets;
  },

  // Analytics
  async getSuperadminAnalytics(): Promise<SuperadminAnalytics> {
    await delay(1200);
    return {
      ...mockSuperadminAnalytics,
      monthlyPerformance: [
        { month: 'Jan', year: 2024, totalInvestment: 1200000, totalReturn: 1350000, roi: 12.5, profit: 150000, loss: 0 },
        { month: 'Feb', year: 2024, totalInvestment: 1450000, totalReturn: 1620000, roi: 11.7, profit: 170000, loss: 0 },
        { month: 'Mar', year: 2024, totalInvestment: 1800000, totalReturn: 2070000, roi: 15.0, profit: 270000, loss: 0 },
        { month: 'Apr', year: 2024, totalInvestment: 2100000, totalReturn: 2415000, roi: 15.0, profit: 315000, loss: 0 },
        { month: 'May', year: 2024, totalInvestment: 2400000, totalReturn: 2760000, roi: 15.0, profit: 360000, loss: 0 },
        { month: 'Jun', year: 2024, totalInvestment: 2700000, totalReturn: 3105000, roi: 15.0, profit: 405000, loss: 0 }
      ]
    };
  },

  async getAdminAnalytics(subCompanyId?: string): Promise<AdminAnalytics> {
    await delay(1000);
    return mockAdminAnalytics;
  },

  async getInvestorAnalytics(userId?: string): Promise<InvestorAnalytics> {
    await delay(800);
    return mockInvestorAnalytics;
  },

  // Activity logs
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    await delay(500);
    const activities: ActivityLog[] = [
      {
        id: '1',
        user_id: '2',
        action: 'create_investment',
        entity_type: 'investment',
        entity_id: 'inv1',
        description: 'Created new investment: TikTok Growth Fund',
        timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      },
      {
        id: '2',
        user_id: '3',
        action: 'invest',
        entity_type: 'investor_investment',
        entity_id: 'ii1',
        description: 'Invested $5,000 in TikTok Growth Fund',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
      }
    ];
    return limit ? activities.slice(0, limit) : activities;
  },

  // Market data
  async getMarketData(): Promise<any> {
    await delay(400);
    return {
      stockMarketIndex: 4721.32,
      stockMarketChange: 1.2,
      cryptoMarketIndex: 2843.18,
      cryptoMarketChange: -2.8,
      realEstateIndex: 1843.67,
      realEstateChange: 0.5
    };
  }
};
