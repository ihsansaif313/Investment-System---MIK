import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CreditCard,
  DollarSign,
  Target,
  Clock,
  TrendingUp,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useSuccessToast, useErrorToast } from '../ui/Toast';
import { CreateInvestorForm } from '../../types/database';
import apiService from '../../services/api';

interface CreateInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId: string;
}

const RISK_TOLERANCE_OPTIONS = [
  { value: 'low', label: 'Low Risk', description: 'Conservative investments with stable returns' },
  { value: 'medium', label: 'Medium Risk', description: 'Balanced portfolio with moderate growth potential' },
  { value: 'high', label: 'High Risk', description: 'Aggressive investments with high growth potential' }
];

const TIME_HORIZON_OPTIONS = [
  { value: 'short', label: 'Short Term (1-3 years)', description: 'Quick returns and liquidity' },
  { value: 'medium', label: 'Medium Term (3-7 years)', description: 'Balanced growth and stability' },
  { value: 'long', label: 'Long Term (7+ years)', description: 'Maximum growth potential' }
];

const SECTOR_OPTIONS = [
  'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Energy',
  'Manufacturing', 'Retail', 'Transportation', 'Education', 'Entertainment'
];

const INVESTMENT_GOALS = [
  'Retirement Planning', 'Wealth Building', 'Income Generation', 'Capital Preservation',
  'Education Funding', 'Emergency Fund', 'Business Investment', 'Real Estate Purchase'
];

const CreateInvestorModal: React.FC<CreateInvestorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  companyId
}) => {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CreateInvestorForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
    dateOfBirth: '',
    investmentPreferences: {
      riskTolerance: 'medium',
      preferredSectors: [],
      investmentGoals: [],
      timeHorizon: 'medium'
    },
    initialInvestmentAmount: undefined,
    notes: ''
  });
  
  const [errors, setErrors] = useState<Partial<CreateInvestorForm>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof CreateInvestorForm],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name as keyof CreateInvestorForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleArrayChange = (field: 'preferredSectors' | 'investmentGoals', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      investmentPreferences: {
        ...prev.investmentPreferences!,
        [field]: checked
          ? [...(prev.investmentPreferences?.[field] || []), value]
          : (prev.investmentPreferences?.[field] || []).filter(item => item !== value)
      }
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CreateInvestorForm> = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.cnic.trim()) newErrors.cnic = 'CNIC is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsLoading(true);
    
    try {
      const response = await apiService.createInvestor({
        ...formData,
        companyId
      });

      // Show different success messages based on email delivery
      if (response.emailSent) {
        successToast(
          'Investor Created Successfully!',
          'Welcome email with login instructions has been sent to the investor.'
        );
      } else {
        successToast(
          'Investor Created Successfully!',
          `Account created but email could not be sent. Temporary password: ${response.temporaryPassword || 'Please check with administrator'}`
        );
      }

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cnic: '',
        address: '',
        dateOfBirth: '',
        investmentPreferences: {
          riskTolerance: 'medium',
          preferredSectors: [],
          investmentGoals: [],
          timeHorizon: 'medium'
        },
        initialInvestmentAmount: undefined,
        notes: ''
      });
      setCurrentStep(1);
      
    } catch (error: any) {
      console.error('Create investor error:', error);
      errorToast(
        'Failed to Create Investor',
        error.response?.data?.message || 'An error occurred while creating the investor account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Personal Information</h3>
        <p className="text-slate-400 text-sm">Basic details for the investor account</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            First Name *
          </label>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter first name"
            leftIcon={<User size={16} />}
            error={errors.firstName}
            disabled={isLoading}
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Last Name *
          </label>
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter last name"
            leftIcon={<User size={16} />}
            error={errors.lastName}
            disabled={isLoading}
            fullWidth
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email Address *
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email address"
          leftIcon={<Mail size={16} />}
          error={errors.email}
          disabled={isLoading}
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Phone Number *
        </label>
        <Input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Enter phone number"
          leftIcon={<Phone size={16} />}
          error={errors.phone}
          disabled={isLoading}
          fullWidth
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Identity & Address</h3>
        <p className="text-slate-400 text-sm">Identity verification and contact details</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          CNIC *
        </label>
        <Input
          name="cnic"
          value={formData.cnic}
          onChange={handleInputChange}
          placeholder="Enter CNIC number"
          leftIcon={<CreditCard size={16} />}
          error={errors.cnic}
          disabled={isLoading}
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Date of Birth *
        </label>
        <Input
          type="date"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleInputChange}
          leftIcon={<Calendar size={16} />}
          error={errors.dateOfBirth}
          disabled={isLoading}
          fullWidth
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Address *
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter complete address"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-colors resize-none"
          rows={3}
          disabled={isLoading}
        />
        {errors.address && (
          <p className="text-red-400 text-sm mt-1">{errors.address}</p>
        )}
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Investor Account</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-yellow-500 text-white'
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {step < currentStep ? <CheckCircle size={16} /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-yellow-500' : 'bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Ready to Create Account</h3>
              <p className="text-slate-400 mb-6">
                All information has been collected. Click create to set up the investor account.
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={isLoading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <Button
            variant="primary"
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            isLoading={isLoading}
            leftIcon={currentStep === 3 ? <CheckCircle size={16} /> : undefined}
          >
            {currentStep === 3 ? 'Create Investor' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateInvestorModal;
