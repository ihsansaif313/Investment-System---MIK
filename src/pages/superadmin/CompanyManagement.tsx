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

interface CompanyFormData {
  name: string;
  industry: string;
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
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
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
      if (!formData.name || !formData.industry || !formData.contactEmail) {
        errorToast('Please fill in all required fields');
        return;
      }

      const response = await apiService.createSubCompany(formData);
      successToast('Company created successfully');

      // Trigger real-time update
      companyUpdates.companyCreated(response);

      setShowCreateModal(false);
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      console.error('Failed to create company:', error);
      errorToast(error.response?.data?.message || 'Failed to create company');
    }
  };

  const handleEditCompany = async () => {
    try {
      if (!editingCompany || !formData.name || !formData.industry || !formData.contactEmail) {
        errorToast('Please fill in all required fields');
        return;
      }

      const response = await apiService.updateSubCompany(editingCompany.id, formData);
      successToast('Company updated successfully');

      // Trigger real-time update
      companyUpdates.companyUpdated(response);

      setShowEditModal(false);
      setEditingCompany(null);
      resetForm();
      fetchCompanies();
    } catch (error: any) {
      console.error('Failed to update company:', error);
      errorToast(error.response?.data?.message || 'Failed to update company');
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
      description: company.description || '',
      contactEmail: company.contact_email || '',
      establishedDate: company.established_date ? new Date(company.established_date).toISOString().split('T')[0] : '',
      address: company.address || '',
      contactPhone: company.phone || '',
      website: company.website || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Company
        </Button>
      </div>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">Company</th>
                <th className="p-4 font-medium">Industry</th>
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
                    <td className="p-4 text-slate-300">{company.contact_email}</td>
                    <td className="p-4 text-slate-300">
                      {company.established_date ? new Date(company.established_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
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
                  <td colSpan={6} className="p-8 text-center">
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
            {companies.filter(c => c.status === 'active').length}
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
}

const CompanyForm: React.FC<CompanyFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel
}) => {
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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Enter company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Industry *
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="e.g., Technology, Finance"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          rows={3}
          placeholder="Brief description of the company"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Email *
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="contact@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Contact Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="+1 (555) 123-4567"
          />
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
            onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="https://company.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Address
        </label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
          rows={2}
          placeholder="Company address"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
};

export default CompanyManagement;
