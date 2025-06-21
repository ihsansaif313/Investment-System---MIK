import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  PieChart,
  Plus,
  Eye,
  Edit,
  Trash2,
  Target,
  Activity,
  Filter,
  Download
} from 'lucide-react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable, { Column } from '../../components/ui/DataTable';
import { ConfirmModal } from '../../components/ui/Modal';
import { MetricCard, CustomPieChart, CustomAreaChart } from '../../components/ui/Charts';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import {
  demoInvestments,
  getDashboardMetrics,
  DemoInvestment
} from '../../data/demoData';
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { selectedCompany } = useCompanySelection();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<DemoInvestment | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Use demo data instead of API calls
  const investments = demoInvestments;
  const dashboardMetrics = getDashboardMetrics();

  // Manual refresh function
  const manualRefresh = () => {
    setLastUpdate(new Date());
    successToast('Dashboard refreshed', 'Data has been updated');
  };
  // Handle investment deletion
  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;

    try {
      // Simulate deletion (in real app, this would call API)
      successToast('Investment deleted successfully');
      setShowDeleteModal(false);
      setSelectedInvestment(null);
    } catch (error) {
      errorToast('Failed to delete investment', 'Please try again');
    }
  };

  // Generate performance trend data for charts
  const generatePerformanceTrends = () => {
    const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return periods.map((period, index) => {
      const baseValue = 1000000 + (index * 200000);
      const variance = Math.random() * 100000;
      const totalInvestment = baseValue + variance;
      const totalReturn = totalInvestment * (0.05 + Math.random() * 0.15);

      return {
        name: period,
        totalInvestment: Math.round(totalInvestment),
        totalReturn: Math.round(totalReturn),
        roi: Math.round((totalReturn / totalInvestment) * 100 * 100) / 100,
        investmentCount: Math.floor(Math.random() * 5) + investments.length - 2
      };
    });
  };

  const performanceData = generatePerformanceTrends();
  // Prepare chart data using demo data
  const investmentStatusData = [
    { name: 'Active', value: investments.filter(inv => inv.status === 'Active').length, color: '#10B981' },
    { name: 'Completed', value: investments.filter(inv => inv.status === 'Completed').length, color: '#3B82F6' },
    { name: 'Paused', value: investments.filter(inv => inv.status === 'Paused').length, color: '#F59E0B' },
    { name: 'Cancelled', value: investments.filter(inv => inv.status === 'Cancelled').length, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const investmentTypeData = investments.reduce((acc, inv) => {
    const type = inv.investmentType;
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value += inv.currentValue;
    } else {
      acc.push({
        name: type,
        value: inv.currentValue,
        color: ['#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'][acc.length % 6]
      });
    }
    return acc;
  }, [] as { name: string; value: number; color: string }[]);

  // Define table columns for investments
  const investmentColumns: Column<DemoInvestment>[] = [
    {
      key: 'name',
      title: 'Investment Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img src={row.companyLogo} alt={row.companyName} className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-slate-400">{row.companyName}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'investmentType',
      title: 'Asset Type',
      render: (value) => (
        <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
          {value}
        </span>
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
      key: 'totalInvestors',
      title: 'Investors',
      align: 'center',
      render: (value) => (
        <span className="text-white font-medium">{value}</span>
      ),
    },
    {
      key: 'actualROI',
      title: 'ROI',
      align: 'right',
      render: (value) => {
        const isPositive = value >= 0;
        return (
          <span className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{value?.toFixed(2)}%
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => {
        const statusColors = {
          Active: 'bg-green-500/20 text-green-400',
          Completed: 'bg-blue-500/20 text-blue-400',
          Paused: 'bg-yellow-500/20 text-yellow-400',
          Cancelled: 'bg-red-500/20 text-red-400'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    }
  ];
  // Loading state removed since we're using demo data

  return (
    <AdminDashboardLayout
      title={selectedCompany ? `${selectedCompany.name} Dashboard` : "Admin Dashboard"}
      subtitle={selectedCompany ? `Manage ${selectedCompany.name}'s investments and investors` : "Manage your company's investments and investors"}
    >
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
            leftIcon={<Users size={16} />}
            onClick={() => navigate('/admin/investors')}
          >
            Manage Investors
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/admin/investments/new')}
          >
            Create Investment
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          icon={<PieChart className="w-6 h-6 text-blue-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment }))}
          chartType="bar"
        />

        <MetricCard
          title="Active Investments"
          value={dashboardMetrics.activeInvestments}
          change={{
            value: performanceData.length >= 2 ?
              ((performanceData[performanceData.length - 1]?.totalReturn || 0) -
               (performanceData[performanceData.length - 2]?.totalReturn || 0)) /
               Math.max(performanceData[performanceData.length - 2]?.totalReturn || 1, 1) * 100 : 0,
            type: 'increase'
          }}
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
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
          icon={<DollarSign className="w-6 h-6 text-yellow-500" />}
          chartData={performanceData.slice(-7).map(d => ({ value: d.totalInvestment + d.totalReturn }))}
          chartType="area"
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
          icon={<Target className="w-6 h-6 text-purple-500" />}
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
              <CustomAreaChart
                data={performanceData}
                xKey="name"
                areas={[
                  { key: 'totalInvestment', name: 'Total Investment', color: '#EAB308', fillOpacity: 0.3 },
                  { key: 'totalReturn', name: 'Total Returns', color: '#10B981', fillOpacity: 0.3 }
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

        {/* Investment Type Distribution */}
        <div>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Investment Types</h3>
            {investmentTypeData.length > 0 ? (
              <CustomPieChart
                data={investmentTypeData}
                height={300}
                className="bg-transparent p-0"
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No investment data available
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Investments Table */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Investments</h3>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                leftIcon={<Filter size={16} />}
                onClick={() => {/* TODO: Implement filter */}}
              >
                Filter
              </Button>
              <Button
                variant="secondary"
                leftIcon={<Download size={16} />}
                onClick={() => {/* TODO: Implement export */}}
              >
                Export
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => navigate('/admin/investments/new')}
              >
                New Investment
              </Button>
            </div>
          </div>

          <DataTable
            data={investments}
            columns={investmentColumns}
            loading={false}
            searchable={true}
            searchPlaceholder="Search investments..."
            pageSize={10}
            onRowClick={(investment) => navigate(`/admin/investments/${investment.id}`)}
            actions={[
              {
                label: 'View',
                onClick: (investment) => navigate(`/admin/investments/${investment.id}`),
                icon: <Eye size={14} />,
                variant: 'secondary'
              },
              {
                label: 'Edit',
                onClick: (investment) => navigate(`/admin/investments/${investment.id}/edit`),
                icon: <Edit size={14} />,
                variant: 'secondary'
              },
              {
                label: 'Delete',
                onClick: (investment) => {
                  setSelectedInvestment(investment);
                  setShowDeleteModal(true);
                },
                icon: <Trash2 size={14} />,
                variant: 'danger'
              }
            ]}
          />
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Investor Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Investor Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Total Investors</p>
                  <p className="text-sm text-slate-400">Active accounts</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">{dashboardMetrics.totalInvestors}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Avg. Investment</p>
                  <p className="text-sm text-slate-400">Per investor</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-white">
                ${Math.round(dashboardMetrics.totalValue / Math.max(dashboardMetrics.totalInvestors, 1)).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Monthly Growth</p>
                  <p className="text-sm text-slate-400">Investor base</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-400">
                +{(performanceData.length >= 2 ?
                  ((performanceData[performanceData.length - 1]?.investmentCount || 0) -
                   (performanceData[performanceData.length - 2]?.investmentCount || 0)) /
                   Math.max(performanceData[performanceData.length - 2]?.investmentCount || 1, 1) * 100 : 0).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>

        {/* Investment Status */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Investment Status</h3>
          <CustomPieChart
            data={investmentStatusData}
            height={250}
          />
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { id: 1, description: 'New investment created: Meta Growth Fund Series A', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
              { id: 2, description: 'Performance update for TikTok Global Expansion Fund', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
              { id: 3, description: 'New investor joined Tesla Energy Storage Systems', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
              { id: 4, description: 'Monthly report generated for Manhattan Commercial Real Estate', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
              { id: 5, description: 'Investment milestone reached: $1M total value', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() }
            ].map((activity) => (
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
            ))}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteInvestment}
        title="Delete Investment"
        message={`Are you sure you want to delete "${selectedInvestment?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </AdminDashboardLayout>
  );
};
export default AdminDashboard;