import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Target,
  Activity,
  Plus,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  X
} from 'lucide-react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { MetricCard, CustomLineChart, CustomAreaChart } from '../../components/ui/Charts';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import apiService from '../../services/api';

interface Investment {
  _id: string;
  name: string;
  description: string;
  investmentType: string;
  category: string;
  initialAmount: number;
  currentValue: number;
  expectedROI: number;
  actualROI: number;
  riskLevel: string;
  status: string;
  investmentDate: string;
  startDate: string;
  endDate?: string;
  notes: string;
  tags: string[];
  subCompanyId: {
    _id: string;
    name: string;
    industry: string;
    logo?: string;
  };
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  latestPerformance: {
    date: string;
    marketValue: number;
    dailyChange: number;
    dailyChangePercent: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DailyPerformance {
  _id: string;
  date: string;
  marketValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  notes: string;
  marketConditions: string;
  updatedBy: {
    firstName: string;
    lastName: string;
  };
}

interface PerformanceSummary {
  totalDays: number;
  totalChange: number;
  totalChangePercent: number;
  averageDailyChange: number;
  bestDay: {
    date: string;
    change: number;
    changePercent: number;
  };
  worstDay: {
    date: string;
    change: number;
    changePercent: number;
  };
  volatility: number;
}

const InvestmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [investment, setInvestment] = useState<Investment | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<DailyPerformance[]>([]);
  const [performanceSummary, setPerformanceSummary] = useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddPerformance, setShowAddPerformance] = useState(false);

  // Daily performance form state
  const [performanceForm, setPerformanceForm] = useState({
    marketValue: '',
    notes: '',
    marketConditions: 'Neutral',
    date: new Date().toISOString().split('T')[0]
  });
  const [isSubmittingPerformance, setIsSubmittingPerformance] = useState(false);

  useEffect(() => {
    if (id) {
      loadInvestmentData();
    }
  }, [id]);

  const loadInvestmentData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.api.get(`/investments/${id}`);
      
