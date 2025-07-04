import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, BuildingIcon, EditIcon, TrashIcon, UsersIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { SubCompany } from '../../types/database';
import { companyUpdates } from '../../utils/realTimeUpdates';
import apiService from '../../services/api';
import { INDUSTRY_OPTIONS, CATEGORY_OPTIONS } from '../../constants/formOptions';
import { validateCompanyForm, validateField, ValidationError } from '../../utils/validation';

interface CompanyFormData {
  name: string;
  industry: string;
  category: string;
  description: string;
  contactEmail: string;
  establishedDate: string;
  address: string;
  contactPhone: string;
  website: string;
}

const CompanyManagement: React.FC = () => {
  const { user } = useAuth();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [companies, setCompanies] = useState<SubCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<SubCompany | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
    category: '',
    description: '',
    contactEmail: '',
    establishedDate: '',
    address: '',
    contactPhone: '',
    website: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const companies = await apiService.getSubCompanies();
      setCompanies(companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      errorToast('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async () => {
    try {
      setIsSubmitting(true);

      // Validate form data
      const validation = validateCompanyForm(formData);
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(error => error.message).join(', ');
        errorToast(`Please fix the following errors: ${errorMessages}`);
        return;
      }

      // Transform formData to match CreateSubCompanyForm interface
      const createData = {
        name: formData.name,
        industry: formData.industry,
        category: formData.category || 'General',
        description: formData.description || '',
        address: formData.address || '',
        contactEmail: formData.contactEmail || '',
        contactPhone: formData.contactPhone || '',
        website: formData.website || '',
        establishedDate: formData.establishedDate || new Date().toISOString().split('T')[0]
      };

      console.log('[CompanyManagement] Creating company with data:', createData);
      const response = await apiService.createSubCompany(createData);
      console.log('[CompanyManagement] Create response:', response);

      successToast('Company created successfully');

      // Trigger real-time update
      companyUpdates.companyCreated(response);

      setShowCreateModal(false);
      resetForm();
      await fetchCompanies();
    } catch (error: any) {
      console.error('Failed to create company:', error);
      errorToast(error.response?.data?.message || 'Failed to create company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCompany = async () => {
    try {
      if (!editingCompany) {
        errorToast('No company selected for editing');
        return;
      }

      setIsSubmitting(true);

      // Validate form data
      const validation = validateCompanyForm(formData);
      if (!validation.isValid) {
        const errorMessages = validation.errors.map(error => error.message).join(', ');
        errorToast(`Please fix the following errors: ${errorMessages}`);
        return;
      }

      console.log('[CompanyManagement] Updating company with data:', formData);
      const response = await apiService.updateSubCompany(editingCompany.id, formData);
      console.log('[CompanyManagement] Update response:', response);

      successToast('Company updated successfully');

      // Trigger real-time update
      companyUpdates.companyUpdated(response);

      setShowEditModal(false);
      setEditingCompany(null);
      resetForm();

      // Refresh companies list immediately
      await fetchCompanies();
    } catch (error: any) {
      console.error('Failed to update company:', error);
      errorToast(error.response?.data?.message || 'Failed to update company');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.deleteSubCompany(companyId);
      successToast('Company deleted successfully');

      // Trigger real-time update
      companyUpdates.companyDeleted(companyId);

      fetchCompanies();
    } catch (error: any) {
      console.error('Failed to delete company:', error);
      errorToast(error.response?.data?.message || 'Failed to delete company');
    }
  };

  const openEditModal = (company: SubCompany) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry,
      category: company.category || 'General',
      description: company.description || '',
      contactEmail: company.contact_email || '',
      establishedDate: company.established_date ? new Date(company.established_date).toISOString().split('T')[0] : '',
      address: company.address || '',
      contactPhone: company.phone || '',
      website: (company as any).website || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      category: '',
      description: '',
      contactEmail: '',
      establishedDate: '',
      address: '',
      contactPhone: '',
      website: ''
    });
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };

  return (
    <DashboardLayout title="Company Management" subtitle="Create and manage companies">
      <div className="mb-4 sm:mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 lg:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            />
            <SearchIcon className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-auto bg-slate-700 border border-slate-600 rounded-md py-2 pl-3 sm:pl-4 pr-8 sm:pr-10 text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <FilterIcon className="absolute right-2.5 sm:right-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center w-full lg:w-auto"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="hidden sm:inline">New Company</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Industry</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Established</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-slate-700">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-slate-700"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-slate-700 rounded"></div>
                          <div className="h-3 w-16 bg-slate-700 rounded mt-1"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-20 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-32 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-slate-600 flex items-center justify-center">
                          <BuildingIcon className="h-5 w-5 text-slate-300" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-white">{company.name}</div>
                          <div className="text-sm text-slate-400">ID: {company.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{company.industry}</td>
                    <td className="p-4 text-slate-300">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        {company.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{company.contact_email}</td>
                    <td className="p-4 text-slate-300">
                      {company.established_date ? new Date(company.established_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status || 'active')}`}>
                        {company.status ? (company.status.charAt(0).toUpperCase() + company.status.slice(1)) : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditModal(company)}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCompany(company.id, company.name)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="text-slate-400">
                      <BuildingIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Companies Found</h3>
                      <p className="mb-4">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'No companies match your current search criteria.' 
                          : 'No companies have been created yet.'}
                      </p>
                      <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                        Create First Company
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <BuildingIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Total Companies</h3>
          </div>
          <p className="text-3xl font-bold text-white">{companies.length}</p>
          <p className="text-sm text-slate-400">Across all industries</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <UsersIcon className="h-5 w-5 text-green-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Active Companies</h3>
          </div>
          <p className="text-3xl font-bold text-green-500">
            {companies.filter(c => (c.status || 'active') === 'active').length}
          </p>
          <p className="text-sm text-slate-400">Currently operational</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <FilterIcon className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-white">Industries</h3>
          </div>
          <p className="text-3xl font-bold text-blue-500">
            {new Set(companies.map(c => c.industry)).size}
          </p>
          <p className="text-sm text-slate-400">Different sectors</p>
        </div>
      </div>

      {/* Create Company Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Company"
      >
        <CompanyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCompany}
          onCancel={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          submitLabel="Create Company"
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCompany(null);
          resetForm();
        }}
        title="Edit Company"
      >
        <CompanyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditCompany}
          onCancel={() => {
            setShowEditModal(false);
            setEditingCompany(null);
            resetForm();
          }}
          submitLabel="Update Company"
          isSubmitting={isSubmitting}
        />
      </Modal>
    </DashboardLayout>
  );
};

// Company Form Component
interface CompanyFormProps {
  formData: CompanyFormData;
  setFormData: (data: CompanyFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
  isSubmitting = false
}) => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Validate form whenever formData changes
  useEffect(() => {
    const validation = validateCompanyForm(formData);
    setIsFormValid(validation.isValid);
  }, [formData]);

  const handleFieldChange = (fieldName: keyof CompanyFormData, value: string) => {
    // Update form data
    setFormData({ ...formData, [fieldName]: value });

    // Mark field as touched
    setTouched({ ...touched, [fieldName]: true });

    // Validate field in real-time
    const error = validateField(fieldName, value, formData);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error ? error.message : ''
    }));
  };

  const handleFieldBlur = (fieldName: keyof CompanyFormData) => {
    setTouched({ ...touched, [fieldName]: true });

    // Validate field on blur
    const error = validateField(fieldName, formData[fieldName], formData);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: error ? error.message : ''
    }));
  };

  const handleSubmit = () => {
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);

    // Validate entire form
    const validation = validateCompanyForm(formData);

    if (!validation.isValid) {
      // Set all validation errors
      const errors = validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>);
      setFieldErrors(errors);
      return;
    }

    onSubmit();
  };

  const getFieldError = (fieldName: string): string => {
    return touched[fieldName] ? fieldErrors[fieldName] || '' : '';
  };

  const getFieldClassName = (fieldName: string): string => {
    const baseClass = "w-full bg-slate-700 border rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 transition-colors";
    const hasError = touched[fieldName] && fieldErrors[fieldName];

    if (hasError) {
      return `${baseClass} border-red-500 focus:ring-red-500`;
    }
    return `${baseClass} border-slate-600 focus:ring-yellow-500`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleFieldBlur('name')}
            className={getFieldClassName('name')}
            placeholder="Enter company name"
            disabled={isSubmitting}
          />
          {getFieldError('name') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('name')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) => handleFieldChange('industry', e.target.value)}
            onBlur={() => handleFieldBlur('industry')}
            className={getFieldClassName('industry')}
            disabled={isSubmitting}
          >
            <option value="">Select an industry</option>
            {INDUSTRY_OPTIONS.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          {getFieldError('industry') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('industry')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            onBlur={() => handleFieldBlur('category')}
            className={getFieldClassName('category')}
            disabled={isSubmitting}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {getFieldError('category') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('category')}</p>
          )}
        </div>
        <div></div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          onBlur={() => handleFieldBlur('description')}
          className={getFieldClassName('description')}
          rows={3}
          placeholder="Brief description of the company"
          disabled={isSubmitting}
        />
        {getFieldError('description') && (
          <p className="mt-1 text-sm text-red-400">{getFieldError('description')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
            onBlur={() => handleFieldBlur('contactEmail')}
            className={getFieldClassName('contactEmail')}
            placeholder="contact@company.com"
            disabled={isSubmitting}
          />
          {getFieldError('contactEmail') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('contactEmail')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
            onBlur={() => handleFieldBlur('contactPhone')}
            className={getFieldClassName('contactPhone')}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
          {getFieldError('contactPhone') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('contactPhone')}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Established Date
          </label>
          <input
            type="date"
            value={formData.establishedDate}
            onChange={(e) => handleFieldChange('establishedDate', e.target.value)}
            onBlur={() => handleFieldBlur('establishedDate')}
            className={getFieldClassName('establishedDate')}
            disabled={isSubmitting}
          />
          {getFieldError('establishedDate') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('establishedDate')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleFieldChange('website', e.target.value)}
            onBlur={() => handleFieldBlur('website')}
            className={getFieldClassName('website')}
            placeholder="https://company.com"
            disabled={isSubmitting}
          />
          {getFieldError('website') && (
            <p className="mt-1 text-sm text-red-400">{getFieldError('website')}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => handleFieldChange('address', e.target.value)}
          onBlur={() => handleFieldBlur('address')}
          className={getFieldClassName('address')}
          rows={2}
          placeholder="Company address"
          disabled={isSubmitting}
        />
        {getFieldError('address') && (
          <p className="mt-1 text-sm text-red-400">{getFieldError('address')}</p>
        )}
      </div>

      {/* Validation Summary */}
      {!isFormValid && Object.keys(touched).length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-400 mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-red-300 space-y-1">
            {Object.entries(fieldErrors).filter(([_, error]) => error).map(([field, error]) => (
              <li key={field}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default CompanyManagement;
