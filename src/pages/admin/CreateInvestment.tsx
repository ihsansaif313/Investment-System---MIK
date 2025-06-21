import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  AlertTriangle,
  Building,
  Target,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import apiService from '../../services/api';

interface InvestmentFormData {
  name: string;
  description: string;
  investmentType: string;
  category: string;
  initialAmount: number;
  expectedROI: number;
  riskLevel: string;
  subCompanyId: string;
  assetId?: string;
  investmentDate: string;
  startDate: string;
  endDate?: string;
  notes: string;
  tags: string[];
  minInvestment: number;
  maxInvestment?: number;
}

const CreateInvestment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedCompany } = useCompanySelection();
  const { state, fetchSubCompanies, fetchAssets } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState<InvestmentFormData>({
    name: '',
    description: '',
    investmentType: 'Stocks',
    category: '',
    initialAmount: 0,
    expectedROI: 0,
    riskLevel: 'Medium',
    subCompanyId: selectedCompany?.id || '',
    assetId: '',
    investmentDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    notes: '',
    tags: [],
    minInvestment: 0,
    maxInvestment: undefined
  });

  const investmentTypes = [
    'Stocks', 'Bonds', 'Real Estate', 'Cryptocurrency', 'Commodities',
    'Mutual Funds', 'ETF', 'Private Equity', 'Venture Capital', 'Other'
  ];

  const riskLevels = ['Low', 'Medium', 'High', 'Very High'];

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchSubCompanies(),
          fetchAssets()
        ]);
      } catch (error) {
        console.error('Failed to load form data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedCompany?.id) {
      setFormData(prev => ({ ...prev, subCompanyId: selectedCompany.id }));
    }
  }, [selectedCompany]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Investment name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Investment name must be at least 2 characters';
    }

    if (!formData.subCompanyId) {
      newErrors.subCompanyId = 'Company selection is required';
    }

    if (formData.initialAmount <= 0) {
      newErrors.initialAmount = 'Initial amount must be greater than 0';
    }

    if (formData.expectedROI < -100 || formData.expectedROI > 10000) {
      newErrors.expectedROI = 'Expected ROI must be between -100% and 10000%';
    }

    if (formData.minInvestment < 0) {
      newErrors.minInvestment = 'Minimum investment cannot be negative';
    }

    if (formData.maxInvestment && formData.maxInvestment < formData.minInvestment) {
      newErrors.maxInvestment = 'Maximum investment must be greater than minimum investment';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      errorToast('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        assetId: formData.assetId || undefined,
        endDate: formData.endDate || undefined,
        maxInvestment: formData.maxInvestment || undefined
      };

      const response = await apiService.api.post('/investments', submitData);

      if (response.data.success) {
        successToast('Investment Created', 'Investment has been created successfully');
        navigate('/admin/dashboard');
      } else {
        throw new Error(response.data.message || 'Failed to create investment');
      }
    } catch (error: any) {
      console.error('Create investment error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create investment';
      errorToast('Creation Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const { subCompanies, assets } = state;

  return (
    <AdminDashboardLayout
      title="Create New Investment"
      subtitle="Add a new investment opportunity for your company"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/admin/dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                <p className="text-sm text-slate-400">Enter the basic details of your investment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Investment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter investment name"
                  error={errors.name}
                  required
                  fullWidth
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the investment opportunity..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Investment Type <span className="text-red-400">*</span>
                </label>
                <select
                  name="investmentType"
                  value={formData.investmentType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  {investmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <Input
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Technology, Healthcare"
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Financial Details */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Financial Details</h3>
                <p className="text-sm text-slate-400">Set the financial parameters for this investment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Initial Amount"
                  name="initialAmount"
                  type="number"
                  value={formData.initialAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  leftIcon={<DollarSign size={16} />}
                  error={errors.initialAmount}
                  required
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Expected ROI (%)"
                  name="expectedROI"
                  type="number"
                  step="0.01"
                  value={formData.expectedROI}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  leftIcon={<TrendingUp size={16} />}
                  error={errors.expectedROI}
                  required
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Minimum Investment"
                  name="minInvestment"
                  type="number"
                  value={formData.minInvestment}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  leftIcon={<DollarSign size={16} />}
                  error={errors.minInvestment}
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Maximum Investment (Optional)"
                  name="maxInvestment"
                  type="number"
                  value={formData.maxInvestment || ''}
                  onChange={handleInputChange}
                  placeholder="No limit"
                  leftIcon={<DollarSign size={16} />}
                  error={errors.maxInvestment}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Risk Level <span className="text-red-400">*</span>
                </label>
                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  {riskLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Company and Asset Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Company & Asset</h3>
                <p className="text-sm text-slate-400">Select the company and optional asset for this investment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company <span className="text-red-400">*</span>
                </label>
                <select
                  name="subCompanyId"
                  value={formData.subCompanyId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a company</option>
                  {subCompanies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name} - {company.industry}
                    </option>
                  ))}
                </select>
                {errors.subCompanyId && (
                  <p className="mt-1 text-sm text-red-400">{errors.subCompanyId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Asset (Optional)
                </label>
                <select
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">No specific asset</option>
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} - {asset.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Timeline</h3>
                <p className="text-sm text-slate-400">Set the investment timeline and important dates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Input
                  label="Investment Date"
                  name="investmentDate"
                  type="date"
                  value={formData.investmentDate}
                  onChange={handleInputChange}
                  leftIcon={<Calendar size={16} />}
                  required
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  leftIcon={<Calendar size={16} />}
                  error={errors.startDate}
                  required
                  fullWidth
                />
              </div>

              <div>
                <Input
                  label="End Date (Optional)"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  leftIcon={<Calendar size={16} />}
                  error={errors.endDate}
                  fullWidth
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Additional Information</h3>
                <p className="text-sm text-slate-400">Add notes and tags for better organization</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes or important information..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-yellow-300"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/dashboard')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={isLoading ? <LoadingSpinner size="sm" /> : <Save size={16} />}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Investment'}
            </Button>
          </div>
        </form>
      </div>
    </AdminDashboardLayout>
  );
};

export default CreateInvestment;
