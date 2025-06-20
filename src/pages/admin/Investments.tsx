import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  DollarSign,
  Users
} from 'lucide-react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DataTable, { Column } from '../../components/ui/DataTable';
import Modal, { ConfirmModal } from '../../components/ui/Modal';
import { MetricCard, CustomBarChart, CustomPieChart } from '../../components/ui/Charts';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { InvestmentWithDetails, InvestmentFilters } from '../../types/database';
const Investments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchInvestments,
    deleteInvestment,
    fetchAssets
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [filters, setFilters] = useState<InvestmentFilters>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentWithDetails | null>(null);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Get the admin's sub-company ID
  const subCompanyId = user?.subCompanyAdmin?.sub_company_id;

  useEffect(() => {
    const loadData = async () => {
      if (!subCompanyId) return;

      try {
        await Promise.all([
          fetchInvestments({ subCompanyId, ...filters }),
          fetchAssets()
        ]);
      } catch (error) {
        errorToast('Failed to load investments', 'Please try refreshing the page');
      }
    };

    loadData();
  }, [subCompanyId, filters]);
  const { investments, loading } = state;

  // Handle investment deletion
  const handleDeleteInvestment = async () => {
    if (!selectedInvestment) return;

    try {
      await deleteInvestment(selectedInvestment.id);
      successToast('Investment deleted successfully');
      setShowDeleteModal(false);
      setSelectedInvestment(null);
    } catch (error) {
      errorToast('Failed to delete investment', 'Please try again');
    }
  };

  // Prepare chart data
  const investmentStatusData = [
    { name: 'Active', value: investments.filter(inv => inv.status === 'Active').length, color: '#10B981' },
    { name: 'Completed', value: investments.filter(inv => inv.status === 'Completed').length, color: '#3B82F6' },
    { name: 'Paused', value: investments.filter(inv => inv.status === 'Paused').length, color: '#F59E0B' }
  ];

  const investmentTypeData = investments.reduce((acc, inv) => {
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

  // Calculate summary stats
  const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
  const totalInvestors = investments.reduce((sum, inv) => sum + inv.totalInvestors, 0);
  const avgROI = investments.length > 0 ?
    investments.reduce((sum, inv) => sum + inv.currentROI, 0) / investments.length : 0;
  const activeInvestments = investments.filter(inv => inv.status === 'Active').length;
  // Define table columns for investments
  const investmentColumns: Column<InvestmentWithDetails>[] = [
    {
      key: 'name',
      title: 'Investment Name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.asset.logo && (
            <img src={row.asset.logo} alt={row.asset.name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <div className="font-medium text-white">{value}</div>
            <div className="text-sm text-slate-400">{row.asset.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'asset',
      title: 'Asset Type',
      render: (value) => (
        <span className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
          {value.type}
        </span>
      ),
    },
    {
      key: 'current_value',
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
        <div className="flex items-center justify-center gap-1">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-white font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: 'currentROI',
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
      key: 'risk_level',
      title: 'Risk Level',
      render: (value) => {
        const riskColors = {
          Low: 'bg-green-500/20 text-green-400',
          Medium: 'bg-yellow-500/20 text-yellow-400',
          High: 'bg-red-500/20 text-red-400'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors[value as keyof typeof riskColors]}`}>
            {value}
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
          Paused: 'bg-yellow-500/20 text-yellow-400'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value as keyof typeof statusColors]}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'start_date',
      title: 'Start Date',
      render: (value) => (
        <span className="text-slate-300">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    }
  ];
  return (
    <AdminDashboardLayout title="Investments" subtitle="Manage your company's investment portfolio">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <MetricCard
          title="Total Value"
          value={`$${totalValue.toLocaleString()}`}
          change={{ value: 12.5, type: 'increase' }}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />}
        />

        <MetricCard
          title="Active Investments"
          value={activeInvestments}
          change={{ value: 8.3, type: 'increase' }}
          icon={<BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />}
        />

        <MetricCard
          title="Total Investors"
          value={totalInvestors}
          change={{ value: 15.2, type: 'increase' }}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />}
        />

        <MetricCard
          title="Average ROI"
          value={`${avgROI.toFixed(2)}%`}
          change={{ value: avgROI > 0 ? 5.7 : -2.1, type: avgROI > 0 ? 'increase' : 'decrease' }}
          icon={<Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Investment Status</h3>
          <CustomBarChart
            data={investmentStatusData}
            xKey="name"
            bars={[{ key: 'value', name: 'Count', color: '#EAB308' }]}
            height={200}
            className="bg-transparent p-0 sm:h-[250px]"
          />
        </Card>

        <Card className="p-3 sm:p-4 lg:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Investment Types</h3>
          {investmentTypeData.length > 0 ? (
            <CustomPieChart
              data={investmentTypeData}
              height={200}
              className="bg-transparent p-0 sm:h-[250px]"
            />
          ) : (
            <div className="h-48 sm:h-64 flex items-center justify-center text-slate-400 text-sm">
              No investment data available
            </div>
          )}
        </Card>
      </div>
      {/* Investments Table */}
      <Card className="p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h3 className="text-base sm:text-lg font-semibold text-white">All Investments</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Filter size={14} className="sm:w-4 sm:h-4" />}
              onClick={() => setShowFiltersModal(true)}
              className="w-full sm:w-auto"
            >
              <span className="sm:inline">Filter</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={14} className="sm:w-4 sm:h-4" />}
              onClick={() => {/* TODO: Implement export */}}
              className="w-full sm:w-auto"
            >
              <span className="sm:inline">Export</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} className="sm:w-4 sm:h-4" />}
              onClick={() => navigate('/admin/investments/new')}
              className="w-full sm:w-auto"
            >
              <span className="hidden sm:inline">New Investment</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        <DataTable
          data={investments}
          columns={investmentColumns}
          loading={loading.investments}
          searchable={true}
          searchPlaceholder="Search investments..."
          exportable={true}
          pageSize={10}
          emptyStateType="investments"
          emptyMessage="No investments found. Create your first investment to get started."
          emptyActionLabel="Create Investment"
          onEmptyAction={() => navigate('/admin/investments/new')}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteInvestment}
        title="Delete Investment"
        message={`Are you sure you want to delete "${selectedInvestment?.name}"? This action cannot be undone and will affect all investors in this investment.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Filter Investments"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Status
            </label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value as any] : undefined }))}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Asset Type
            </label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => setFilters(prev => ({ ...prev, assetType: e.target.value ? [e.target.value as any] : undefined }))}
            >
              <option value="">All Types</option>
              <option value="Stock">Stock</option>
              <option value="Crypto">Crypto</option>
              <option value="RealEstate">Real Estate</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Risk Level
            </label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value ? [e.target.value] : undefined }))}
            >
              <option value="">All Risk Levels</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </Modal>
    </AdminDashboardLayout>
  );
};
export default Investments;