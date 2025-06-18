import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { mockApiService } from './mockApi';
import {
  ApiResponse,
  LoginResponse,
  User,
  UserWithRole,
  SubCompany,
  SubCompanyWithDetails,
  Investment,
  InvestmentWithDetails,
  InvestorInvestment,
  InvestorInvestmentWithDetails,
  Asset,
  ProfitLoss,
  SuperadminAnalytics,
  AdminAnalytics,
  InvestorAnalytics,
  CreateSubCompanyForm,
  CreateInvestmentForm,
  InvestForm,
  InvestmentFilters,
  UserFilters,
  ActivityLog
} from '../types/database';

// Use real API instead of mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' && false; // Force real API

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Hardcode baseURL to ensure correct API endpoint
    this.baseURL = 'http://localhost:3001/api';
    
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
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
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

    await this.api.get(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
  }

  async resendVerification(email: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.resendVerification(email);
    }

    await this.api.post('/api/auth/resend-verification', { email });
  }

  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.forgotPassword(email);
    }

    await this.api.post('/api/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    if (USE_MOCK_API) {
      return mockApiService.resetPassword(token, password);
    }

    await this.api.post('/api/auth/reset-password', { token, password });
  }

  // User management endpoints
  async getUsers(filters?: UserFilters): Promise<UserWithRole[]> {
    if (USE_MOCK_API) {
      return mockApiService.getUsers(filters);
    }

    const response: AxiosResponse<ApiResponse<UserWithRole[]>> = await this.api.get('/api/users', {
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

    const response: AxiosResponse<ApiResponse<SubCompanyWithDetails[]>> = await this.api.get('/api/companies/sub');
    return response.data.data!;
  }

  async getSubCompanyById(id: string): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<SubCompanyWithDetails>> = await this.api.get(`/companies/sub/${id}`);
    return response.data.data!;
  }

  async createSubCompany(companyData: CreateSubCompanyForm): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<SubCompanyWithDetails>> = await this.api.post('/companies/sub', companyData);
    return response.data.data!;
  }

  async updateSubCompany(id: string, companyData: Partial<SubCompany>): Promise<SubCompanyWithDetails> {
    const response: AxiosResponse<ApiResponse<SubCompanyWithDetails>> = await this.api.put(`/companies/sub/${id}`, companyData);
    return response.data.data!;
  }

  async deleteSubCompany(id: string): Promise<void> {
    await this.api.delete(`/companies/sub/${id}`);
  }

  // Investment management endpoints
  async getInvestments(filters?: InvestmentFilters): Promise<InvestmentWithDetails[]> {
    if (USE_MOCK_API) {
      return mockApiService.getInvestments(filters);
    }

    const response: AxiosResponse<ApiResponse<InvestmentWithDetails[]>> = await this.api.get('/investments', {
      params: filters,
    });
    return response.data.data!;
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
    const response: AxiosResponse<ApiResponse<Asset[]>> = await this.api.get('/assets');
    return response.data.data!;
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

    const response: AxiosResponse<ApiResponse<SuperadminAnalytics>> = await this.api.get('/api/analytics/superadmin');
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

  async getInvestorAnalytics(userId?: string): Promise<InvestorAnalytics> {
    if (USE_MOCK_API) {
      return mockApiService.getInvestorAnalytics(userId);
    }

    const response: AxiosResponse<ApiResponse<InvestorAnalytics>> = await this.api.get('/analytics/investor', {
      params: { userId },
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

  // Activity logs
  async getActivityLogs(limit?: number): Promise<ActivityLog[]> {
    if (USE_MOCK_API) {
      return mockApiService.getActivityLogs(limit);
    }

    const response: AxiosResponse<ApiResponse<ActivityLog[]>> = await this.api.get('/activity-logs', {
      params: { limit },
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
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
