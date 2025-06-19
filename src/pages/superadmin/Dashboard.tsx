import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  MoreHorizontal,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  UserPlus
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import DataTable, { Column } from '../../components/ui/DataTable';
import { MetricCard, CustomLineChart, CustomBarChart, CustomPieChart, CustomDonutChart } from '../../components/ui/Charts';
import SystemStatus from '../../components/system/SystemStatus';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { SubCompanyWithDetails, SuperadminAnalytics, ActivityLog } from '../../types/database';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchSubCompanies,
    fetchSuperadminAnalytics,
    fetchActivityLogs,
    fetchUsers,
    fetchInvestments,
    calculateMetrics,
    calculatePerformanceTrend,
    calculateInvestmentStatusDistribution
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // Enable real-time updates
  const { lastUpdate, manualRefresh } = useRealTimeUpdates({
    enabled: true,
    pollingInterval: 30000, // 30 seconds
    onUpdate: (update) => {
      console.log('Superadmin dashboard updated:', update);
    }
  });

  const { isLoading: authLoading, user: authUser } = useAuth();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchSubCompanies(),
          fetchSuperadminAnalytics(),
          fetchActivityLogs(10),
          fetchUsers(),
          fetchInvestments()
        ]);
      } catch (error) {
        errorToast('Failed to load dashboard data', 'Please try refreshing the page');
      }
    };

    if (!authLoading && authUser) {
      loadDashboardData();
    }
  }, [authLoading, authUser]);
  const {
    subCompanies,
    investments,
    users,
    analytics,
    activityLogs,
    loading,
    errors
  } = state;

  const superadminAnalytics = analytics.superadmin;
  const isLoading = loading.companies || loading.analytics || loading.users;
  const hasError = errors.companies || errors.analytics || errors.users;

  // Calculate real-time global metrics
  const globalMetrics = calculateMetrics(); // No subCompanyId = global metrics
  const globalPerformanceTrends = calculatePerformanceTrend(undefined, 'month');
  const globalStatusDistribution = calculateInvestmentStatusDistribution();
  // Prepare chart data using real calculations
  const performanceData = globalPerformanceTrends.map(trend => ({
    name: trend.period,
    totalInvestment: trend.totalInvestment,
    totalReturn: trend.totalReturn,
    roi: trend.roi,
    investmentCount: trend.investmentCount
  }));

  const companyDistributionData = subCompanies.map((company, index) => ({
    name: company.name,
    value: company.totalValue,
    color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][index % 5]
  }));

  const investmentStatusData = globalStatusDistribution.map(status => ({
    name: status.status,
    value: status.count,
    color: status.status === 'Active' ? '#10B981' :
           status.status === 'Paused' ? '#F59E0B' : '#6B7280'
  }));
  // Define table columns for sub-companies
  const companyColumns: Column<SubCompanyWithDetails>[] = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.logo && (
            <img src={row.logo} alt={row.name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-slate-400">{row.industry}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'admin',
      title: 'Admin',
      render: (value, row) => (
        <div>
          <div className="text-white">{row.admin?.firstName} {row.admin?.lastName}</div>
          <div className="text-sm text-slate-400">{row.admin?.email}</div>
        </div>
      ),
    },
    {
      key: 'totalInvestments',
      title: 'Investments',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'totalInvestors',
      title: 'Investors',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'totalValue',
      title: 'Total Value',
      align: 'right',
      render: (value) => (
        <span className="text-white font-medium">${value?.toLocaleString()}</span>
      ),
    },
    {
      key: 'profitLoss',
      title: 'ROI',
      align: 'right',
      render: (value, row) => {
        const roi = row.profitLoss?.roi || 0;
        const isPositive = roi >= 0;
        return (
          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{roi.toFixed(2)}%
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusColors = {
          active: 'bg-green-500/20 text-green-400',
          inactive: 'bg-red-500/20 text-red-400',
          pending: 'bg-yellow-500/20 text-yellow-400'
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
      <DashboardLayout title="Superadmin Dashboard" subtitle="Overview of all sub-companies and investments">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (hasError) {
    return (
      <DashboardLayout title="Superadmin Dashboard" subtitle="Overview of all sub-companies and investments">
        <ErrorState
          title="Failed to Load Dashboard"
          message="Unable to load dashboard data. Please try refreshing the page."
          error={hasError}
          onRetry={() => {
            fetchSubCompanies(true);
            fetchSuperadminAnalytics(true);
            fetchUsers(undefined, true);
          }}
          onRefresh={() => window.location.reload()}
          size="lg"
          className="h-64"
          showDetails={true}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Superadmin Dashboard" subtitle="Overview of all sub-companies and investments">
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
            leftIcon={<Activity size={16} />}
            onClick={manualRefresh}
            title={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            leftIcon={<UserPlus size={16} />}
            onClick={() => navigate('/superadmin/users')}
          >
            Manage Users
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/superadmin/company/new')}
          >
            Create Sub-Company
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sub-Companies"
          value={subCompanies.length}
          change={{
            value: performanceData.length >= 2 ?
              ((performanceData[performanceData.length - 1]?.investmentCount || 0) -
               (performanceData[performanceData.length - 2]?.investmentCount || 0)) /
               Math.max(performanceData[performanceData.length - 2]?.investmentCount || 1, 1) * 100 : 0,
            type: 'increase'
          }}
          icon={<Building2 className="w-6 h-6 text-yellow-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment }))}
          chartType="area"
        />

        <MetricCard
          title="Total Investments"
          value={globalMetrics.investmentCount}
          change={{
            value: performanceData.length >= 2 ?
              ((performanceData[performanceData.length - 1]?.totalInvestment || 0) -
               (performanceData[performanceData.length - 2]?.totalInvestment || 0)) /
               Math.max(performanceData[performanceData.length - 2]?.totalInvestment || 1, 1) * 100 : 0,
            type: 'increase'
          }}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalReturn }))}
          chartType="line"
        />

        <MetricCard
          title="Total Value"
          value={`$${globalMetrics.totalValue.toLocaleString()}`}
          change={{
            value: globalMetrics.roi,
            type: globalMetrics.roi >= 0 ? 'increase' : 'decrease'
          }}
          icon={<DollarSign className="w-6 h-6 text-blue-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment + d.totalReturn }))}
          chartType="bar"
        />

        <MetricCard
          title="Average ROI"
          value={`${globalMetrics.roi.toFixed(2)}%`}
          change={{
            value: performanceData.length >= 2 ?
              (performanceData[performanceData.length - 1]?.roi || 0) -
              (performanceData[performanceData.length - 2]?.roi || 0) : 0,
            type: globalMetrics.roi >= 0 ? 'increase' : 'decrease'
          }}
          icon={<Activity className="w-6 h-6 text-purple-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.roi }))}
          chartType="line"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Performance Trend */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Performance Trend</h3>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Investment</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Returns</span>
                </div>
              </div>
            </div>

            {performanceData.length > 0 ? (
              <CustomLineChart
                data={performanceData}
                xKey="name"
                lines={[
                  { key: 'totalInvestment', name: 'Total Investment', color: '#EAB308' },
                  { key: 'totalReturn', name: 'Total Returns', color: '#10B981' }
                ]}
                height={300}
                className="bg-transparent p-0"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No performance data available
              </div>
            )}
          </Card>
        </div>

        {/* Investment Status Distribution */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Investment Status</h3>
            <CustomPieChart
              data={investmentStatusData}
              height={300}
              className="bg-transparent p-0"
            />
          </Card>
        </div>
      </div>

      {/* Sub-Companies Table */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Sub-Companies</h3>
            <Link
              to="/superadmin/companies"
              className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <DataTable
            data={subCompanies}
            columns={companyColumns}
            loading={loading.companies}
            searchable={true}
            searchPlaceholder="Search companies..."
            pageSize={5}
            onRowClick={(company) => navigate(`/superadmin/company/${company.id}`)}
            actions={[
              {
                label: 'View',
                onClick: (company) => navigate(`/superadmin/company/${company.id}`),
                icon: <Eye size={14} />,
                variant: 'secondary'
              },
              {
                label: 'Settings',
                onClick: (company) => navigate(`/superadmin/company/${company.id}/settings`),
                icon: <Settings size={14} />,
                variant: 'secondary'
              }
            ]}
          />
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activityLogs.length > 0 ? (
              activityLogs.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{activity.description}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Company Value Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Company Value Distribution</h3>
          {companyDistributionData.length > 0 ? (
            <CustomDonutChart
              data={companyDistributionData}
              height={250}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No company data available
            </div>
          )}
        </Card>
      </div>

      {/* System Status */}
      <div className="mt-8">
        <SystemStatus />
      </div>
    </DashboardLayout>
  );
};
export default SuperadminDashboard;