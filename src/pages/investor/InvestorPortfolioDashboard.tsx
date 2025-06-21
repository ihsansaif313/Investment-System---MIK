import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Activity,
  Filter, Download, Calendar, Target, Wallet, ArrowUpRight, ArrowDownRight,
  Eye, RefreshCw, Settings, AlertCircle, Info, ChevronDown, ChevronUp
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import { CustomAreaChart, CustomPieChart } from '../../components/ui/Charts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';

interface FilterOptions {
  dateRange: string;
  investmentType: string;
  riskLevel: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface PerformanceData {
  date: string;
  portfolioValue: number;
  invested: number;
  returns: number;
  roi: number;
}

const InvestorPortfolioDashboard: React.FC = () => {
  const { user } = useAuth();
  const { selectedCompany } = useCompanySelection();
  const { state, fetchInvestorAnalytics, fetchInvestorInvestments, fetchInvestments } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedInvestment, setExpandedInvestment] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    investmentType: 'all',
    riskLevel: 'all',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Data from context
  const analytics = state.analytics.investor;
  const investorInvestments = state.investorInvestments;
  const allInvestments = state.investments;

  // Load data on component mount and when company changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchInvestorAnalytics(user.id, false, selectedCompany?.id),
          fetchInvestorInvestments(user.id),
          fetchInvestments({ subCompanyId: selectedCompany?.id })
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        errorToast('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, selectedCompany, fetchInvestorAnalytics, fetchInvestorInvestments, fetchInvestments]);

  // Filter and sort investments
  const filteredInvestments = investorInvestments.filter(investment => {
    if (filters.status !== 'all' && investment.status !== filters.status) return false;
    if (filters.riskLevel !== 'all' && investment.investment?.riskLevel !== filters.riskLevel) return false;
    if (filters.investmentType !== 'all' && investment.investment?.asset?.type !== filters.investmentType) return false;
    
    if (filters.dateRange !== 'all') {
      const investmentDate = new Date(investment.investment_date);
      const now = new Date();
      const daysAgo = filters.dateRange === 'week' ? 7 : filters.dateRange === 'month' ? 30 : 365;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      if (investmentDate < cutoffDate) return false;
    }
    
    return true;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (filters.sortBy) {
      case 'name':
        aValue = a.investment?.name || '';
        bValue = b.investment?.name || '';
        break;
      case 'amount':
        aValue = a.amount_invested;
        bValue = b.amount_invested;
        break;
      case 'roi':
        aValue = calculateInvestmentROI(a);
        bValue = calculateInvestmentROI(b);
        break;
      case 'date':
      default:
        aValue = new Date(a.investment_date);
        bValue = new Date(b.investment_date);
        break;
    }

    if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Calculate individual investment ROI
  const calculateInvestmentROI = (investment: any) => {
    if (!investment.currentValue || investment.amount_invested === 0) return 0;
    return ((investment.currentValue - investment.amount_invested) / investment.amount_invested) * 100;
  };

  // Calculate profit/loss for individual investment
  const calculateProfitLoss = (investment: any) => {
    return (investment.currentValue || investment.amount_invested) - investment.amount_invested;
  };

  // Generate performance data for charts
  const generatePerformanceData = (): PerformanceData[] => {
    if (!analytics) return [];
    
    // Generate mock historical data based on current analytics
    const data: PerformanceData[] = [];
    const baseValue = analytics.totalValue || 0;
    const totalROI = analytics.roi || 0;
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const progressFactor = (12 - i) / 12;
      const portfolioValue = baseValue * (1 - (totalROI / 100) * (1 - progressFactor));
      const invested = baseValue;
      const returns = portfolioValue - invested;
      const roi = invested > 0 ? (returns / invested) * 100 : 0;
      
      data.push({
        date: date.toISOString().split('T')[0],
        portfolioValue,
        invested,
        returns,
        roi
      });
    }
    
    return data;
  };

  const performanceData = generatePerformanceData();

  // Export functionality
  const handleExport = (format: 'csv' | 'pdf') => {
    try {
      if (format === 'csv') {
        const csvData = filteredInvestments.map(inv => ({
          'Investment Name': inv.investment?.name || 'N/A',
          'Amount Invested': inv.amount_invested,
          'Current Value': inv.currentValue || inv.amount_invested,
          'Profit/Loss': calculateProfitLoss(inv),
          'ROI %': calculateInvestmentROI(inv).toFixed(2),
          'Investment Date': new Date(inv.investment_date).toLocaleDateString(),
          'Status': inv.status,
          'Risk Level': inv.investment?.riskLevel || 'N/A',
          'Asset Type': inv.investment?.asset?.type || 'N/A'
        }));
        
        const csvContent = [
          Object.keys(csvData[0]).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      successToast(`Portfolio exported as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (error) {
      errorToast('Failed to export portfolio');
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchInvestorAnalytics(user.id, true, selectedCompany?.id),
        fetchInvestorInvestments(user.id),
        fetchInvestments({ subCompanyId: selectedCompany?.id })
      ]);
      successToast('Portfolio data refreshed');
    } catch (error) {
      errorToast('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Investment Portfolio" subtitle="Comprehensive portfolio analytics and management">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Investment Portfolio" subtitle="Comprehensive portfolio analytics and management">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          {selectedCompany && (
            <div className="bg-slate-800 px-3 py-1 rounded-full">
              <span className="text-sm text-slate-300">Company: </span>
              <span className="text-sm font-medium text-white">{selectedCompany.name}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Investment Type</label>
              <select
                value={filters.investmentType}
                onChange={(e) => setFilters({ ...filters, investmentType: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Types</option>
                <option value="stocks">Stocks</option>
                <option value="bonds">Bonds</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="real_estate">Real Estate</option>
                <option value="commodities">Commodities</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="amount">Amount</option>
                <option value="roi">ROI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setFilters({
                dateRange: 'all',
                investmentType: 'all',
                riskLevel: 'all',
                status: 'all',
                sortBy: 'date',
                sortOrder: 'desc'
              })}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Invested</h3>
            <Wallet className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${(analytics?.totalValue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Across {filteredInvestments.length} investments
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Current Value</h3>
            <DollarSign className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${((analytics?.totalValue || 0) + (analytics?.totalProfit || 0) - (analytics?.totalLoss || 0)).toLocaleString()}
          </p>
          <div className="flex items-center mt-1">
            {(analytics?.monthlyGrowth || 0) >= 0 ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-xs ${(analytics?.monthlyGrowth || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {(analytics?.monthlyGrowth || 0) >= 0 ? '+' : ''}{(analytics?.monthlyGrowth || 0).toFixed(1)}% this month
            </span>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Returns</h3>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
          <p className={`text-2xl font-bold ${(analytics?.totalProfit || 0) - (analytics?.totalLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(analytics?.totalProfit || 0) - (analytics?.totalLoss || 0) >= 0 ? '+' : ''}
            ${((analytics?.totalProfit || 0) - (analytics?.totalLoss || 0)).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Profit: ${(analytics?.totalProfit || 0).toLocaleString()} | Loss: ${(analytics?.totalLoss || 0).toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Portfolio ROI</h3>
            <Target className="h-5 w-5 text-purple-500" />
          </div>
          <p className={`text-2xl font-bold ${(analytics?.roi || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(analytics?.roi || 0) >= 0 ? '+' : ''}{(analytics?.roi || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Since inception
          </p>
        </div>
      </div>

      {/* Performance Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Portfolio Performance Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium text-white">Portfolio Performance</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Last 12 months</span>
            </div>
          </div>

          {performanceData.length > 0 ? (
            <CustomAreaChart
              data={performanceData.map(item => ({
                name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
                invested: item.invested,
                value: item.portfolioValue,
                returns: item.returns
              }))}
              xKey="name"
              areas={[
                { key: 'invested', name: 'Invested', color: '#64748B', fillOpacity: 0.2 },
                { key: 'value', name: 'Portfolio Value', color: '#EAB308', fillOpacity: 0.3 }
              ]}
              height={256}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No performance data available
            </div>
          )}

          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{performanceData[0]?.date ? new Date(performanceData[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</span>
            <span>{performanceData[performanceData.length - 1]?.date ? new Date(performanceData[performanceData.length - 1].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}</span>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-5 w-5 text-yellow-500" />
            <h3 className="text-lg font-medium text-white">Portfolio Breakdown</h3>
          </div>

          {analytics?.portfolioDistribution && analytics.portfolioDistribution.length > 0 ? (
            <CustomPieChart
              data={analytics.portfolioDistribution.map((item, index) => ({
                name: item.assetType,
                value: item.value,
                color: ['#3B82F6', '#10B981', '#EAB308', '#8B5CF6', '#06B6D4'][index % 5]
              }))}
              height={250}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No portfolio data available</p>
                <p className="text-slate-500 text-xs mt-1">Start investing to see breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Investments Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium text-white">Investment Details</h3>
            </div>
            <div className="text-sm text-slate-400">
              Showing {filteredInvestments.length} of {investorInvestments.length} investments
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">Investment</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Risk</th>
                <th className="p-4 font-medium">Invested</th>
                <th className="p-4 font-medium">Current Value</th>
                <th className="p-4 font-medium">P&L</th>
                <th className="p-4 font-medium">ROI</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvestments.length > 0 ? (
                filteredInvestments.map((investment) => {
                  const roi = calculateInvestmentROI(investment);
                  const profitLoss = calculateProfitLoss(investment);
                  const isExpanded = expandedInvestment === investment.id;

                  return (
                    <React.Fragment key={investment.id}>
                      <tr className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {investment.investment?.name || 'Unknown Investment'}
                              </div>
                              <div className="text-sm text-slate-400">
                                {investment.investment?.description?.substring(0, 50)}
                                {investment.investment?.description && investment.investment.description.length > 50 ? '...' : ''}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                            {investment.investment?.asset?.type || 'N/A'}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            investment.investment?.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                            investment.investment?.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {investment.investment?.riskLevel || 'N/A'}
                          </span>
                        </td>

                        <td className="p-4 text-white font-medium">
                          ${investment.amount_invested.toLocaleString()}
                        </td>

                        <td className="p-4 text-white font-medium">
                          ${(investment.currentValue || investment.amount_invested).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {profitLoss >= 0 ? (
                              <ArrowUpRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-500" />
                            )}
                            <span className={`font-medium ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`font-medium ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(2)}%
                          </span>
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            investment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            investment.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                            investment.status === 'withdrawn' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-500/20 text-slate-400'
                          }`}>
                            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                          </span>
                        </td>

                        <td className="p-4 text-slate-300 text-sm">
                          {new Date(investment.investment_date).toLocaleDateString()}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setExpandedInvestment(isExpanded ? null : investment.id)}
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              {isExpanded ? 'Less' : 'More'}
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-slate-700/30">
                          <td colSpan={10} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              <div>
                                <h4 className="text-sm font-medium text-white mb-3">Investment Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Expected ROI:</span>
                                    <span className="text-white">{investment.investment?.expectedROI || 0}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Start Date:</span>
                                    <span className="text-white">
                                      {investment.investment?.startDate ? new Date(investment.investment.startDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">End Date:</span>
                                    <span className="text-white">
                                      {investment.investment?.endDate ? new Date(investment.investment.endDate).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-white mb-3">Performance Metrics</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Days Invested:</span>
                                    <span className="text-white">
                                      {Math.floor((new Date().getTime() - new Date(investment.investment_date).getTime()) / (1000 * 60 * 60 * 24))}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Daily Return:</span>
                                    <span className={`${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {(roi / Math.max(1, Math.floor((new Date().getTime() - new Date(investment.investment_date).getTime()) / (1000 * 60 * 60 * 24)))).toFixed(4)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Annualized Return:</span>
                                    <span className={`${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      {(roi * (365 / Math.max(1, Math.floor((new Date().getTime() - new Date(investment.investment_date).getTime()) / (1000 * 60 * 60 * 24))))).toFixed(2)}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-medium text-white mb-3">Additional Info</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Asset Symbol:</span>
                                    <span className="text-white">{investment.investment?.asset?.symbol || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Min Investment:</span>
                                    <span className="text-white">${(investment.investment?.minInvestment || 0).toLocaleString()}</span>
                                  </div>
                                  {investment.notes && (
                                    <div>
                                      <span className="text-slate-400">Notes:</span>
                                      <p className="text-white text-xs mt-1">{investment.notes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="h-12 w-12 text-slate-600" />
                      <div>
                        <h3 className="text-lg font-medium text-slate-300 mb-1">No investments found</h3>
                        <p className="text-slate-400 text-sm">
                          {investorInvestments.length === 0
                            ? 'Start investing to see your portfolio here'
                            : 'Try adjusting your filters to see more investments'
                          }
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Portfolio Data"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Export your portfolio data for external analysis or record keeping.
          </p>

          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="primary"
              onClick={() => handleExport('csv')}
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleExport('pdf')}
              className="flex items-center justify-center gap-2"
              disabled
            >
              <Download className="h-4 w-4" />
              Export as PDF (Coming Soon)
            </Button>
          </div>

          <div className="text-xs text-slate-400 bg-slate-700/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-300 mb-1">Export includes:</p>
                <ul className="space-y-1">
                  <li>• Investment names and details</li>
                  <li>• Amount invested and current values</li>
                  <li>• Profit/loss calculations</li>
                  <li>• ROI percentages</li>
                  <li>• Investment dates and status</li>
                  <li>• Risk levels and asset types</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default InvestorPortfolioDashboard;
