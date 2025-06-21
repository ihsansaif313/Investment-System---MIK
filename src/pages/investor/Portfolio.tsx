import React, { useState, useEffect, useCallback } from 'react';
import { PieChartIcon, TrendingUpIcon, TrendingDownIcon, DollarSignIcon, PercentIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { CustomAreaChart, CustomPieChart } from '../../components/ui/Charts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { getInvestorPortfolio, getDashboardMetrics } from '../../data/demoData';
const Portfolio: React.FC = () => {
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);
  const { state, fetchInvestorAnalytics, fetchInvestorInvestments } = useData();
  const { user } = useAuth();

  // Check if this is a demo user
  const isDemoUser = user && (user as any).isDemo;

  // Memoized fetch functions to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // For demo users, we don't need to fetch from API
      if (isDemoUser) {
        // Demo data is handled directly in the component
        setLoading(false);
        return;
      }

      // For real users, fetch from API
      await Promise.all([
        fetchInvestorAnalytics(user.id),
        fetchInvestorInvestments(user.id)
      ]);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, isDemoUser, fetchInvestorAnalytics, fetchInvestorInvestments]);

  // Load portfolio data on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get analytics data - use demo data for demo users
  const getDemoAnalytics = () => {
    if (isDemoUser && user?.id === 'demo-investor-001') {
      return {
        totalValue: 250000,
        totalProfit: 46750,
        totalLoss: 0,
        roi: 18.7,
        monthlyGrowth: 3.2,
        portfolioDistribution: [
          { assetType: 'Technology', percentage: 40, value: 100000 },
          { assetType: 'Healthcare', percentage: 30, value: 75000 },
          { assetType: 'Real Estate', percentage: 20, value: 50000 },
          { assetType: 'Finance', percentage: 10, value: 25000 }
        ]
      };
    }
    return null;
  };

  const getDemoInvestments = () => {
    if (isDemoUser && user?.id === 'demo-investor-001') {
      const portfolioData = getInvestorPortfolio(user.id);

      // Transform demo data to match component expectations
      return portfolioData.map((item: any) => ({
        id: item.id,
        amount_invested: item.amount,
        currentValue: item.currentValue,
        status: item.status,
        investment: {
          name: getInvestmentName(item.investmentId),
          asset: {
            type: getInvestmentType(item.investmentId)
          }
        }
      }));
    }
    return [];
  };

  // Helper functions to get investment details
  const getInvestmentName = (investmentId: string) => {
    const investmentNames: { [key: string]: string } = {
      'inv-1': 'Apple Inc. (AAPL)',
      'inv-3': 'Microsoft Corporation (MSFT)',
      'inv-4': 'Tesla Inc. (TSLA)',
      'inv-6': 'Amazon.com Inc. (AMZN)'
    };
    return investmentNames[investmentId] || 'Unknown Investment';
  };

  const getInvestmentType = (investmentId: string) => {
    const investmentTypes: { [key: string]: string } = {
      'inv-1': 'Technology',
      'inv-3': 'Technology',
      'inv-4': 'Technology',
      'inv-6': 'Technology'
    };
    return investmentTypes[investmentId] || 'Other';
  };

  const analytics = isDemoUser ? getDemoAnalytics() : state.analytics.investor;
  const investments = isDemoUser ? getDemoInvestments() : state.investorInvestments;

  // Calculate portfolio breakdown from actual data
  const calculatePortfolioBreakdown = () => {
    if (!analytics?.portfolioDistribution) return [];
    return analytics.portfolioDistribution.map(item => ({
      category: item.assetType,
      percentage: item.percentage,
      value: item.value,
      color: getCategoryColor(item.assetType)
    }));
  };

  // Generate performance chart data
  const generatePerformanceData = () => {
    if (!analytics) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    return months.slice(0, currentMonth + 1).map((month, index) => {
      const baseInvested = 250000;
      const growth = (analytics.monthlyGrowth || 0) / 100;
      const invested = baseInvested;
      const value = baseInvested * (1 + (growth * (index + 1) / 12));

      return {
        name: month,
        invested: Math.round(invested),
        value: Math.round(value)
      };
    });
  };

  const performanceData = generatePerformanceData();
  const portfolioBreakdown = calculatePortfolioBreakdown();
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'performing':
        return 'bg-green-500/20 text-green-500';
      case 'underperforming':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'loss':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technology':
        return 'bg-blue-500/20 text-blue-500';
      case 'Healthcare':
        return 'bg-green-500/20 text-green-500';
      case 'Energy':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Real Estate':
        return 'bg-purple-500/20 text-purple-500';
      case 'Finance':
        return 'bg-teal-500/20 text-teal-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  // Show loading state
  if (loading) {
    return (
      <DashboardLayout title="My Portfolio" subtitle="Track and manage your investment portfolio">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout title="My Portfolio" subtitle="Track and manage your investment portfolio">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">
              Total Investment
            </h3>
            <DollarSignIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${(analytics?.totalValue || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">
              Current Value
            </h3>
            <TrendingUpIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">
            ${((analytics?.totalValue || 0) + (analytics?.totalProfit || 0) - (analytics?.totalLoss || 0)).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Profit</h3>
            <DollarSignIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500">
            +${(analytics?.totalProfit || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">ROI</h3>
            <PercentIcon className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-500">
            +{(analytics?.roi || 0).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            <span className={(analytics?.monthlyGrowth || 0) > 0 ? 'text-green-500' : 'text-red-500'}>
              {(analytics?.monthlyGrowth || 0) > 0 ? '+' : ''}
              {(analytics?.monthlyGrowth || 0).toFixed(1)}%
            </span>{' '}
            this month
          </p>
        </div>
      </div>
      {/* Portfolio Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-white">
              Portfolio Performance
            </h3>
            <div className="flex space-x-2">
              <Button size="sm" variant={timeframe === 'week' ? 'primary' : 'secondary'} onClick={() => setTimeframe('week')}>
                1W
              </Button>
              <Button size="sm" variant={timeframe === 'month' ? 'primary' : 'secondary'} onClick={() => setTimeframe('month')}>
                1M
              </Button>
              <Button size="sm" variant={timeframe === 'year' ? 'primary' : 'secondary'} onClick={() => setTimeframe('year')}>
                1Y
              </Button>
              <Button size="sm" variant={timeframe === 'all' ? 'primary' : 'secondary'} onClick={() => setTimeframe('all')}>
                All
              </Button>
            </div>
          </div>
          {performanceData.length > 0 ? (
            <CustomAreaChart
              data={performanceData}
              xKey="name"
              areas={[
                { key: 'invested', name: 'Invested', color: '#3B82F6', fillOpacity: 0.3 },
                { key: 'value', name: 'Current Value', color: '#EAB308', fillOpacity: 0.3 }
              ]}
              height={256}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No portfolio performance data available
            </div>
          )}
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center mb-6">
            <PieChartIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-white">
              Portfolio Breakdown
            </h3>
          </div>
          {portfolioBreakdown.length > 0 ? (
            <CustomPieChart
              data={portfolioBreakdown.map(item => ({
                name: item.category,
                value: item.value,
                color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][portfolioBreakdown.indexOf(item) % 5]
              }))}
              height={250}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p>No portfolio data available</p>
                <p className="text-sm mt-2">Start investing to see your portfolio breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Investments List */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h3 className="text-lg font-medium text-white">My Investments</h3>
          <p className="text-sm text-slate-400 mt-1">
            Showing {investments.length} active investments
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">Investment</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Initial</th>
                <th className="p-4 font-medium">Current Value</th>
                <th className="p-4 font-medium">ROI</th>
                <th className="p-4 font-medium">Change</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.length > 0 ? (
                investments.map(investment => (
                  <tr key={investment.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4 text-white font-medium">
                      {investment.investment?.name || 'Unknown Investment'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(investment.investment?.asset?.type || 'Other')}`}>
                        {investment.investment?.asset?.type || 'Other'}
                      </span>
                    </td>
                    <td className="p-4 text-white">
                      ${investment.amount_invested.toLocaleString()}
                    </td>
                    <td className="p-4 text-white">
                      ${investment.currentValue.toLocaleString()}
                    </td>
                    <td className="p-4 text-yellow-500">
                      +{((investment.currentValue - investment.amount_invested) / investment.amount_invested * 100).toFixed(1)}%
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        {investment.currentValue > investment.amount_invested ? (
                          <TrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={investment.currentValue > investment.amount_invested ? 'text-green-500' : 'text-red-500'}>
                          {investment.currentValue > investment.amount_invested ? '+' : ''}
                          {((investment.currentValue - investment.amount_invested) / investment.amount_invested * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investment.status)}`}>
                        {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="secondary" size="sm">
                        Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <p>No investments found</p>
                    <p className="text-sm mt-2">Start investing to see your portfolio here</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>;
};
export default Portfolio;