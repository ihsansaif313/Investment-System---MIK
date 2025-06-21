import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mockApiService } from './mockApi';
import {
  ApiResponse,
  LoginResponse,
  User,
  UserWithRole,
  UserRole,
  SubCompany,
  SubCompanyWithDetails,
  Investment,
  InvestmentWithDetails,
  InvestorInvestment,
  InvestorInvestmentWithDetails,
  Asset,
  AssetType,
  ProfitLoss,
  SuperadminAnalytics,
  AdminAnalytics,
  InvestorAnalytics,
  SalesmanAnalytics,
  CreateSubCompanyForm,
  CreateInvestmentForm,
  CreateInvestorForm,
  InvestForm,
  InvestmentFilters,
  UserFilters,
  ActivityLog
} from '../types/database';

// Use real API instead of mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' && false; // Force real API

// Data transformation functions
const transformSubCompany = (apiCompany: any): SubCompanyWithDetails => {
  return {
    id: apiCompany._id,
    owner_company_id: apiCompany.ownerCompanyId?._id || apiCompany.ownerCompanyId,
    name: apiCompany.name || 'Unknown Company',
    industry: apiCompany.industry || 'Unknown',
    category: apiCompany.category || 'General',
    description: apiCompany.description || '',
    address: apiCompany.address || '',
    contact_email: apiCompany.contactEmail || '',
    phone: apiCompany.contactPhone || '',

    logo: apiCompany.logo || '',
    established_date: apiCompany.establishedDate ? new Date(apiCompany.establishedDate) : new Date(),
    status: apiCompany.status || 'active',
    created_at: apiCompany.createdAt ? new Date(apiCompany.createdAt) : new Date(),
    updated_at: apiCompany.updatedAt ? new Date(apiCompany.updatedAt) : new Date(),
    ownerCompany: apiCompany.ownerCompanyId || { id: '', name: '', address: '', contact_email: '', established_date: new Date(), created_at: new Date(), updated_at: new Date() },
    admin: apiCompany.adminUserId ? {
      id: apiCompany.adminUserId._id || apiCompany.adminUserId,
      email: apiCompany.adminUserId.email || '',
      firstName: apiCompany.adminUserId.firstName || '',
      lastName: apiCompany.adminUserId.lastName || '',
      role: { id: '', user_id: '', type: 'admin' as UserRole, status: 'active', permissions: [], created_at: new Date() },
      created_at: new Date(),
      updated_at: new Date()
    } : undefined,
    totalInvestments: 0,
    totalInvestors: 0,
    totalValue: 0,
    profitLoss: {
      profit: 0,
      loss: 0,
      roi: 0
    }
  };
};

const transformAsset = (apiAsset: any): Asset => {
  return {
    id: apiAsset._id,
    name: apiAsset.name || 'Unknown Asset',
    type: apiAsset.type || 'equity',
    description: apiAsset.description || '',
    sector: apiAsset.category || 'General',
    logo: apiAsset.logo || '',
    created_at: apiAsset.createdAt ? new Date(apiAsset.createdAt) : new Date(),
    updated_at: apiAsset.updatedAt ? new Date(apiAsset.updatedAt) : new Date()
  };
};

