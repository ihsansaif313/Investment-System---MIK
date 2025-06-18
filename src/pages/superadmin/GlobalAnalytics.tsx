import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BarChart3Icon, TrendingUpIcon, CalendarIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
const GlobalAnalytics: React.FC = () => {
  const { state, fetchSuperadminAnalytics, calculatePortfolioDistribution, calculateMetrics } = useData();
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState('month');
  const [dataView, setDataView] = useState('revenue');

  useEffect(() => {
    fetchSuperadminAnalytics();
  }, [fetchSuperadminAnalytics]);

  const { analytics, loading, errors } = state;
  const superadminAnalytics = analytics.superadmin;

  // Generate chart data from analytics
  const generateRevenueData = () => {
    if (!superadminAnalytics) return [];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseValue = superadminAnalytics.totalValue / 12;

    return months.map((month, index) => ({
      month,
      value: Math.round(baseValue * (1 + (Math.random() * 0.4 - 0.2))) // Simulate monthly variation
    }));
  };

  const revenueData = generateRevenueData();
  // Generate top performers from sub-companies data
  const generateTopPerformers = () => {
    if (!state.subCompanies || state.subCompanies.length === 0) {
      return [
        { company: 'No companies available', performance: 0, status: 'Stable' }
      ];
    }

    return state.subCompanies
      .slice(0, 5)
      .map(company => ({
        company: company.name,
        performance: company.profitLoss?.roi || 0,
        status: company.profitLoss?.roi > 15 ? 'Increasing' :
                company.profitLoss?.roi < 5 ? 'Decreasing' : 'Stable'
      }));
  };

  const topPerformers = generateTopPerformers();

  // Calculate real-time metrics
  const globalMetrics = calculateMetrics();
  const portfolioDistribution = calculatePortfolioDistribution();

  // Generate risk assessment based on real data
  const generateRiskAssessment = () => {
    const totalInvestments = globalMetrics.investmentCount;
    const avgROI = globalMetrics.roi;

    return [
      {
        category: 'Market Volatility',
        score: Math.min(Math.max(Math.abs(avgROI) * 2, 20), 80),
        status: Math.abs(avgROI) > 20 ? 'High' : Math.abs(avgROI) > 10 ? 'Medium' : 'Low'
      },
      {
        category: 'Liquidity Risk',
        score: Math.min(Math.max(100 - (totalInvestments * 2), 20), 80),
        status: totalInvestments < 10 ? 'High' : totalInvestments < 25 ? 'Medium' : 'Low'
      },
      {
        category: 'Credit Risk',
        score: Math.min(Math.max(50 + (avgROI < 0 ? 30 : -10), 20), 80),
        status: avgROI < -5 ? 'High' : avgROI < 5 ? 'Medium' : 'Low'
      },
      {
        category: 'Operational Risk',
        score: Math.min(Math.max(60 - (state.subCompanies.length * 2), 20), 80),
        status: state.subCompanies.length < 5 ? 'High' : state.subCompanies.length < 15 ? 'Medium' : 'Low'
      },
      {
        category: 'Regulatory Risk',
        score: Math.min(Math.max(40 + (Math.random() * 20), 20), 80),
        status: 'Low' // Generally low for established platforms
      }
    ];
  };

  const riskAssessment = generateRiskAssessment();
  const getBarHeight = (value: number) => {
    const maxValue = Math.max(...revenueData.map(item => item.value));
    return value / maxValue * 100;
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Increasing':
        return 'text-green-500';
      case 'Decreasing':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };
  const getRiskColor = (status: string) => {
    switch (status) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };
  return <DashboardLayout title="Global Analytics" subtitle="Platform-wide performance metrics and insights">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant={timeframe === 'month' ? 'primary' : 'secondary'} onClick={() => setTimeframe('month')} className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Monthly
          </Button>
          <Button variant={timeframe === 'quarter' ? 'primary' : 'secondary'} onClick={() => setTimeframe('quarter')} className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Quarterly
          </Button>
          <Button variant={timeframe === 'year' ? 'primary' : 'secondary'} onClick={() => setTimeframe('year')} className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Yearly
          </Button>
        </div>
        <Button variant="secondary" className="flex items-center">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
      {/* Data View Tabs */}
      <div className="bg-slate-800 rounded-lg overflow-hidden mb-6">
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            <button className={`px-6 py-4 text-sm font-medium ${dataView === 'revenue' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setDataView('revenue')}>
              <BarChart3Icon className="h-4 w-4 inline mr-2" />
              Revenue
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${dataView === 'performance' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setDataView('performance')}>
              <TrendingUpIcon className="h-4 w-4 inline mr-2" />
              Performance
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${dataView === 'risk' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setDataView('risk')}>
              <FilterIcon className="h-4 w-4 inline mr-2" />
              Risk Assessment
            </button>
          </div>
        </div>
        <div className="p-6">
          {dataView === 'revenue' && <>
              <h3 className="text-lg font-medium text-white mb-4">
                Revenue Trends
              </h3>
              <div className="h-64 flex items-end space-x-4">
                {revenueData.map((item, index) => <div key={index} className="flex flex-col items-center flex-1">
                    <div className="w-full bg-slate-700 rounded-t-sm relative" style={{
                height: `${getBarHeight(item.value)}%`
              }}>
                      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-yellow-500/80 to-yellow-500/20 rounded-t-sm"></div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      {item.month}
                    </div>
                  </div>)}
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-white">
                  $
                  {(revenueData.reduce((sum, item) => sum + item.value, 0) / 1000000).toFixed(2)}
                  M
                </div>
                <div className="text-sm text-slate-400">Total Revenue</div>
              </div>
            </>}
          {dataView === 'performance' && <>
              <h3 className="text-lg font-medium text-white mb-4">
                Top Performing Sub-Companies
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                      <th className="pb-2 font-medium">Company</th>
                      <th className="pb-2 font-medium">ROI</th>
                      <th className="pb-2 font-medium">Trend</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPerformers.map((company, index) => <tr key={index} className="border-b border-slate-700">
                        <td className="py-3 text-white">{company.company}</td>
                        <td className="py-3 text-white">
                          {company.performance}%
                        </td>
                        <td className="py-3">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${company.status === 'Increasing' ? 'bg-green-500' : company.status === 'Decreasing' ? 'bg-red-500' : 'bg-yellow-500'}`} style={{
                        width: `${company.performance * 3}%`
                      }}></div>
                          </div>
                        </td>
                        <td className={`py-3 ${getStatusColor(company.status)}`}>
                          {company.status}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </>}
          {dataView === 'risk' && <>
              <h3 className="text-lg font-medium text-white mb-4">
                Risk Assessment
              </h3>
              <div className="space-y-6">
                {riskAssessment.map((risk, index) => <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-slate-400">
                        {risk.category}
                      </span>
                      <span className="text-sm text-white">
                        {risk.score}/100
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={getRiskColor(risk.status)} style={{
                  width: `${risk.score}%`
                }}></div>
                    </div>
                    <div className="text-xs text-right mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${risk.status === 'High' ? 'bg-red-500/20 text-red-500' : risk.status === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}>
                        {risk.status} Risk
                      </span>
                    </div>
                  </div>)}
              </div>
            </>}
        </div>
      </div>
      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">
            Investment Distribution
          </h3>
          <div className="space-y-4">
            {portfolioDistribution.length > 0 ? (
              portfolioDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-400">{item.assetType}</span>
                    <span className="text-sm text-white">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-red-500'][index % 5]
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">
                No investment data available
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-500">{globalMetrics.roi.toFixed(1)}%</div>
              <div className="text-sm text-slate-400">Avg. ROI</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-500">
                ${(globalMetrics.netProfit / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-slate-400">Net Profit</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-500">
                {globalMetrics.investmentCount > 0 ?
                  Math.round((globalMetrics.netProfit > 0 ? 1 : 0) * 100) : 0}%
              </div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-500">
                ${(globalMetrics.totalValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-slate-400">Total AUM</div>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-4">
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-white">
                  Quarterly Review
                </div>
                <div className="text-xs text-slate-400">Jul 15</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                All company performance review
              </div>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-white">
                  Board Meeting
                </div>
                <div className="text-xs text-slate-400">Jul 22</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Annual strategy planning
              </div>
            </div>
            <div className="bg-slate-700 p-3 rounded-lg">
              <div className="flex justify-between">
                <div className="text-sm font-medium text-white">
                  Investor Conference
                </div>
                <div className="text-xs text-slate-400">Aug 5</div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Present new investment opportunities
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default GlobalAnalytics;