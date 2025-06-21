import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import {
  UserWithRole,
  SubCompanyWithDetails,
  InvestmentWithDetails,
  InvestorInvestmentWithDetails,
  Asset,
  SuperadminAnalytics,
  AdminAnalytics,
  InvestorAnalytics,
  SalesmanAnalytics,
  ActivityLog,
  ProfitLoss,
  CreateSubCompanyForm,
  CreateInvestmentForm,
  InvestForm,
  InvestmentFilters,
  UserFilters,
  CalculatedMetrics,
  PerformanceTrend,
  InvestmentStatusDistribution,
  RealTimeUpdate
} from '../types/database';
import { validateDataConsistency, synchronizeDataAcrossRoles, CrossPlatformData } from '../utils/dataConsistency';
import { useRealTimeUpdates, AutoRefresh } from '../utils/realTimeUpdates';

// State interface
interface DataState {
  // Loading states
  loading: {
    users: boolean;
    companies: boolean;
    investments: boolean;
    analytics: boolean;
    assets: boolean;
    general: boolean;
  };
  
  // Error states
  errors: {
    users: string | null;
    companies: string | null;
    investments: string | null;
    analytics: string | null;
    assets: string | null;
    general: string | null;
  };

  // Data
  users: UserWithRole[];
  subCompanies: SubCompanyWithDetails[];
  investments: InvestmentWithDetails[];
  investorInvestments: InvestorInvestmentWithDetails[];
  assets: Asset[];
  analytics: {
    superadmin: SuperadminAnalytics | null;
    admin: AdminAnalytics | null;
    investor: InvestorAnalytics | null;
    salesman: SalesmanAnalytics | null;
  };
  activityLogs: ActivityLog[];
  profitLossRecords: ProfitLoss[];
  marketData: any;

  // Cache timestamps
  lastFetch: {
    users: number | null;
    companies: number | null;
    investments: number | null;
    analytics: number | null;
    assets: number | null;
  };
}

// Action types
type DataAction =
  | { type: 'SET_LOADING'; payload: { key: keyof DataState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof DataState['errors']; value: string | null } }
  | { type: 'SET_USERS'; payload: UserWithRole[] }
  | { type: 'SET_SUB_COMPANIES'; payload: SubCompanyWithDetails[] }
  | { type: 'SET_INVESTMENTS'; payload: InvestmentWithDetails[] }
  | { type: 'SET_INVESTOR_INVESTMENTS'; payload: InvestorInvestmentWithDetails[] }
  | { type: 'SET_ASSETS'; payload: Asset[] }
  | { type: 'SET_SUPERADMIN_ANALYTICS'; payload: SuperadminAnalytics }
  | { type: 'SET_ADMIN_ANALYTICS'; payload: AdminAnalytics }
  | { type: 'SET_INVESTOR_ANALYTICS'; payload: InvestorAnalytics }
  | { type: 'SET_SALESMAN_ANALYTICS'; payload: SalesmanAnalytics }
  | { type: 'SET_ACTIVITY_LOGS'; payload: ActivityLog[] }
  | { type: 'SET_PROFIT_LOSS_RECORDS'; payload: ProfitLoss[] }
  | { type: 'SET_MARKET_DATA'; payload: any }
  | { type: 'UPDATE_USER'; payload: UserWithRole }
  | { type: 'UPDATE_SUB_COMPANY'; payload: SubCompanyWithDetails }
  | { type: 'UPDATE_INVESTMENT'; payload: InvestmentWithDetails }
  | { type: 'ADD_SUB_COMPANY'; payload: SubCompanyWithDetails }
  | { type: 'ADD_INVESTMENT'; payload: InvestmentWithDetails }
  | { type: 'ADD_INVESTOR_INVESTMENT'; payload: InvestorInvestmentWithDetails }
  | { type: 'REMOVE_SUB_COMPANY'; payload: string }
  | { type: 'REMOVE_INVESTMENT'; payload: string }
  | { type: 'SET_LAST_FETCH'; payload: { key: keyof DataState['lastFetch']; value: number } };