      if (response.data.success) {
        setInvestment(response.data.data.investment);
        setPerformanceHistory(response.data.data.performanceHistory || []);
        setPerformanceSummary(response.data.data.performanceSummary);
        
        // Set initial market value for performance form
        setPerformanceForm(prev => ({
          ...prev,
          marketValue: response.data.data.investment.currentValue.toString()
        }));
      } else {
        throw new Error(response.data.message || 'Failed to load investment');
      }
    } catch (error: any) {
      console.error('Load investment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load investment';
      errorToast('Load Failed', errorMessage);
      
      if (error?.response?.status === 404) {
        navigate('/admin/dashboard');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!performanceForm.marketValue || parseFloat(performanceForm.marketValue) < 0) {
      errorToast('Validation Error', 'Please enter a valid market value');
      return;
    }

    setIsSubmittingPerformance(true);

    try {
      const response = await apiService.api.post(`/investments/${id}/performance`, {
        marketValue: parseFloat(performanceForm.marketValue),
        notes: performanceForm.notes,
        marketConditions: performanceForm.marketConditions,
        date: performanceForm.date
      });

      if (response.data.success) {
        successToast('Performance Updated', 'Daily performance has been added successfully');
        setShowAddPerformance(false);
        setPerformanceForm({
          marketValue: '',
          notes: '',
          marketConditions: 'Neutral',
          date: new Date().toISOString().split('T')[0]
        });
        
        // Reload investment data to get updated performance
        await loadInvestmentData();
      } else {
        throw new Error(response.data.message || 'Failed to add performance');
      }
    } catch (error: any) {
      console.error('Add performance error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add performance';
      errorToast('Update Failed', errorMessage);
    } finally {
      setIsSubmittingPerformance(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'High': return 'text-orange-400 bg-orange-500/20';
      case 'Very High': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-500/20';
      case 'Completed': return 'text-blue-400 bg-blue-500/20';
      case 'Paused': return 'text-yellow-400 bg-yellow-500/20';
      case 'Cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  if (isLoading) {
    return (
      <AdminDashboardLayout title="Investment Details" subtitle="Loading investment information...">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      </AdminDashboardLayout>
    );
  }

  if (!investment) {
    return (
      <AdminDashboardLayout title="Investment Not Found" subtitle="The requested investment could not be found">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Investment Not Found</h3>
          <p className="text-slate-400 mb-6">The investment you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            variant="primary"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </AdminDashboardLayout>
    );
  }

  // Prepare chart data
  const performanceChartData = performanceHistory.map(perf => ({
    date: formatDate(perf.date),
    marketValue: perf.marketValue,
    dailyChange: perf.dailyChange,
    dailyChangePercent: perf.dailyChangePercent
  }));

  const profitLoss = investment.currentValue - investment.initialAmount;
  const profitLossPercent = (profitLoss / investment.initialAmount) * 100;

  return (
    <AdminDashboardLayout
      title={investment.name}
      subtitle={`${investment.investmentType} • ${investment.subCompanyId.name}`}
    >
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="secondary"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/admin/dashboard')}
        >
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            leftIcon={<Edit size={16} />}
            onClick={() => navigate(`/admin/investments/${id}/edit`)}
          >
            Edit Investment
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setShowAddPerformance(true)}
          >
            Add Daily Performance
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Current Value"
          value={formatCurrency(investment.currentValue)}
          change={{
            value: profitLossPercent,
            type: profitLoss >= 0 ? 'increase' : 'decrease'
          }}
          icon={<DollarSign className="w-6 h-6 text-green-500" />}
          chartData={performanceChartData.slice(-7).map(d => ({ value: d.marketValue }))}
          chartType="area"
        />

        <MetricCard
          title="Profit/Loss"
          value={formatCurrency(profitLoss)}
          change={{
            value: investment.latestPerformance.dailyChangePercent,
            type: investment.latestPerformance.dailyChange >= 0 ? 'increase' : 'decrease'
          }}
          icon={profitLoss >= 0 ?
            <TrendingUp className="w-6 h-6 text-green-500" /> :
            <TrendingDown className="w-6 h-6 text-red-500" />
          }
          chartData={performanceChartData.slice(-7).map(d => ({ value: d.dailyChange }))}
          chartType="bar"
        />

        <MetricCard
          title="ROI"
          value={`${profitLossPercent.toFixed(2)}%`}
          change={{
            value: investment.expectedROI - profitLossPercent,
            type: profitLossPercent >= investment.expectedROI ? 'increase' : 'decrease'
          }}
          icon={<Target className="w-6 h-6 text-blue-500" />}
          chartData={performanceChartData.slice(-7).map(d => ({ value: d.dailyChangePercent }))}
          chartType="line"
        />

        <MetricCard
          title="Days Active"
          value={performanceSummary?.totalDays || 0}
          change={{
            value: performanceSummary?.volatility || 0,
            type: 'neutral'
          }}
          icon={<Activity className="w-6 h-6 text-purple-500" />}
          chartData={performanceChartData.slice(-7).map((_, i) => ({ value: i + 1 }))}
          chartType="line"
        />
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Performance History</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Market Value</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Daily Change</span>
              </div>
            </div>
          </div>

          {performanceChartData.length > 0 ? (
            <CustomAreaChart
              data={performanceChartData}
              xKey="date"
              areas={[
                { key: 'marketValue', name: 'Market Value', color: '#3B82F6', fillOpacity: 0.3 }
              ]}
              height={300}
              className="bg-transparent p-0"
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <p>No performance data available</p>
                <p className="text-sm mt-2">Add daily performance updates to see charts</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Daily Performance Form Modal */}
      {showAddPerformance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Add Daily Performance</h3>
              <button
                onClick={() => setShowAddPerformance(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddPerformance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={performanceForm.date}
                  onChange={(e) => setPerformanceForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Market Value
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    value={performanceForm.marketValue}
                    onChange={(e) => setPerformanceForm(prev => ({ ...prev, marketValue: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Market Conditions
                </label>
                <select
                  value={performanceForm.marketConditions}
                  onChange={(e) => setPerformanceForm(prev => ({ ...prev, marketConditions: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="Bullish">Bullish</option>
                  <option value="Bearish">Bearish</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Volatile">Volatile</option>
                  <option value="Stable">Stable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={performanceForm.notes}
                  onChange={(e) => setPerformanceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  placeholder="Add notes about market conditions or factors affecting performance..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddPerformance(false)}
                  disabled={isSubmittingPerformance}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={isSubmittingPerformance ? <LoadingSpinner size="sm" /> : <CheckCircle size={16} />}
                  disabled={isSubmittingPerformance}
                >
                  {isSubmittingPerformance ? 'Adding...' : 'Add Performance'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Performance Updates */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Recent Performance Updates</h3>

        {performanceHistory.length > 0 ? (
          <div className="space-y-4">
            {performanceHistory.slice(0, 10).map((performance) => (
              <div key={performance._id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{formatDate(performance.date)}</div>
                    <div className="text-sm text-slate-400">
                      Updated by {performance.updatedBy.firstName} {performance.updatedBy.lastName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-white font-medium">{formatCurrency(performance.marketValue)}</div>
                  <div className={`text-sm ${performance.dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {performance.dailyChange >= 0 ? '+' : ''}{formatCurrency(performance.dailyChange)}
                    ({performance.dailyChangePercent >= 0 ? '+' : ''}{performance.dailyChangePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-500" />
            <p>No performance updates yet</p>
            <p className="text-sm mt-2">Add your first daily performance update to start tracking</p>
          </div>
        )}
      </Card>
    </AdminDashboardLayout>
  );
};

export default InvestmentDetail;
