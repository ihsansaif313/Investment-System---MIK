import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  BarChart3, 
  PieChart, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Activity,
  Users,
  Building2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { ANALYTICS_METRIC_OPTIONS } from '../../constants/formOptions';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { 
  MetricCard, 
  CustomLineChart, 
  CustomBarChart, 
  CustomPieChart, 
  CustomAreaChart 
} from '../../components/ui/Charts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';

interface AnalyticsProps {
  userRole?: 'superadmin' | 'admin' | 'investor';
}

const Analytics: React.FC<AnalyticsProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchSuperadminAnalytics,
    fetchAdminAnalytics,
    fetchInvestorAnalytics,
    fetchSalesmanAnalytics,
    fetchInvestments,
    fetchSubCompanies,
    fetchUsers
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'roi' | 'profit' | 'growth'>('value');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine user role from props or auth context
  const currentRole = userRole || user?.role.type;
  const subCompanyId = user?.subCompanyAdmin?.sub_company_id;

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setIsRefreshing(true);
        
        switch (currentRole) {
          case 'superadmin':
            await Promise.all([
              fetchSuperadminAnalytics(),
              fetchSubCompanies(),
              fetchUsers(),
              fetchInvestments()
            ]);
            break;
          case 'admin':
            if (subCompanyId) {
              await Promise.all([
                fetchAdminAnalytics(subCompanyId),
                fetchInvestments({ subCompanyId }),
                fetchUsers({ subCompanyId })
              ]);
            }
            break;
          case 'investor':
            if (user?.id) {
              await Promise.all([
                fetchInvestorAnalytics(user.id),
                fetchInvestments()
              ]);
            }
            break;
          case 'salesman':
            await Promise.all([
              fetchSalesmanAnalytics(),
              fetchInvestments(),
              fetchUsers()
            ]);
            break;
          default:
            console.warn(`Unknown user role: ${currentRole}`);
            break;
        }
      } catch (error) {
        errorToast('Failed to load analytics data', 'Please try refreshing the page');
      } finally {
        setIsRefreshing(false);
      }
    };

    loadAnalyticsData();
  }, [currentRole, subCompanyId, user?.id, selectedTimeRange]);

  const { 
    investments, 
    subCompanies,
    users,
    analytics, 
    loading 
  } = state;

  const isLoading = loading.analytics || loading.investments || isRefreshing;

  // Get analytics data based on role
  const getAnalyticsData = () => {
    switch (currentRole) {
      case 'superadmin':
        return analytics.superadmin;
      case 'admin':
        return analytics.admin;
      case 'investor':
        return analytics.investor;
      case 'salesman':
        return analytics.salesman;
      default:
        return null;
    }
  };

  const analyticsData = getAnalyticsData();

  // Prepare chart data based on role
  const getPerformanceData = () => {
    if (!analyticsData) return [];
    
    if ('monthlyPerformance' in analyticsData) {
      return analyticsData.monthlyPerformance?.map(month => ({
        name: `${month.month} ${month.year}`,
        totalInvestment: month.totalInvestment,
        totalReturn: month.totalReturn,
        roi: month.roi,
        profit: month.profit,
        loss: month.loss
      })) || [];
    }
    
    return [];
  };

  const performanceData = getPerformanceData();

  // Get distribution data based on role
  const getDistributionData = () => {
    switch (currentRole) {
      case 'superadmin':
        return subCompanies.map((company, index) => ({
          name: company.name,
          value: company.totalValue,
          color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][index % 5]
        }));
      case 'admin':
        return investments.reduce((acc, inv) => {
          const type = inv.asset.type;
          const existing = acc.find(item => item.name === type);
          if (existing) {
            existing.value += inv.current_value;
          } else {
            acc.push({
              name: type,
              value: inv.current_value,
              color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6'][acc.length % 4]
            });
          }
          return acc;
        }, [] as { name: string; value: number; color: string }[]);
      case 'investor':
        return analytics.investor?.portfolioDistribution?.map((item, index) => ({
          name: item.assetType,
          value: item.value,
          color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6'][index % 4]
        })) || [];
      default:
        return [];
    }
  };

  const distributionData = getDistributionData();

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      switch (currentRole) {
        case 'superadmin':
          await fetchSuperadminAnalytics(true);
          break;
        case 'admin':
          if (subCompanyId) await fetchAdminAnalytics(subCompanyId, true);
          break;
        case 'investor':
          if (user?.id) await fetchInvestorAnalytics(user.id, true);
          break;
        case 'salesman':
          await fetchSalesmanAnalytics(true);
          break;
        default:
          console.warn(`Cannot refresh analytics for unknown role: ${currentRole}`);
          break;
      }
      successToast('Analytics refreshed successfully');
    } catch (error) {
      errorToast('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    successToast('Export started', 'Your analytics report will be downloaded shortly');
  };

  if (isLoading && !analyticsData) {
    return (
      <DashboardLayout title="Analytics" subtitle="Comprehensive performance insights and reporting">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  const getRoleTitle = () => {
    switch (currentRole) {
      case 'superadmin':
        return 'Global Analytics';
      case 'admin':
        return 'Company Analytics';
      case 'investor':
        return 'Portfolio Analytics';
      case 'salesman':
        return 'Sales Analytics';
      default:
        return 'Analytics';
    }
  };

  return (
    <DashboardLayout title={getRoleTitle()} subtitle="Comprehensive performance insights and reporting">
      {/* Header Controls */}
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
          
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            {ANALYTICS_METRIC_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Filter size={16} />}
            onClick={() => {/* TODO: Open filter modal */}}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            leftIcon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Download size={16} />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title={currentRole === 'superadmin' ? 'Total Companies' :
                 currentRole === 'admin' ? 'Total Investments' :
                 currentRole === 'salesman' ? 'Total Leads' :
                 'Portfolio Value'}
          value={currentRole === 'superadmin' ? analyticsData?.totalSubCompanies || 0 :
                 currentRole === 'admin' ? analyticsData?.totalInvestments || 0 :
                 currentRole === 'salesman' ? analyticsData?.totalLeads || 0 :
                 `$${(analyticsData?.totalValue || 0).toLocaleString()}`}
          change={{ value: currentRole === 'salesman' ? analyticsData?.monthlyGrowth || 0 : 12.5, type: 'increase' }}
          icon={currentRole === 'superadmin' ? <Building2 className="w-6 h-6 text-blue-500" /> :
                currentRole === 'admin' ? <BarChart3 className="w-6 h-6 text-green-500" /> :
                currentRole === 'salesman' ? <Users className="w-6 h-6 text-purple-500" /> :
                <DollarSign className="w-6 h-6 text-yellow-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment }))}
          chartType="bar"
        />
        
        <MetricCard
          title={currentRole === 'salesman' ? 'Total Sales' : 'Total Value'}
          value={currentRole === 'salesman' ?
                 `$${(analyticsData?.totalSales || 0).toLocaleString()}` :
                 `$${(analyticsData?.totalValue || 0).toLocaleString()}`}
          change={{ value: 8.3, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalReturn }))}
          chartType="area"
        />
        
        <MetricCard
          title={currentRole === 'salesman' ? 'Conversion Rate' : 'ROI'}
          value={currentRole === 'salesman' ?
                 `${(analyticsData?.conversionRate || 0).toFixed(1)}%` :
                 `${(analyticsData?.roi || 0).toFixed(2)}%`}
          change={{ value: analyticsData?.monthlyGrowth || 0, type: analyticsData?.monthlyGrowth && analyticsData.monthlyGrowth > 0 ? 'increase' : 'decrease' }}
          icon={<Target className="w-6 h-6 text-purple-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.roi }))}
          chartType="line"
        />
        
        <MetricCard
          title={currentRole === 'superadmin' ? 'Total Users' :
                 currentRole === 'salesman' ? 'Commission Earned' :
                 'Active Investments'}
          value={currentRole === 'superadmin' ? users.length :
                 currentRole === 'salesman' ? `$${(analyticsData?.totalCommission || 0).toLocaleString()}` :
                 analyticsData?.activeInvestments || 0}
          change={{ value: 15.2, type: 'increase' }}
          icon={currentRole === 'superadmin' ? <Users className="w-6 h-6 text-teal-500" /> :
                currentRole === 'salesman' ? <DollarSign className="w-6 h-6 text-emerald-500" /> :
                <Activity className="w-6 h-6 text-orange-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.profit - d.loss }))}
          chartType="line"
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Trend */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Investment</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Returns</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>ROI</span>
                </div>
              </div>
            </div>

            {performanceData.length > 0 ? (
              <CustomLineChart
                data={performanceData}
                xKey="name"
                lines={[
                  { key: 'totalInvestment', name: 'Total Investment', color: '#3B82F6' },
                  { key: 'totalReturn', name: 'Total Returns', color: '#10B981' },
                  { key: 'roi', name: 'ROI %', color: '#EAB308' }
                ]}
                height={350}
                className="bg-transparent p-0"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                No performance data available
              </div>
            )}
          </Card>
        </div>

        {/* Distribution Chart */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {currentRole === 'superadmin' ? 'Company Distribution' :
               currentRole === 'admin' ? 'Asset Distribution' :
               'Portfolio Distribution'}
            </h3>
            {distributionData.length > 0 ? (
              <CustomPieChart
                data={distributionData}
                height={350}
                className="bg-transparent p-0"
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-slate-400">
                No distribution data available
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit/Loss Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profit/Loss Analysis</h3>
          {performanceData.length > 0 ? (
            <CustomAreaChart
              data={performanceData}
              xKey="name"
              areas={[
                { key: 'profit', name: 'Profit', color: '#10B981', fillOpacity: 0.3 },
                { key: 'loss', name: 'Loss', color: '#EF4444', fillOpacity: 0.3 }
              ]}
              height={300}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No profit/loss data available
            </div>
          )}
        </Card>

        {/* Growth Metrics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Growth Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Monthly Growth</p>
                  <p className="text-sm text-slate-400">Average monthly increase</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-400">
                +{(analyticsData?.monthlyGrowth || 0).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Total ROI</p>
                  <p className="text-sm text-slate-400">Overall return on investment</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {(analyticsData?.roi || 0).toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Net Profit</p>
                  <p className="text-sm text-slate-400">Total profit minus losses</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-yellow-400">
                ${((analyticsData?.totalProfit || 0) - (analyticsData?.totalLoss || 0)).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {analyticsData?.totalInvestments || 0}
            </div>
            <div className="text-sm text-slate-400">Total Investments</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              ${(analyticsData?.totalProfit || 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Profit</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              ${(analyticsData?.totalLoss || 0).toLocaleString()}
            </div>
            <div className="text-sm text-slate-400">Total Loss</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {analyticsData?.activeInvestments || 0}
            </div>
            <div className="text-sm text-slate-400">Active Investments</div>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Analytics;
