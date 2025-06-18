import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, EditIcon, TrashIcon, PlusIcon, UserPlusIcon, ShieldIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import { useCompany } from '../../contexts/CompanyContext';
import { useInvestment } from '../../contexts/InvestmentContext';
import AddAdminForm from '../../components/superadmin/AddAdminForm';
const SubCompanyDetail: React.FC = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    companies,
    getCompanyById
  } = useCompany();
  const {
    investments,
    fetchInvestments,
    loading: loadingInvestments
  } = useInvestment();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);
  const [admins, setAdmins] = useState<Array<{
    id: string;
    name: string;
    email: string;
    title: string;
    status: 'active' | 'inactive';
    lastActive: string;
  }>>([{
    id: 'adm1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    title: 'Lead Administrator',
    status: 'active',
    lastActive: '2023-05-21 14:30:45'
  }]);
  useEffect(() => {
    if (id) {
      fetchInvestments(id);
    }
  }, [id]);
  // Find company by ID
  const company = getCompanyById(id || '') || {
    id: id || 'unknown',
    name: 'Tech Innovations Inc.',
    industry: 'Technology',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=100&h=100&auto=format&fit=crop',
    performance: {
      profit: 1250000,
      loss: 450000,
      roi: 18.5
    },
    status: 'active',
    description: 'A leading technology company focused on innovative solutions for enterprise clients.',
    founded: '2018',
    location: 'San Francisco, CA',
    employees: 120,
    website: 'techinnovations.example.com',
    contacts: [{
      name: 'John Smith',
      position: 'CEO',
      email: 'john@example.com'
    }, {
      name: 'Sarah Johnson',
      position: 'CFO',
      email: 'sarah@example.com'
    }]
  };
  const handleBack = () => {
    navigate('/superadmin/companies');
  };
  const handleAddAdmin = () => {
    setShowAddAdminForm(true);
  };
  const handleAdminAdded = () => {
    // In a real app, we would refresh the admin list from the API
    // For now, just add a mock admin to the list
    const newAdmin = {
      id: `adm${admins.length + 1}`,
      name: 'New Admin',
      email: 'newadmin@example.com',
      title: 'Company Administrator',
      status: 'active' as const,
      lastActive: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setAdmins([...admins, newAdmin]);
  };
  return <DashboardLayout title={company.name} subtitle={`${company.industry} - ${company.status.charAt(0).toUpperCase() + company.status.slice(1)}`}>
      <div className="mb-6 flex justify-between items-center">
        <Button variant="secondary" onClick={handleBack} className="flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Companies
        </Button>
        <div className="flex space-x-3">
          <Button variant="secondary" className="flex items-center">
            <EditIcon className="h-4 w-4 mr-2" />
            Edit Company
          </Button>
          <Button variant="danger" className="flex items-center">
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      {/* Company Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-800/80 rounded-lg p-6 mb-6 shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center">
          <img src={company.logo} alt={company.name} className="h-20 w-20 rounded-lg object-cover mr-6 mb-4 md:mb-0" />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {company.name}
                </h1>
                <p className="text-slate-400">{company.industry}</p>
              </div>
              <div className="mt-3 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${company.status === 'active' ? 'bg-green-500/20 text-green-500' : company.status === 'inactive' ? 'bg-slate-500/20 text-slate-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-sm text-slate-400">Net Profit</p>
                <p className="text-lg font-medium text-green-500">
                  $
                  {(company.performance.profit - company.performance.loss).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">ROI</p>
                <p className="text-lg font-medium text-yellow-500">
                  {company.performance.roi}%
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Founded</p>
                <p className="text-lg font-medium text-white">
                  {company.founded}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'overview' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('overview')}>
              Overview
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'investments' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('investments')}>
              Investments
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'admins' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('admins')}>
              Administrators
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'contacts' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('contacts')}>
              Contacts
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'documents' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('documents')}>
              Documents
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'overview' && <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Company Description
                </h3>
                <p className="text-slate-400">{company.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-md border border-slate-600/30">
                  <h4 className="text-md font-medium text-white mb-3">
                    Company Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Industry:</span>
                      <span className="text-white">{company.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Founded:</span>
                      <span className="text-white">{company.founded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Location:</span>
                      <span className="text-white">{company.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Employees:</span>
                      <span className="text-white">{company.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Website:</span>
                      <span className="text-blue-400">{company.website}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/50 p-4 rounded-lg shadow-md border border-slate-600/30">
                  <h4 className="text-md font-medium text-white mb-3">
                    Financial Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gross Profit:</span>
                      <span className="text-green-500">
                        ${company.performance.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expenses:</span>
                      <span className="text-red-500">
                        ${company.performance.loss.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Net Profit:</span>
                      <span className="text-white">
                        $
                        {(company.performance.profit - company.performance.loss).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ROI:</span>
                      <span className="text-yellow-500">
                        {company.performance.roi}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${company.status === 'active' ? 'bg-green-500/20 text-green-500' : company.status === 'inactive' ? 'bg-slate-500/20 text-slate-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          {activeTab === 'investments' && <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Investment Projects
                </h3>
                <Button variant="primary" size="sm" className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Project
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                      <th className="pb-2 font-medium">Project Name</th>
                      <th className="pb-2 font-medium">Type</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">ROI</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingInvestments ? <tr>
                        <td colSpan={6} className="py-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
                        </td>
                      </tr> : investments.length > 0 ? investments.map(investment => <tr key={investment.id} className="border-b border-slate-700">
                          <td className="py-3 text-white">{investment.name}</td>
                          <td className="py-3 text-slate-300">
                            {investment.type}
                          </td>
                          <td className="py-3 text-white">
                            ${investment.amount.toLocaleString()}
                          </td>
                          <td className="py-3 text-yellow-500">
                            {investment.roi}%
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${investment.status === 'Performing' ? 'bg-green-500/20 text-green-500' : investment.status === 'At Risk' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                              {investment.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>) : <tr>
                        <td colSpan={6} className="py-4 text-center text-slate-400">
                          No investments found
                        </td>
                      </tr>}
                  </tbody>
                </table>
              </div>
            </div>}
          {activeTab === 'admins' && <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Company Administrators
                </h3>
                <Button variant="primary" size="sm" className="flex items-center" onClick={handleAddAdmin}>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Administrator
                </Button>
              </div>
              {admins.length > 0 ? <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Email</th>
                        <th className="pb-3 font-medium">Title</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Last Active</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map(admin => <tr key={admin.id} className="border-b border-slate-700">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-white">
                                {admin.name.charAt(0)}
                              </div>
                              <span className="ml-3 text-white">
                                {admin.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-slate-300">{admin.email}</td>
                          <td className="py-3 text-slate-300">{admin.title}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${admin.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-slate-500/20 text-slate-500'}`}>
                              {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300">
                            {admin.lastActive}
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white">
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-red-500">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div> : <div className="bg-slate-700/50 rounded-lg p-8 text-center border border-slate-600/30">
                  <ShieldIcon className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">
                    No administrators have been added to this company yet
                  </p>
                  <Button variant="secondary" className="mx-auto flex items-center" onClick={handleAddAdmin}>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Add Your First Administrator
                  </Button>
                </div>}
            </div>}
          {activeTab === 'contacts' && <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Key Contacts</h3>
                <Button variant="primary" size="sm" className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.contacts && company.contacts.map((contact, index) => <div key={index} className="bg-slate-700/50 p-4 rounded-lg shadow-md border border-slate-600/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">
                            {contact.name}
                          </h4>
                          <p className="text-sm text-slate-400">
                            {contact.position}
                          </p>
                          <p className="text-sm text-blue-400 mt-1">
                            {contact.email}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 rounded-full hover:bg-slate-600 text-slate-400 hover:text-white">
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 rounded-full hover:bg-slate-600 text-slate-400 hover:text-white">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>)}
                {(!company.contacts || company.contacts.length === 0) && <div className="col-span-full text-center py-8">
                    <p className="text-slate-400">No contacts found</p>
                  </div>}
              </div>
            </div>}
          {activeTab === 'documents' && <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Documents</h3>
                <Button variant="primary" size="sm" className="flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-8 text-center border border-slate-600/30">
                <p className="text-slate-400">No documents uploaded yet</p>
                <Button variant="secondary" className="mt-4 flex items-center mx-auto">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            </div>}
        </div>
      </div>
      {/* Add Admin Modal */}
      {showAddAdminForm && <AddAdminForm companyId={company.id} companyName={company.name} onClose={() => setShowAddAdminForm(false)} onAdminAdded={handleAdminAdded} />}
    </DashboardLayout>;
};
export default SubCompanyDetail;