// Initial state
const initialState: DataState = {
  loading: {
    users: false,
    companies: false,
    investments: false,
    analytics: false,
    assets: false,
    general: false,
  },
  errors: {
    users: null,
    companies: null,
    investments: null,
    analytics: null,
    assets: null,
    general: null,
  },
  users: [],
  subCompanies: [],
  investments: [],
  investorInvestments: [],
  assets: [],
  analytics: {
    superadmin: null,
    admin: null,
    investor: null,
    salesman: null,
  },
  activityLogs: [],
  profitLossRecords: [],
  marketData: null,
  lastFetch: {
    users: null,
    companies: null,
    investments: null,
    analytics: null,
    assets: null,
  },
};

// Reducer
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value },
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_SUB_COMPANIES':
      return { ...state, subCompanies: action.payload };
    case 'SET_INVESTMENTS':
      return { ...state, investments: action.payload };
    case 'SET_INVESTOR_INVESTMENTS':
      return { ...state, investorInvestments: action.payload };
    case 'SET_ASSETS':
      return { ...state, assets: action.payload };
    case 'SET_SUPERADMIN_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, superadmin: action.payload },
      };
    case 'SET_ADMIN_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, admin: action.payload },
      };
    case 'SET_INVESTOR_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, investor: action.payload },
      };
    case 'SET_SALESMAN_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, salesman: action.payload },
      };
    case 'SET_ACTIVITY_LOGS':
      return { ...state, activityLogs: action.payload };
    case 'SET_PROFIT_LOSS_RECORDS':
      return { ...state, profitLossRecords: action.payload };
    case 'SET_MARKET_DATA':
      return { ...state, marketData: action.payload };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'UPDATE_SUB_COMPANY':
      return {
        ...state,
        subCompanies: state.subCompanies.map(company =>
          company.id === action.payload.id ? action.payload : company
        ),
      };
    case 'UPDATE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.map(investment =>
          investment.id === action.payload.id ? action.payload : investment
        ),
      };
    case 'ADD_SUB_COMPANY':
      return {
        ...state,
        subCompanies: [...state.subCompanies, action.payload],
      };
    case 'ADD_INVESTMENT':
      return {
        ...state,
        investments: [...state.investments, action.payload],
      };
    case 'ADD_INVESTOR_INVESTMENT':
      return {
        ...state,
        investorInvestments: [...state.investorInvestments, action.payload],
      };
    case 'REMOVE_SUB_COMPANY':
      return {
        ...state,
        subCompanies: state.subCompanies.filter(company => company.id !== action.payload),
      };
    case 'REMOVE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.filter(investment => investment.id !== action.payload),
      };
    case 'SET_LAST_FETCH':
      return {
        ...state,
        lastFetch: { ...state.lastFetch, [action.payload.key]: action.payload.value },
      };
    default:
      return state;
  }
}

// Context interface
interface DataContextType {
  state: DataState;
  
  // User management
  fetchUsers: (filters?: UserFilters, forceRefresh?: boolean) => Promise<void>;
  updateUserStatus: (userId: string, status: string) => Promise<void>;
  
  // Company management
  fetchSubCompanies: (forceRefresh?: boolean) => Promise<void>;
  getSubCompanyById: (id: string) => SubCompanyWithDetails | undefined;
  createSubCompany: (data: CreateSubCompanyForm) => Promise<SubCompanyWithDetails>;
  updateSubCompany: (id: string, data: Partial<SubCompanyWithDetails>) => Promise<void>;
  deleteSubCompany: (id: string) => Promise<void>;
  
