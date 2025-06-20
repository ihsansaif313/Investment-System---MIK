import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { MetricCard } from '../../components/ui/Charts';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';

const SalesmanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchSalesmanAnalytics,
    fetchInvestments,
    fetchUsers
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.id) return;

      try {
        await Promise.all([
          fetchSalesmanAnalytics(),
          fetchInvestments(),
          fetchUsers()
        ]);
      } catch (error) {
        errorToast('Failed to load dashboard data', 'Please try refreshing the page');
      }
    };

    loadDashboardData();
  }, [user?.id]);

  const {
    investments,
    users,
    analytics,
    loading
  } = state;

  const salesmanAnalytics = analytics.salesman;
  const isLoading = loading.investments || loading.analytics || loading.users;

  // Filter potential clients (investors)
  const potentialClients = users.filter(u => u.role?.type === 'investor');
  
  // Recent sales data (mock for now - would come from analytics)
  const recentSales = salesmanAnalytics?.recentSales || [];

  // Performance data for charts
  const performanceData = Array(7).fill(0).map((_, index) => ({
    value: Math.floor(Math.random() * 100) + 50
  }));

  // Handle data refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchSalesmanAnalytics(true),
        fetchInvestments(undefined, true),
        fetchUsers(undefined, true)
      ]);
      successToast('Dashboard refreshed successfully');
    } catch (error) {
      errorToast('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Table columns for recent sales
  const salesColumns = [
    {
      key: 'clientName',
      label: 'Client',
      render: (sale: any) => (
        <div className="font-medium text-white">{sale.clientName}</div>
      )
    },
    {
      key: 'investmentName',
      label: 'Investment',
      render: (sale: any) => (
        <div className="text-slate-300">{sale.investmentName}</div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (sale: any) => (
        <div className="font-medium text-green-400">
          ${sale.amount.toLocaleString()}
        </div>
      )
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (sale: any) => (
        <div className="font-medium text-yellow-400">
          ${sale.commission.toLocaleString()}
        </div>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (sale: any) => (
        <div className="text-slate-400">
          {new Date(sale.date).toLocaleDateString()}
        </div>
      )
    }
  ];

  // Table columns for potential clients
  const clientColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (client: any) => (
        <div className="font-medium text-white">
          {client.firstName} {client.lastName}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (client: any) => (
        <div className="text-slate-300">{client.email}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (client: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          client.status === 'active' 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {client.status}
        </span>
      )
    }
  ];

  if (isLoading && !salesmanAnalytics) {
    return (
      <DashboardLayout title="Sales Dashboard" subtitle="Track your sales performance and manage client relationships">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Sales Dashboard" 
      subtitle="Track your sales performance and manage client relationships"
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, {user?.firstName}!</h1>
          <p className="text-slate-400 mt-1">Here's your sales overview</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/reports')}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sales"
          value={`$${(salesmanAnalytics?.totalSales || 0).toLocaleString()}`}
          change={{ value: salesmanAnalytics?.monthlyGrowth || 0, type: 'increase' }}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          chartData={performanceData}
          chartType="area"
        />
        
        <MetricCard
          title="Total Leads"
          value={salesmanAnalytics?.totalLeads || 0}
          change={{ value: 12.5, type: 'increase' }}
          icon={<Users className="w-6 h-6 text-blue-500" />}
          chartData={performanceData}
          chartType="bar"
        />
        
        <MetricCard
          title="Conversion Rate"
          value={`${(salesmanAnalytics?.conversionRate || 0).toFixed(1)}%`}
          change={{ value: 8.3, type: 'increase' }}
          icon={<Target className="w-6 h-6 text-purple-500" />}
          chartData={performanceData}
          chartType="line"
        />
        
        <MetricCard
          title="Commission Earned"
          value={`$${(salesmanAnalytics?.totalCommission || 0).toLocaleString()}`}
          change={{ value: 15.2, type: 'increase' }}
          icon={<TrendingUp className="w-6 h-6 text-yellow-500" />}
          chartData={performanceData}
          chartType="line"
        />
      </div>

      {/* Recent Sales */}
      <div className="mb-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Sales</h3>
            <Button
              variant="secondary"
              leftIcon={<Eye size={16} />}
              onClick={() => navigate('/analytics')}
            >
              View All Analytics
            </Button>
          </div>

          <DataTable
            data={recentSales.slice(0, 5)}
            columns={salesColumns}
            loading={loading.analytics}
            searchable={false}
            pageSize={5}
            emptyMessage="No recent sales found"
          />
        </div>
      </div>

      {/* Potential Clients */}
      <div className="mb-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Potential Clients</h3>
            <Button
              variant="secondary"
              leftIcon={<Users size={16} />}
              onClick={() => navigate('/reports')}
            >
              View All Clients
            </Button>
          </div>

          <DataTable
            data={potentialClients.slice(0, 5)}
            columns={clientColumns}
            loading={loading.users}
            searchable={false}
            pageSize={5}
            emptyMessage="No potential clients found"
          />
        </div>
      </div>

      {/* Available Investments */}
      <div className="mb-8">
        <div className="bg-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Available Investments</h3>
            <Button
              variant="secondary"
              leftIcon={<BarChart3 size={16} />}
              onClick={() => navigate('/analytics')}
            >
              View Investment Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investments.slice(0, 6).map((investment) => (
              <div key={investment.id} className="bg-slate-700 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">{investment.name}</h4>
                <p className="text-slate-400 text-sm mb-3">{investment.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-400 font-medium">
                    ${investment.minimumInvestment?.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">
                    {investment.asset?.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesmanDashboard;