const transformInvestment = (apiInvestment: any): InvestmentWithDetails => {
  return {
    id: apiInvestment._id,
    sub_company_id: apiInvestment.subCompanyId?._id || apiInvestment.subCompanyId,
    asset_id: apiInvestment.assetId?._id || apiInvestment.assetId,
    name: apiInvestment.name || 'Unknown Investment',
    description: apiInvestment.description || '',
    initial_amount: apiInvestment.initialAmount || 0,
    current_value: apiInvestment.currentValue || 0,
    target_amount: apiInvestment.targetAmount || 0,
    min_investment: apiInvestment.minInvestment || 0,
    max_investment: apiInvestment.maxInvestment || 0,
    expected_roi: apiInvestment.expectedROI || 0,
    start_date: apiInvestment.startDate ? new Date(apiInvestment.startDate) : new Date(),
    end_date: apiInvestment.endDate ? new Date(apiInvestment.endDate) : undefined,
    status: apiInvestment.status || 'Active',
    risk_level: apiInvestment.riskLevel || 'Medium',
    terms_conditions: apiInvestment.termsConditions || '',
    created_at: apiInvestment.createdAt ? new Date(apiInvestment.createdAt) : new Date(),
    updated_at: apiInvestment.updatedAt ? new Date(apiInvestment.updatedAt) : new Date(),
    asset: apiInvestment.assetId ? transformAsset(apiInvestment.assetId) : {
      id: '',
      name: 'Unknown Asset',
      type: 'Stock' as AssetType,
      description: '',
      sector: 'General',
      created_at: new Date(),
      updated_at: new Date()
    },
    subCompany: apiInvestment.subCompanyId ? transformSubCompany(apiInvestment.subCompanyId) : {
      id: '',
      owner_company_id: '',
      name: 'Unknown Company',
      industry: 'Unknown',
      category: 'General',
      description: '',
      address: '',
      contact_email: '',
      phone: '',
      logo: '',
      established_date: new Date(),
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
      ownerCompany: { id: '', name: '', address: '', contact_email: '', established_date: new Date(), created_at: new Date(), updated_at: new Date() },
      totalInvestments: 0,
      totalInvestors: 0,
      totalValue: 0,
      profitLoss: { profit: 0, loss: 0, roi: 0 }
    },
    investorInvestments: [],
    profitLossRecords: [],
    totalInvested: apiInvestment.performanceMetrics?.totalInvested || 0,
    totalInvestors: apiInvestment.performanceMetrics?.totalInvestors || 0,
    currentROI: apiInvestment.actualROI || 0
  };
};

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Use environment variable for API URL to support network access
    // Updated to use correct backend port
    this.baseURL = 'http://localhost:3001/api';
    console.log('API Service initialized with baseURL:', this.baseURL);
    console.log('Environment variables:', import.meta.env);
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        // List of endpoints that don't require authentication
        const publicEndpoints = [
          '/auth/login',
          '/auth/register',
          '/auth/verify-email',
          '/auth/forgot-password',
          '/auth/reset-password',
          '/auth/resend-verification'
        ];

        const isPublicEndpoint = publicEndpoints.some(endpoint =>
          config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
          const token = localStorage.getItem('authToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          } else {
            // Clear user data if no token found for protected endpoints
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
            window.location.href = '/login';
            return Promise.reject(new Error('No authentication token found'));
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.api.post('/auth/refresh', { refreshToken });
              const newToken = response.data.data.token;
              const newRefreshToken = response.data.data.refreshToken;

              // Update stored tokens
              localStorage.setItem('authToken', newToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              localStorage.setItem('authUser', JSON.stringify(response.data.data.user));

              // Update the authorization header and retry the original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        // If it's a 401 and we already tried to refresh, or no refresh token available
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authUser');
          window.location.href = '/login';
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    if (USE_MOCK_API) {
      return mockApiService.login(email, password);
    }
    // Use correct path (with /api prefix)
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data.data!;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  }

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
    if (USE_MOCK_API) {
      return mockApiService.register(userData);
    }
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/auth/register', userData);
    return response.data.data!;
  }

  async verifyEmail(token: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.verifyEmail(token);
    }

    await this.api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  async resendVerification(email: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.resendVerification(email);
    }

    await this.api.post('/auth/resend-verification', { email });
  }

  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.forgotPassword(email);
    }

    await this.api.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.resetPassword(token, password);
    }

    await this.api.post('/auth/reset-password', { token, password });
  }

  // User management endpoints
  async getUsers(filters?: UserFilters): Promise<UserWithRole[]> {
    if (USE_MOCK_API) {
      return mockApiService.getUsers(filters);
    }

    const response: AxiosResponse<ApiResponse<UserWithRole[]>> = await this.api.get('/users', {
      params: filters,
    });
    return response.data.data!;
  }

  async getUserById(id: string): Promise<UserWithRole> {
    const response: AxiosResponse<ApiResponse<UserWithRole>> = await this.api.get(`/users/${id}`);
    return response.data.data!;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<UserWithRole> {
    const response: AxiosResponse<ApiResponse<UserWithRole>> = await this.api.put(`/users/${id}`, userData);
    return response.data.data!;
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    await this.api.patch(`/users/${userId}/status`, { status });
  }

  // Company management endpoints
  async getOwnerCompany(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/companies/owner');
    return response.data.data!;
  }

  async getSubCompanies(): Promise<SubCompanyWithDetails[]> {
    if (USE_MOCK_API) {
      return mockApiService.getSubCompanies();
    }

    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/companies');
    const apiCompanies = response.data.data!;
    return apiCompanies.map(transformSubCompany);
  }
  
  async getSubCompanyById(id: string): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/companies/sub/${id}`);
    return transformSubCompany(response.data.data!);
  }

  async createSubCompany(companyData: CreateSubCompanyForm): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/companies/sub', companyData);
    return transformSubCompany(response.data.data!);
  }

  async updateSubCompany(id: string, companyData: Partial<SubCompany>): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.put(`/companies/sub/${id}`, companyData);
    return transformSubCompany(response.data.data!);
  }
  
  async deleteSubCompany(id: string): Promise<void> {
    await this.api.delete(`/companies/sub/${id}`);
  }
  
  // Investment management endpoints
  async getInvestments(filters?: InvestmentFilters): Promise<InvestmentWithDetails[]> {
    if (USE_MOCK_API) {
      return mockApiService.getInvestments(filters);
    }

    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/investments', {
      params: filters,
    });

    // Transform the raw API data to match frontend interfaces
    return response.data.data?.map(transformInvestment) || [];
  }

  async getInvestmentById(id: string): Promise<InvestmentWithDetails> {
    const response: AxiosResponse<ApiResponse<InvestmentWithDetails>> = await this.api.get(`/investments/${id}`);
    return response.data.data!;
  }

  async createInvestment(investmentData: CreateInvestmentForm): Promise<InvestmentWithDetails> {
    const response: AxiosResponse<ApiResponse<InvestmentWithDetails>> = await this.api.post('/investments', investmentData);
    return response.data.data!;
  }

  async updateInvestment(id: string, investmentData: Partial<Investment>): Promise<InvestmentWithDetails> {
    const response: AxiosResponse<ApiResponse<InvestmentWithDetails>> = await this.api.put(`/investments/${id}`, investmentData);
    return response.data.data!;
  }

  async deleteInvestment(id: string): Promise<void> {
    await this.api.delete(`/investments/${id}`);
  }

  // Daily performance management endpoints
  async addDailyPerformance(investmentId: string, performanceData: {
    marketValue: number;
    notes?: string;
    marketConditions?: string;
    date?: string;
  }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(`/investments/${investmentId}/performance`, performanceData);
    return response.data.data!;
  }

  async getPerformanceHistory(investmentId: string, params?: {
    days?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    performance: any[];
    summary: any;
    pagination: any;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/investments/${investmentId}/performance`, {
      params
    });
    return response.data.data!;
  }

  // Investor investment endpoints
  async getInvestorInvestments(userId?: string): Promise<InvestorInvestmentWithDetails[]> {
    const response: AxiosResponse<ApiResponse<InvestorInvestmentWithDetails[]>> = await this.api.get('/investor-investments', {
      params: { userId },
    });
    return response.data.data!;
  }

  async createInvestorInvestment(investmentData: InvestForm): Promise<InvestorInvestmentWithDetails> {
    const response: AxiosResponse<ApiResponse<InvestorInvestmentWithDetails>> = await this.api.post('/investor-investments', investmentData);
    return response.data.data!;
  }

  async withdrawInvestment(id: string): Promise<void> {
    await this.api.patch(`/investor-investments/${id}/withdraw`);
  }

  // Asset management endpoints
  async getAssets(): Promise<Asset[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/assets');
    return response.data.data?.map(transformAsset) || [];
  }

  async getAssetById(id: string): Promise<Asset> {
    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.get(`/assets/${id}`);
    return response.data.data!;
  }

  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    const response: AxiosResponse<ApiResponse<Asset>> = await this.api.post('/assets', assetData);
    return response.data.data!;
  }

  // Analytics endpoints
  async getSuperadminAnalytics(): Promise<SuperadminAnalytics> {
    if (USE_MOCK_API) {
      return mockApiService.getSuperadminAnalytics();
    }

    const response: AxiosResponse<ApiResponse<SuperadminAnalytics>> = await this.api.get('/analytics/superadmin');
    return response.data.data!;
  }

  async getAdminAnalytics(subCompanyId?: string): Promise<AdminAnalytics> {
    if (USE_MOCK_API) {
      return mockApiService.getAdminAnalytics(subCompanyId);
    }

    const response: AxiosResponse<ApiResponse<AdminAnalytics>> = await this.api.get('/analytics/admin', {
      params: { subCompanyId },
    });
    return response.data.data!;
  }

  async getSalesmanAnalytics(): Promise<SalesmanAnalytics> {
    if (USE_MOCK_API) {
      return mockApiService.getSalesmanAnalytics();
    }

    const response: AxiosResponse<ApiResponse<SalesmanAnalytics>> = await this.api.get('/analytics/salesman');
    return response.data.data!;
  }

  async getInvestorAnalytics(userId?: string, subCompanyId?: string): Promise<InvestorAnalytics> {
    if (USE_MOCK_API) {
      return mockApiService.getInvestorAnalytics(userId);
    }

    const response: AxiosResponse<ApiResponse<InvestorAnalytics>> = await this.api.get('/analytics/investor', {
      params: { userId, subCompanyId },
    });
    return response.data.data!;
  }

  async getInvestorPerformanceHistory(userId?: string, subCompanyId?: string, months: number = 12): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/analytics/investor/performance-history', {
      params: { userId, subCompanyId, months },
    });
    return response.data.data!;
  }

  async getInvestorPortfolioSummary(userId?: string, subCompanyId?: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/analytics/investor/portfolio-summary', {
      params: { userId, subCompanyId },
    });
    return response.data.data!;
  }

  async getInvestorInvestmentComparison(userId?: string, subCompanyId?: string): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/analytics/investor/investment-comparison', {
      params: { userId, subCompanyId },
    });
    return response.data.data!;
  }

  async getInvestorRiskAnalysis(userId?: string, subCompanyId?: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/analytics/investor/risk-analysis', {
      params: { userId, subCompanyId },
    });
    return response.data.data!;
  }

  async getInvestorBenchmarkComparison(userId?: string, subCompanyId?: string): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/analytics/investor/benchmark-comparison', {
      params: { userId, subCompanyId },
    });
    return response.data.data!;
  }

  // Profit/Loss tracking endpoints
  async getProfitLossRecords(investmentId?: string, investorInvestmentId?: string): Promise<ProfitLoss[]> {
    if (USE_MOCK_API) {
      // Return empty array for now - can be enhanced later
      return [];
    }

    const response: AxiosResponse<ApiResponse<ProfitLoss[]>> = await this.api.get('/profit-loss', {
      params: { investmentId, investorInvestmentId },
    });
    return response.data.data!;
  }



  // Market data endpoints
  async getMarketData(): Promise<any> {
    if (USE_MOCK_API) {
      return mockApiService.getMarketData();
    }

    const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/market-data');
    return response.data.data!;
  }

  // Admin management endpoints
  async getPendingAdmins(): Promise<UserWithRole[]> {
    const response: AxiosResponse<ApiResponse<UserWithRole[]>> = await this.api.get('/admin-management/pending');
    return response.data.data!;
  }

  async getApprovedAdmins(): Promise<UserWithRole[]> {
    const response: AxiosResponse<ApiResponse<UserWithRole[]>> = await this.api.get('/admin-management/approved');
    return response.data.data!;
  }

  async approveAdmin(userId: string): Promise<void> {
    await this.api.post(`/admin-management/approve/${userId}`);
  }

  async rejectAdmin(userId: string, reason?: string): Promise<void> {
    await this.api.post(`/admin-management/reject/${userId}`, { reason });
  }

  async getAdminStatus(userId: string): Promise<{ status: string; notes?: string }> {
    const response: AxiosResponse<ApiResponse<{ status: string; notes?: string }>> = await this.api.get(`/admin-management/status/${userId}`);
    return response.data.data!;
  }

  // Company assignment endpoints
  async getCompanyAssignments(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get('/company-assignments');
    return response.data.data!;
  }

  async createCompanyAssignment(data: { userId: string; subCompanyId: string }): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/company-assignments', data);
    return response.data.data!;
  }

  async removeCompanyAssignment(assignmentId: string): Promise<void> {
    await this.api.delete(`/company-assignments/${assignmentId}`);
  }

  // Activity log endpoints
  async getActivityLogs(options: {
    limit?: number;
    userId?: string;
    entityType?: string;
    entityId?: string;
    actions?: string[];
    startDate?: string;
    endDate?: string;
  } = {}): Promise<ActivityLog[]> {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.userId) params.append('userId', options.userId);
    if (options.entityType) params.append('entityType', options.entityType);
    if (options.entityId) params.append('entityId', options.entityId);
    if (options.actions) params.append('actions', options.actions.join(','));
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const response: AxiosResponse<ApiResponse<ActivityLog[]>> = await this.api.get(`/activity-logs?${params}`);
    return response.data.data!;
  }

  async getEntityActivityLogs(entityType: string, entityId: string, limit: number = 10): Promise<ActivityLog[]> {
    const response: AxiosResponse<ApiResponse<ActivityLog[]>> = await this.api.get(`/activity-logs/entity/${entityType}/${entityId}?limit=${limit}`);
    return response.data.data!;
  }

  async getUserActivityLogs(userId: string, limit: number = 10): Promise<ActivityLog[]> {
    const response: AxiosResponse<ApiResponse<ActivityLog[]>> = await this.api.get(`/activity-logs/user/${userId}?limit=${limit}`);
    return response.data.data!;
  }

  async createActivityLog(data: {
    action: string;
    entityType: string;
    entityId?: string;
    description: string;
    metadata?: any;
  }): Promise<ActivityLog> {
    const response: AxiosResponse<ApiResponse<ActivityLog>> = await this.api.post('/activity-logs', data);
    return response.data.data!;
  }

  // File upload endpoints
  async uploadFile(file: File, type: 'avatar' | 'logo' | 'document'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response: AxiosResponse<ApiResponse<{ url: string }>> = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data!.url;
  }

  // Investor management endpoints
  async createInvestor(investorData: CreateInvestorForm & { companyId: string }): Promise<UserWithRole> {
    const response: AxiosResponse<ApiResponse<UserWithRole>> = await this.api.post('/investor-management', investorData);
    return response.data.data!;
  }

  async getInvestors(companyId: string): Promise<UserWithRole[]> {
    const response: AxiosResponse<ApiResponse<UserWithRole[]>> = await this.api.get(`/investor-management/company/${companyId}`);
    return response.data.data!;
  }

  async getInvestorById(id: string): Promise<UserWithRole> {
    const response: AxiosResponse<ApiResponse<UserWithRole>> = await this.api.get(`/investor-management/${id}`);
    return response.data.data!;
  }

  async setupInvestorPassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.api.post('/investor-management/setup-password', {
      email,
      currentPassword,
      newPassword
    });
  }

  async setupPassword(newPassword: string, confirmPassword: string, token: string): Promise<LoginResponse> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await this.api.post('/auth/setup-password', {
      newPassword,
      confirmPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data.data!;
  }

  async forgotInvestorPassword(email: string): Promise<void> {
    await this.api.post('/investor-management/forgot-password', { email });
  }

  async resetInvestorPassword(token: string, newPassword: string): Promise<void> {
    await this.api.post('/investor-management/reset-password', {
      token,
      newPassword
    });
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
