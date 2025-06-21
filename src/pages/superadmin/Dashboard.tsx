import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  Eye,
  Activity,
  Settings,
  UserPlus
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable, { Column } from '../../components/ui/DataTable';
import { MetricCard, CustomLineChart, CustomPieChart, CustomDonutChart } from '../../components/ui/Charts';
import SystemStatus from '../../components/system/SystemStatus';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import {
  demoInvestments,
  demoCompanies,
  demoUsers,
  getDashboardMetrics,
  DemoCompany
} from '../../data/demoData';
const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Use demo data
  const subCompanies = demoCompanies;
  const investments = demoInvestments;
  const users = demoUsers;
  const dashboardMetrics = getDashboardMetrics();

  // Manual refresh function
  const manualRefresh = () => {
    setLastUpdate(new Date());
    successToast('Dashboard refreshed', 'Data has been updated');
  };
  // Generate performance trend data for charts
  const generatePerformanceTrends = () => {
    const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return periods.map((period, index) => {
      const baseValue = 2000000 + (index * 500000);
      const variance = Math.random() * 200000;
      const totalInvestment = baseValue + variance;
      const totalReturn = totalInvestment * (0.08 + Math.random() * 0.12);

      return {
        name: period,
        totalInvestment: Math.round(totalInvestment),
        totalReturn: Math.round(totalReturn),
        roi: Math.round((totalReturn / totalInvestment) * 100 * 100) / 100,
        investmentCount: Math.floor(Math.random() * 3) + investments.length - 1
      };
    });
  };

  const globalPerformanceTrends = generatePerformanceTrends();
  // Prepare chart data using demo data
  const performanceData = globalPerformanceTrends;

  const companyDistributionData = subCompanies.map((company, index) => ({
    name: company.name,
    value: company.revenue / 1000, // Convert to thousands for better visualization
    color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'][index % 5]
  }));

  const investmentStatusData = [
    { name: 'Active', value: investments.filter(inv => inv.status === 'Active').length, color: '#10B981' },
    { name: 'Completed', value: investments.filter(inv => inv.status === 'Completed').length, color: '#3B82F6' },
    { name: 'Paused', value: investments.filter(inv => inv.status === 'Paused').length, color: '#F59E0B' },
    { name: 'Cancelled', value: investments.filter(inv => inv.status === 'Cancelled').length, color: '#6B7280' }
  ].filter(item => item.value > 0);
  // Define table columns for companies
  const companyColumns: Column<any>[] = [
    {
      key: 'name',
      title: 'Company Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img src={row.logo} alt={row.name} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-slate-400">{row.industry}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'foundedYear',
      title: 'Founded',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'employees',
      title: 'Employees',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value?.toLocaleString()}</span>
      ),
    },
    {
      key: 'revenue',
      title: 'Revenue',
      align: 'right',
      render: (value) => (
        <span className="text-white font-medium">${(value / 1000000).toFixed(1)}M</span>
      ),
    },
    {
      key: 'website',
      title: 'Website',
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-yellow-400 text-sm">
          {value.replace('https://', '')}
        </a>
      ),
    }
  ];
  // Loading and error states removed since we're using demo data

  return (
    <DashboardLayout title="Superadmin Dashboard" subtitle="Overview of all sub-companies and investments">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-2 sm:px-3 py-2 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 min-w-0 flex-1 sm:flex-none"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Activity size={14} className="sm:w-4 sm:h-4" />}
            onClick={manualRefresh}
            title={`Last updated: ${lastUpdate.toLocaleTimeString()}`}
            className="w-full sm:w-auto"
          >
            <span className="sm:inline">Refresh</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<UserPlus size={14} className="sm:w-4 sm:h-4" />}
            onClick={() => navigate('/superadmin/admin-assignments')}
            className="w-full sm:w-auto"
          >
            <span className="sm:inline">Manage Users</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} className="sm:w-4 sm:h-4" />}
            onClick={() => navigate('/superadmin/company-management')}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Create Sub-Company</span>
            <span className="sm:hidden">Create Company</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
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
          icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment }))}
          chartType="area"
        />

        <MetricCard
          title="Total Investments"
          value={dashboardMetrics.totalInvestments}
          change={{
            value: performanceData.length >= 2 ?
              ((performanceData[performanceData.length - 1]?.totalInvestment || 0) -
               (performanceData[performanceData.length - 2]?.totalInvestment || 0)) /
               Math.max(performanceData[performanceData.length - 2]?.totalInvestment || 1, 1) * 100 : 0,
            type: 'increase'
          }}
          icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalReturn }))}
          chartType="line"
        />

        <MetricCard
          title="Total Value"
          value={`$${dashboardMetrics.totalValue.toLocaleString()}`}
          change={{
            value: dashboardMetrics.totalROI,
            type: dashboardMetrics.totalROI >= 0 ? 'increase' : 'decrease'
          }}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment + d.totalReturn }))}
          chartType="bar"
        />

        <MetricCard
          title="Average ROI"
          value={`${dashboardMetrics.totalROI.toFixed(2)}%`}
          change={{
            value: performanceData.length >= 2 ?
              (performanceData[performanceData.length - 1]?.roi || 0) -
              (performanceData[performanceData.length - 2]?.roi || 0) : 0,
            type: dashboardMetrics.totalROI >= 0 ? 'increase' : 'decrease'
          }}
          icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.roi }))}
          chartType="line"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Performance Trend */}
        <div className="xl:col-span-2">
          <Card className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-white">Performance Trend</h3>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <span>Investment</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
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
                height={250}
                className="bg-transparent p-0 sm:h-[300px]"
              />
            ) : (
              <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">
                No performance data available
              </div>
            )}
          </Card>
        </div>

        {/* Investment Status Distribution */}
        <div>
          <Card className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Investment Status</h3>
            <CustomPieChart
              data={investmentStatusData}
              height={250}
              className="bg-transparent p-0 sm:h-[300px]"
            />
          </Card>
        </div>
      </div>

      {/* Sub-Companies Table */}
      <div className="mb-6 sm:mb-8">
        <Card className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">Sub-Companies</h3>
            <Link
              to="/superadmin/companies"
              className="text-yellow-500 hover:text-yellow-400 text-xs sm:text-sm font-medium transition-colors"
            >
              View All →
            </Link>
          </div>

          <DataTable
            data={subCompanies}
            columns={companyColumns}
            loading={false}
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            {[
              { id: 1, description: 'New company registered: Tesla Inc.', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
              { id: 2, description: 'Investment created: Meta Growth Fund Series A', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
              { id: 3, description: 'Admin assigned to ByteDance Ltd.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
              { id: 4, description: 'System performance optimization completed', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
              { id: 5, description: 'Monthly analytics report generated', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
            ].map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white leading-relaxed">{activity.description}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Company Value Distribution */}
        <Card className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Company Value Distribution</h3>
          {companyDistributionData.length > 0 ? (
            <CustomDonutChart
              data={companyDistributionData}
              height={200}
              className="bg-transparent p-0 sm:h-[250px]"
            />
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">
              No company data available
            </div>
          )}
        </Card>
      </div>

      {/* System Status */}
      <div className="mt-6 sm:mt-8">
        <SystemStatus />
      </div>
    </DashboardLayout>
  );
};
export default SuperadminDashboard;