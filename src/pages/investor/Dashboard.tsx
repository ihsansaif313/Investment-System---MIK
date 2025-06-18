import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowRight,
  Eye,
  Plus,
  Target,
  Activity,
  Wallet,
  BarChart3,
  Filter,
  ShoppingCart
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import DataTable, { Column } from '../../components/ui/DataTable';
import { MetricCard, CustomLineChart, CustomPieChart, CustomAreaChart } from '../../components/ui/Charts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { InvestorInvestmentWithDetails, InvestmentWithDetails, InvestorAnalytics } from '../../types/database';
const InvestorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchInvestorAnalytics,
    fetchInvestorInvestments,
    fetchInvestments,
    createInvestorInvestment
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        await Promise.all([
          fetchInvestorAnalytics(user.id),
          fetchInvestorInvestments(user.id),
          fetchInvestments() // Available investments
        ]);
      } catch (error) {
        errorToast('Failed to load dashboard data', 'Please try refreshing the page');
      }
    };

    loadDashboardData();
  }, [user?.id]);
  const {
    investments,
    investorInvestments,
    analytics,
    loading
  } = state;

  const investorAnalytics = analytics.investor;
  const isLoading = loading.investments || loading.analytics;

  // Prepare chart data
  const performanceData = investorAnalytics?.portfolio?.map((investment, index) => ({
    name: investment.investment.name.substring(0, 10),
    value: investment.currentValue,
    invested: investment.amount_invested,
    return: investment.totalReturn
  })) || [];

  const portfolioDistribution = investorAnalytics?.portfolioDistribution || [];

  // Available investments (opportunities)
  const availableInvestments = investments.filter(inv =>
    !investorInvestments.some(ii => ii.investment_id === inv.id)
  );

  // Define table columns for portfolio
  const portfolioColumns: Column<InvestorInvestmentWithDetails>[] = [
    {
      key: 'investment',
      title: 'Investment',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.investment.asset.logo && (
            <img src={row.investment.asset.logo} alt={row.investment.asset.name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="font-medium text-white">{value.name}</div>
            <div className="text-sm text-slate-400">{value.asset.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'amount_invested',
      title: 'Invested',
      align: 'right',
      render: (value) => (
        <span className="text-white font-medium">${value?.toLocaleString()}</span>
      ),
    },
    {
      key: 'currentValue',
      title: 'Current Value',
      align: 'right',
      render: (value) => (
        <span className="text-white font-medium">${value?.toLocaleString()}</span>
      ),
    },
    {
      key: 'roi',
      title: 'ROI',
      align: 'right',
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{value?.toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusColors = {
          active: 'bg-green-500/20 text-green-400',
          withdrawn: 'bg-red-500/20 text-red-400',
          completed: 'bg-blue-500/20 text-blue-400'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    }
  ];
  if (isLoading) {
    return (
      <DashboardLayout title="Investor Dashboard" subtitle="Overview of your investments and opportunities">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Investor Dashboard" subtitle="Overview of your investments and opportunities">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Eye size={16} />}
            onClick={() => navigate('/investor/portfolio')}
          >
            View Portfolio
          </Button>
          <Button
            variant="primary"
            leftIcon={<ShoppingCart size={16} />}
            onClick={() => navigate('/investor/marketplace')}
          >
            Browse Investments
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Investment"
          value={`$${(investorAnalytics?.totalValue || 0).toLocaleString()}`}
          change={{ value: 8.5, type: 'increase' }}
          icon={<Wallet className="w-6 h-6 text-blue-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.invested }))}
          chartType="bar"
        />

        <MetricCard
          title="Current Value"
          value={`$${(investorAnalytics?.totalValue || 0).toLocaleString()}`}
          change={{ value: investorAnalytics?.monthlyGrowth || 0, type: investorAnalytics?.monthlyGrowth && investorAnalytics.monthlyGrowth > 0 ? 'increase' : 'decrease' }}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.value }))}
          chartType="area"
        />

        <MetricCard
          title="Total Profit"
          value={`$${(investorAnalytics?.totalProfit || 0).toLocaleString()}`}
          change={{ value: 12.3, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6 text-yellow-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.return }))}
          chartType="line"
        />

        <MetricCard
          title="Portfolio ROI"
          value={`${(investorAnalytics?.roi || 0).toFixed(2)}%`}
          change={{ value: investorAnalytics?.roi || 0, type: investorAnalytics?.roi && investorAnalytics.roi > 0 ? 'increase' : 'decrease' }}
          icon={<Target className="w-6 h-6 text-purple-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: (d.return / d.invested) * 100 }))}
          chartType="line"
        />
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Portfolio Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Performance</h3>
          {performanceData.length > 0 ? (
            <CustomAreaChart
              data={performanceData}
              xKey="name"
              areas={[
                { key: 'invested', name: 'Invested', color: '#3B82F6', fillOpacity: 0.3 },
                { key: 'value', name: 'Current Value', color: '#10B981', fillOpacity: 0.3 }
              ]}
              height={300}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No portfolio data available
            </div>
          )}
        </Card>

        {/* Portfolio Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Distribution</h3>
          {portfolioDistribution.length > 0 ? (
            <CustomPieChart
              data={portfolioDistribution.map(item => ({
                name: item.assetType,
                value: item.value,
                color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6'][portfolioDistribution.indexOf(item) % 4]
              }))}
              height={300}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No portfolio data available
            </div>
          )}
        </Card>
      </div>

      {/* Portfolio Table */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">My Portfolio</h3>
            <Button
              variant="secondary"
              leftIcon={<Eye size={16} />}
              onClick={() => navigate('/investor/portfolio')}
            >
              View Full Portfolio
            </Button>
          </div>

          <DataTable
            data={investorInvestments.slice(0, 5)}
            columns={portfolioColumns}
            loading={loading.investments}
            searchable={false}
            pageSize={5}
            onRowClick={(investment) => navigate(`/investor/investments/${investment.id}`)}
            emptyMessage="You haven't made any investments yet"
          />
        </Card>
      </div>

      {/* Available Opportunities */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Investment Opportunities</h3>
          <Button
            variant="primary"
            leftIcon={<ShoppingCart size={16} />}
            onClick={() => navigate('/investor/marketplace')}
          >
            Browse All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableInvestments.slice(0, 6).map((investment) => (
            <div key={investment.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {investment.asset.logo && (
                  <img src={investment.asset.logo} alt={investment.asset.name} className="w-10 h-10 rounded-full" />
                )}
                <div>
                  <h4 className="font-medium text-white">{investment.name}</h4>
                  <p className="text-sm text-slate-400">{investment.asset.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Expected ROI</p>
                  <p className="text-yellow-500 font-medium">{investment.expected_roi}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Min Investment</p>
                  <p className="text-white font-medium">${investment.min_investment?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Risk Level</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investment.risk_level === 'Low' ? 'bg-green-500/20 text-green-400' :
                    investment.risk_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {investment.risk_level}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Asset Type</p>
                  <span className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-300">
                    {investment.asset.type}
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate(`/investor/investments/${investment.id}`)}
                className="flex items-center justify-center gap-2"
              >
                <Plus size={14} />
                Invest Now
              </Button>
            </div>
          ))}
        </div>

        {availableInvestments.length === 0 && (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No investment opportunities available at the moment</p>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};
export default InvestorDashboard;