  // Investment management
  fetchInvestments: (filters?: InvestmentFilters, forceRefresh?: boolean) => Promise<void>;
  getInvestmentById: (id: string) => InvestmentWithDetails | undefined;
  createInvestment: (data: CreateInvestmentForm) => Promise<InvestmentWithDetails>;
  updateInvestment: (id: string, data: Partial<InvestmentWithDetails>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;

  // Daily performance management
  addDailyPerformance: (investmentId: string, performanceData: {
    marketValue: number;
    notes?: string;
    marketConditions?: string;
    date?: string;
  }) => Promise<any>;
  getPerformanceHistory: (investmentId: string, params?: {
    days?: number;
    page?: number;
    limit?: number;
  }) => Promise<{
    performance: any[];
    summary: any;
    pagination: any;
  }>;
  
  // Investor investment management
  fetchInvestorInvestments: (userId?: string, forceRefresh?: boolean) => Promise<void>;
  createInvestorInvestment: (data: InvestForm) => Promise<InvestorInvestmentWithDetails>;
  withdrawInvestment: (id: string) => Promise<void>;
  
  // Asset management
  fetchAssets: (forceRefresh?: boolean) => Promise<void>;
  getAssetById: (id: string) => Asset | undefined;
  
  // Analytics
  fetchSuperadminAnalytics: (forceRefresh?: boolean) => Promise<void>;
  fetchAdminAnalytics: (subCompanyId?: string, forceRefresh?: boolean) => Promise<void>;
  fetchInvestorAnalytics: (userId?: string, forceRefresh?: boolean, subCompanyId?: string) => Promise<void>;
  fetchSalesmanAnalytics: (forceRefresh?: boolean) => Promise<void>;
  
  // Activity logs
  fetchActivityLogs: (limit?: number) => Promise<void>;
  
  // Profit/Loss records
  fetchProfitLossRecords: (investmentId?: string, investorInvestmentId?: string) => Promise<void>;
  
  // Market data
  fetchMarketData: () => Promise<void>;
  
  // Utility functions
  clearError: (key: keyof DataState['errors']) => void;
  clearAllErrors: () => void;
  isDataStale: (key: keyof DataState['lastFetch'], maxAge?: number) => boolean;

  // Real-time calculation functions
  calculateMetrics: (subCompanyId?: string) => CalculatedMetrics;
  calculatePerformanceTrend: (subCompanyId?: string, period?: 'month' | 'quarter' | 'year') => PerformanceTrend[];
  calculateInvestmentStatusDistribution: (subCompanyId?: string) => InvestmentStatusDistribution[];
  calculatePortfolioDistribution: (userId?: string) => any[];
  calculateROI: (investmentId: string) => number;
  calculateTotalValue: (subCompanyId?: string) => number;

  // Data consistency functions
  validateDataConsistency: () => { isConsistent: boolean; errors: string[]; warnings: string[] };
  synchronizeData: () => void;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Helper function to handle API calls with loading and error states
  const handleApiCall = async <T,>(
    apiCall: () => Promise<T>,
    loadingKey: keyof DataState['loading'],
    errorKey: keyof DataState['errors']
  ): Promise<T | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: { key: loadingKey, value: true } });
      dispatch({ type: 'SET_ERROR', payload: { key: errorKey, value: null } });
      
      const result = await apiCall();
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: { key: errorKey, value: errorMessage } });
      console.error(`API Error (${errorKey}):`, error);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: loadingKey, value: false } });
    }
  };

  // Check if data is stale
  const isDataStale = (key: keyof DataState['lastFetch'], maxAge: number = CACHE_DURATION): boolean => {
    const lastFetch = state.lastFetch[key];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > maxAge;
  };

  // User management functions
  const fetchUsers = async (filters?: UserFilters, forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('users')) return;

    const users = await handleApiCall(
      () => apiService.getUsers(filters),
      'users',
      'users'
    );

    if (users) {
      dispatch({ type: 'SET_USERS', payload: users });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'users', value: Date.now() } });
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    await handleApiCall(
      () => apiService.updateUserStatus(userId, status),
      'users',
      'users'
    );
    // Refresh users after update
    await fetchUsers(undefined, true);
  };

  // Company management functions
  const fetchSubCompanies = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('companies')) return;

    const companies = await handleApiCall(
      () => apiService.getSubCompanies(),
      'companies',
      'companies'
    );

    if (companies) {
      dispatch({ type: 'SET_SUB_COMPANIES', payload: companies });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'companies', value: Date.now() } });
    }
  };

  const getSubCompanyById = (id: string): SubCompanyWithDetails | undefined => {
    return state.subCompanies.find(company => company.id === id);
  };

  const createSubCompany = async (data: CreateSubCompanyForm): Promise<SubCompanyWithDetails> => {
    const company = await handleApiCall(
      () => apiService.createSubCompany(data),
      'companies',
      'companies'
    );

    if (company) {
      dispatch({ type: 'ADD_SUB_COMPANY', payload: company });
      return company;
    }
    throw new Error('Failed to create sub-company');
  };

  const updateSubCompany = async (id: string, data: Partial<SubCompanyWithDetails>) => {
    const updatedCompany = await handleApiCall(
      () => apiService.updateSubCompany(id, data),
      'companies',
      'companies'
    );

    if (updatedCompany) {
      dispatch({ type: 'UPDATE_SUB_COMPANY', payload: updatedCompany });
    }
  };

  const deleteSubCompany = async (id: string) => {
    await handleApiCall(
      () => apiService.deleteSubCompany(id),
      'companies',
      'companies'
    );
    dispatch({ type: 'REMOVE_SUB_COMPANY', payload: id });
  };

  // Investment management functions
  const fetchInvestments = async (filters?: InvestmentFilters, forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('investments')) return;

    const investments = await handleApiCall(
      () => apiService.getInvestments(filters),
      'investments',
      'investments'
    );

    if (investments) {
      dispatch({ type: 'SET_INVESTMENTS', payload: investments });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'investments', value: Date.now() } });
    }
  };

  const getInvestmentById = (id: string): InvestmentWithDetails | undefined => {
    return state.investments.find(investment => investment.id === id);
  };

  const createInvestment = async (data: CreateInvestmentForm): Promise<InvestmentWithDetails> => {
    const investment = await handleApiCall(
      () => apiService.createInvestment(data),
      'investments',
      'investments'
    );

    if (investment) {
      dispatch({ type: 'ADD_INVESTMENT', payload: investment });
      return investment;
    }
    throw new Error('Failed to create investment');
  };

  const updateInvestment = async (id: string, data: Partial<InvestmentWithDetails>) => {
    const updatedInvestment = await handleApiCall(
      () => apiService.updateInvestment(id, data),
      'investments',
      'investments'
    );

    if (updatedInvestment) {
      dispatch({ type: 'UPDATE_INVESTMENT', payload: updatedInvestment });
    }
  };

  const deleteInvestment = async (id: string) => {
    await handleApiCall(
      () => apiService.deleteInvestment(id),
      'investments',
      'investments'
    );
    dispatch({ type: 'REMOVE_INVESTMENT', payload: id });
  };

  // Daily performance management functions
  const addDailyPerformance = async (investmentId: string, performanceData: {
    marketValue: number;
    notes?: string;
    marketConditions?: string;
    date?: string;
  }) => {
    const result = await handleApiCall(
      () => apiService.addDailyPerformance(investmentId, performanceData),
      'investments',
      'investments'
    );

    if (result) {
      // Refresh investments to get updated performance data
      await fetchInvestments(undefined, true);
    }

    return result;
  };

  const getPerformanceHistory = async (investmentId: string, params?: {
    days?: number;
    page?: number;
    limit?: number;
  }) => {
    return await handleApiCall(
      () => apiService.getPerformanceHistory(investmentId, params),
      'investments',
      'investments'
    );
  };

  // Investor investment management functions
  const fetchInvestorInvestments = async (userId?: string, forceRefresh: boolean = false) => {
    const investorInvestments = await handleApiCall(
      () => apiService.getInvestorInvestments(userId),
      'investments',
      'investments'
    );

    if (investorInvestments) {
      dispatch({ type: 'SET_INVESTOR_INVESTMENTS', payload: investorInvestments });
    }
  };

  const createInvestorInvestment = async (data: InvestForm): Promise<InvestorInvestmentWithDetails> => {
    const investment = await handleApiCall(
      () => apiService.createInvestorInvestment(data),
      'investments',
      'investments'
    );

    if (investment) {
      dispatch({ type: 'ADD_INVESTOR_INVESTMENT', payload: investment });
      return investment;
    }
    throw new Error('Failed to create investor investment');
  };

  const withdrawInvestment = async (id: string) => {
    await handleApiCall(
      () => apiService.withdrawInvestment(id),
      'investments',
      'investments'
    );
    // Refresh investor investments after withdrawal
    await fetchInvestorInvestments(undefined, true);
  };

  // Asset management functions
  const fetchAssets = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('assets')) return;

    const assets = await handleApiCall(
      () => apiService.getAssets(),
      'assets',
      'assets'
    );

    if (assets) {
      dispatch({ type: 'SET_ASSETS', payload: assets });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'assets', value: Date.now() } });
    }
  };

  const getAssetById = (id: string): Asset | undefined => {
    return state.assets.find(asset => asset.id === id);
  };

  // Analytics functions
  const fetchSuperadminAnalytics = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('analytics')) return;

    const analytics = await handleApiCall(
      () => apiService.getSuperadminAnalytics(),
      'analytics',
      'analytics'
    );

    if (analytics) {
      dispatch({ type: 'SET_SUPERADMIN_ANALYTICS', payload: analytics });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'analytics', value: Date.now() } });
    }
  };

  const fetchAdminAnalytics = async (subCompanyId?: string, forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('analytics')) return;

    const analytics = await handleApiCall(
      () => apiService.getAdminAnalytics(subCompanyId),
      'analytics',
      'analytics'
    );

    if (analytics) {
      dispatch({ type: 'SET_ADMIN_ANALYTICS', payload: analytics });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'analytics', value: Date.now() } });
    }
  };

  const fetchInvestorAnalytics = async (userId?: string, forceRefresh: boolean = false, subCompanyId?: string) => {
    if (!forceRefresh && !isDataStale('analytics')) return;

    const analytics = await handleApiCall(
      () => apiService.getInvestorAnalytics(userId, subCompanyId),
      'analytics',
      'analytics'
    );

    if (analytics) {
      dispatch({ type: 'SET_INVESTOR_ANALYTICS', payload: analytics });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'analytics', value: Date.now() } });
    }
  };

  const fetchSalesmanAnalytics = async (forceRefresh: boolean = false) => {
    if (!forceRefresh && !isDataStale('analytics')) return;

    const analytics = await handleApiCall(
      () => apiService.getSalesmanAnalytics(),
      'analytics',
      'analytics'
    );

    if (analytics) {
      dispatch({ type: 'SET_SALESMAN_ANALYTICS', payload: analytics });
      dispatch({ type: 'SET_LAST_FETCH', payload: { key: 'analytics', value: Date.now() } });
    }
  };

  // Activity logs
  const fetchActivityLogs = async (limit?: number) => {
    const logs = await handleApiCall(
      () => apiService.getActivityLogs({ limit }),
      'general',
      'general'
    );

    if (logs) {
      dispatch({ type: 'SET_ACTIVITY_LOGS', payload: logs });
    }
  };

  // Profit/Loss records
  const fetchProfitLossRecords = async (investmentId?: string, investorInvestmentId?: string) => {
    const records = await handleApiCall(
      () => apiService.getProfitLossRecords(investmentId, investorInvestmentId),
      'general',
      'general'
    );

    if (records) {
      dispatch({ type: 'SET_PROFIT_LOSS_RECORDS', payload: records });
    }
  };

  // Market data
  const fetchMarketData = async () => {
    const marketData = await handleApiCall(
      () => apiService.getMarketData(),
      'general',
      'general'
    );

    if (marketData) {
      dispatch({ type: 'SET_MARKET_DATA', payload: marketData });
    }
  };

  // Utility functions
  const clearError = (key: keyof DataState['errors']) => {
    dispatch({ type: 'SET_ERROR', payload: { key, value: null } });
  };

  const clearAllErrors = () => {
    Object.keys(state.errors).forEach(key => {
      dispatch({ type: 'SET_ERROR', payload: { key: key as keyof DataState['errors'], value: null } });
    });
  };

  // Real-time calculation functions
  const calculateMetrics = (subCompanyId?: string): CalculatedMetrics => {
    const filteredInvestments = subCompanyId
      ? state.investments.filter(inv => inv.sub_company_id === subCompanyId)
      : state.investments;

    const filteredInvestorInvestments = state.investorInvestments.filter(ii =>
      filteredInvestments.some(inv => inv.id === ii.investment_id)
    );

    const totalValue = filteredInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalInvested = filteredInvestorInvestments.reduce((sum, ii) => sum + ii.amount_invested, 0);

    const profitLossRecords = state.profitLossRecords.filter(pl =>
      filteredInvestorInvestments.some(ii => ii.id === pl.investor_investment_id)
    );

    const totalProfit = profitLossRecords.reduce((sum, pl) => sum + (pl.profit_amount || 0), 0);
    const totalLoss = profitLossRecords.reduce((sum, pl) => sum + (pl.loss_amount || 0), 0);
    const netProfit = totalProfit - totalLoss;

    const roi = totalInvested > 0 ? (netProfit / totalInvested) * 100 : 0;

    const uniqueInvestors = new Set(filteredInvestorInvestments.map(ii => ii.user_id));

    return {
      totalValue,
      totalInvested,
      totalProfit,
      totalLoss,
      netProfit,
      roi,
      investmentCount: filteredInvestments.length,
      investorCount: uniqueInvestors.size,
      lastUpdated: new Date()
    };
  };

  const calculatePerformanceTrend = (subCompanyId?: string, period: 'month' | 'quarter' | 'year' = 'month'): PerformanceTrend[] => {
    const filteredInvestments = subCompanyId
      ? state.investments.filter(inv => inv.sub_company_id === subCompanyId)
      : state.investments;

    const filteredInvestorInvestments = state.investorInvestments.filter(ii =>
      filteredInvestments.some(inv => inv.id === ii.investment_id)
    );

    // Group by period
    const trends: { [key: string]: PerformanceTrend } = {};

    filteredInvestorInvestments.forEach(ii => {
      const date = new Date(ii.created_at);
      let periodKey: string;

      if (period === 'month') {
        periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'quarter') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        periodKey = `${date.getFullYear()}-Q${quarter}`;
      } else {
        periodKey = `${date.getFullYear()}`;
      }

      if (!trends[periodKey]) {
        trends[periodKey] = {
          period: periodKey,
          totalInvestment: 0,
          totalReturn: 0,
          netProfit: 0,
          roi: 0,
          investmentCount: 0
        };
      }

      trends[periodKey].totalInvestment += ii.amount_invested;
      trends[periodKey].investmentCount += 1;
    });

    // Calculate returns for each period
    Object.keys(trends).forEach(periodKey => {
      const trend = trends[periodKey];
      const profitLoss = state.profitLossRecords.filter(pl => {
        const plDate = new Date(pl.created_at);
        let plPeriodKey: string;

        if (period === 'month') {
          plPeriodKey = `${plDate.getFullYear()}-${String(plDate.getMonth() + 1).padStart(2, '0')}`;
        } else if (period === 'quarter') {
          const quarter = Math.floor(plDate.getMonth() / 3) + 1;
          plPeriodKey = `${plDate.getFullYear()}-Q${quarter}`;
        } else {
          plPeriodKey = `${plDate.getFullYear()}`;
        }

        return plPeriodKey === periodKey;
      });

      const totalProfit = profitLoss.reduce((sum, pl) => sum + (pl.profit_amount || 0), 0);
      const totalLoss = profitLoss.reduce((sum, pl) => sum + (pl.loss_amount || 0), 0);

      trend.totalReturn = totalProfit - totalLoss;
      trend.netProfit = trend.totalReturn;
      trend.roi = trend.totalInvestment > 0 ? (trend.netProfit / trend.totalInvestment) * 100 : 0;
    });

    return Object.values(trends).sort((a, b) => a.period.localeCompare(b.period));
  };

  const calculateInvestmentStatusDistribution = (subCompanyId?: string): InvestmentStatusDistribution[] => {
    const filteredInvestments = subCompanyId
      ? state.investments.filter(inv => inv.sub_company_id === subCompanyId)
      : state.investments;

    const statusGroups: { [key: string]: InvestmentStatusDistribution } = {};
    const totalValue = filteredInvestments.reduce((sum, inv) => sum + inv.current_value, 0);

    filteredInvestments.forEach(investment => {
      const status = investment.status;

      if (!statusGroups[status]) {
        statusGroups[status] = {
          status: status as any,
          count: 0,
          totalValue: 0,
          percentage: 0
        };
      }

      statusGroups[status].count += 1;
      statusGroups[status].totalValue += investment.current_value;
    });

    // Calculate percentages
    Object.values(statusGroups).forEach(group => {
      group.percentage = totalValue > 0 ? (group.totalValue / totalValue) * 100 : 0;
    });

    return Object.values(statusGroups);
  };

  const calculatePortfolioDistribution = (userId?: string) => {
    const filteredInvestorInvestments = userId
      ? state.investorInvestments.filter(ii => ii.user_id === userId)
      : state.investorInvestments;

    const assetGroups: { [key: string]: any } = {};
    const totalValue = filteredInvestorInvestments.reduce((sum, ii) => sum + ii.currentValue, 0);

    filteredInvestorInvestments.forEach(ii => {
      const investment = state.investments.find(inv => inv.id === ii.investment_id);
      const asset = investment ? state.assets.find(a => a.id === investment.asset_id) : null;
      const assetType = asset?.type || 'Unknown';

      if (!assetGroups[assetType]) {
        assetGroups[assetType] = {
          assetType,
          value: 0,
          percentage: 0,
          count: 0
        };
      }

      assetGroups[assetType].value += ii.currentValue;
      assetGroups[assetType].count += 1;
    });

    // Calculate percentages
    Object.values(assetGroups).forEach(group => {
      group.percentage = totalValue > 0 ? (group.value / totalValue) * 100 : 0;
    });

    return Object.values(assetGroups);
  };

  const calculateROI = (investmentId: string): number => {
    const investment = state.investments.find(inv => inv.id === investmentId);
    if (!investment) return 0;

    const initialValue = investment.initial_amount || investment.min_investment || 0;
    const currentValue = investment.current_value;

    if (initialValue <= 0) return 0;
    return ((currentValue - initialValue) / initialValue) * 100;
  };

  const calculateTotalValue = (subCompanyId?: string): number => {
    const filteredInvestments = subCompanyId
      ? state.investments.filter(inv => inv.sub_company_id === subCompanyId)
      : state.investments;

    return filteredInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
  };

  // Data consistency functions
  const validateDataConsistencyFunc = () => {
    const crossPlatformData: CrossPlatformData = {
      investments: state.investments,
      investorInvestments: state.investorInvestments,
      users: state.users,
      lastSync: new Date()
    };

    return validateDataConsistency(crossPlatformData);
  };

  const synchronizeData = () => {
    const crossPlatformData: CrossPlatformData = {
      investments: state.investments,
      investorInvestments: state.investorInvestments,
      users: state.users,
      lastSync: new Date()
    };

    const synchronized = synchronizeDataAcrossRoles(crossPlatformData);

    // Update state with synchronized data
    dispatch({ type: 'SET_INVESTMENTS', payload: synchronized.investments });
    dispatch({ type: 'SET_INVESTOR_INVESTMENTS', payload: synchronized.investorInvestments });
    dispatch({ type: 'SET_USERS', payload: synchronized.users });
  };

  // Context value
  const contextValue: DataContextType = {
    state,
    fetchUsers,
    updateUserStatus,
    fetchSubCompanies,
    getSubCompanyById,
    createSubCompany,
    updateSubCompany,
    deleteSubCompany,
    fetchInvestments,
    getInvestmentById,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    addDailyPerformance,
    getPerformanceHistory,
    fetchInvestorInvestments,
    createInvestorInvestment,
    withdrawInvestment,
    fetchAssets,
    getAssetById,
    fetchSuperadminAnalytics,
    fetchAdminAnalytics,
    fetchInvestorAnalytics,
    fetchSalesmanAnalytics,
    fetchActivityLogs,
    fetchProfitLossRecords,
    fetchMarketData,
    clearError,
    clearAllErrors,
    isDataStale,
    calculateMetrics,
    calculatePerformanceTrend,
    calculateInvestmentStatusDistribution,
    calculatePortfolioDistribution,
    calculateROI,
    calculateTotalValue,
    validateDataConsistency: validateDataConsistencyFunc,
    synchronizeData,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the DataContext
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
