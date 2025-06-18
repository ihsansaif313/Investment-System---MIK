import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { InvestmentWithDetails, InvestmentFilters, InvestForm } from '../../types/database';
const Marketplace: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    state,
    fetchInvestments,
    createInvestorInvestment
  } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [filters, setFilters] = useState<InvestmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentWithDetails | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  useEffect(() => {
    const loadInvestments = async () => {
      try {
        await fetchInvestments(filters);
      } catch (error) {
        errorToast('Failed to load investments', 'Please try refreshing the page');
      }
    };

    loadInvestments();
  }, [filters]);
  const { investments, loading } = state;

  // Handle investment
  const handleInvest = async () => {
    if (!selectedInvestment || !user?.id || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount < (selectedInvestment.min_investment || 0)) {
      errorToast('Invalid amount', `Minimum investment is $${selectedInvestment.min_investment?.toLocaleString()}`);
      return;
    }

    try {
      await createInvestorInvestment({
        investment_id: selectedInvestment.id,
        amount_invested: amount
      });
      successToast('Investment successful!', 'Your investment has been processed');
      setShowInvestModal(false);
      setSelectedInvestment(null);
      setInvestmentAmount('');
    } catch (error) {
      errorToast('Investment failed', 'Please try again');
    }
  };

  // Filter investments based on search and filters
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.asset.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || filters.status.includes(investment.status);
    const matchesAssetType = !filters.assetType || filters.assetType.includes(investment.asset.type);
    const matchesRiskLevel = !filters.riskLevel || filters.riskLevel.includes(investment.risk_level);

    return matchesSearch && matchesStatus && matchesAssetType && matchesRiskLevel;
  });

  // Featured investments (high ROI or new)
  const featuredInvestments = filteredInvestments.filter(inv =>
    (inv.expected_roi && inv.expected_roi > 15) ||
    new Date(inv.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000) // Last 7 days
  ).slice(0, 4);
  // Utility functions
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-500/20 text-red-500';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Low':
        return 'bg-green-500/20 text-green-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type) {
      case 'Stock':
        return 'bg-blue-500/20 text-blue-500';
      case 'Crypto':
        return 'bg-purple-500/20 text-purple-500';
      case 'RealEstate':
        return 'bg-green-500/20 text-green-500';
      case 'Business':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  return (
    <DashboardLayout title="Investment Marketplace" subtitle="Discover and invest in new opportunities">
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
              className="w-64"
            />
          </div>
          <Button
            variant="secondary"
            leftIcon={<Filter size={16} />}
            onClick={() => {/* TODO: Open filter modal */}}
          >
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>{filteredInvestments.length} opportunities available</span>
        </div>
      </div>
      {/* Featured Opportunities */}
      {featuredInvestments.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-xl font-semibold text-white">Featured Opportunities</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredInvestments.map((investment) => (
              <Card key={investment.id} className="border border-yellow-500/30 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {investment.asset.logo && (
                      <img src={investment.asset.logo} alt={investment.asset.name} className="w-10 h-10 rounded-full" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{investment.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(investment.asset.type)}`}>
                        {investment.asset.type}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(investment.risk_level)}`}>
                    {investment.risk_level} Risk
                  </span>
                </div>

                <p className="text-slate-400 mb-4 line-clamp-2">
                  {investment.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Min. Investment</p>
                    <p className="text-white font-medium">${investment.min_investment?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Expected ROI</p>
                    <p className="text-yellow-500 font-medium">{investment.expected_roi}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Current Value</p>
                    <p className="text-white font-medium">${investment.current_value.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Investors</p>
                    <p className="text-white font-medium">{investment.totalInvestors}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    leftIcon={<Eye size={16} />}
                    onClick={() => navigate(`/investor/investments/${investment.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<Plus size={16} />}
                    onClick={() => {
                      setSelectedInvestment(investment);
                      setShowInvestModal(true);
                    }}
                  >
                    Invest Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      {/* All Opportunities */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">All Opportunities</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestments.map((investment) => (
            <Card key={investment.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {investment.asset.logo && (
                    <img src={investment.asset.logo} alt={investment.asset.name} className="w-8 h-8 rounded-full" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{investment.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(investment.asset.type)}`}>
                      {investment.asset.type}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(investment.risk_level)}`}>
                  {investment.risk_level} Risk
                </span>
              </div>

              <p className="text-slate-400 mb-4 line-clamp-2">
                {investment.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Min. Investment</p>
                  <p className="text-white font-medium">${investment.min_investment?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Expected ROI</p>
                  <p className="text-yellow-500 font-medium">{investment.expected_roi}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Current Value</p>
                  <p className="text-white font-medium">${investment.current_value.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    investment.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                    investment.status === 'Completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {investment.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Eye size={14} />}
                  onClick={() => navigate(`/investor/investments/${investment.id}`)}
                >
                  Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={14} />}
                  onClick={() => {
                    setSelectedInvestment(investment);
                    setShowInvestModal(true);
                  }}
                >
                  Invest
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredInvestments.length === 0 && (
          <Card className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No investment opportunities found matching your criteria</p>
          </Card>
        )}
      </div>

      {/* Investment Modal */}
      <Modal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        title="Make Investment"
        size="md"
      >
        {selectedInvestment && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-slate-700 rounded-lg">
              {selectedInvestment.asset.logo && (
                <img src={selectedInvestment.asset.logo} alt={selectedInvestment.asset.name} className="w-10 h-10 rounded-full" />
              )}
              <div>
                <h3 className="font-medium text-white">{selectedInvestment.name}</h3>
                <p className="text-sm text-slate-400">{selectedInvestment.asset.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Min. Investment</p>
                <p className="text-white font-medium">${selectedInvestment.min_investment?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Expected ROI</p>
                <p className="text-yellow-500 font-medium">{selectedInvestment.expected_roi}%</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Investment Amount
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                leftIcon={<DollarSign size={16} />}
              />
              <p className="text-xs text-slate-400 mt-1">
                Minimum: ${selectedInvestment.min_investment?.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowInvestModal(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInvest}
                fullWidth
                disabled={!investmentAmount || parseFloat(investmentAmount) < (selectedInvestment.min_investment || 0)}
              >
                Invest Now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};
export default Marketplace;