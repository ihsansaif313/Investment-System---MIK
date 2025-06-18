import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, ArrowUpDownIcon, BuildingIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import { useCompany } from '../../contexts/CompanyContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
const Companies: React.FC = () => {
  const {
    companies,
    fetchCompanies,
    loading
  } = useCompany();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  useEffect(() => {
    fetchCompanies();
  }, []);
  const handleCreateCompany = () => {
    navigate('/superadmin/company/new');
  };
  const handleViewCompany = (id: string) => {
    navigate(`/superadmin/company/${id}`);
  };
  // Filter and sort companies
  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    return company.status === filter;
  }).filter(company => company.name.toLowerCase().includes(searchTerm.toLowerCase()) || company.industry.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else if (sortBy === 'roi') {
      return sortOrder === 'asc' ? a.performance.roi - b.performance.roi : b.performance.roi - a.performance.roi;
    } else if (sortBy === 'profit') {
      const profitA = a.performance.profit - a.performance.loss;
      const profitB = b.performance.profit - b.performance.loss;
      return sortOrder === 'asc' ? profitA - profitB : profitB - profitA;
    }
    return 0;
  });
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
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
  return <DashboardLayout title="Sub-Companies" subtitle="Manage all your subsidiary companies">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Search companies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <div className="relative">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
            <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Button variant="primary" onClick={handleCreateCompany} className="flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          New Company
        </Button>
      </div>
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">
                  <button onClick={() => handleSort('name')} className="flex items-center">
                    Company
                    {sortBy === 'name' && <ArrowUpDownIcon className="h-4 w-4 ml-1" />}
                  </button>
                </th>
                <th className="p-4 font-medium">Industry</th>
                <th className="p-4 font-medium">
                  <button onClick={() => handleSort('profit')} className="flex items-center">
                    Net Profit
                    {sortBy === 'profit' && <ArrowUpDownIcon className="h-4 w-4 ml-1" />}
                  </button>
                </th>
                <th className="p-4 font-medium">
                  <button onClick={() => handleSort('roi')} className="flex items-center">
                    ROI
                    {sortBy === 'roi' && <ArrowUpDownIcon className="h-4 w-4 ml-1" />}
                  </button>
                </th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse border-b border-slate-700">
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
                      <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-12 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    </td>
                  </tr>) : filteredCompanies.length > 0 ? filteredCompanies.map(company => <tr key={company.id} className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer" onClick={() => handleViewCompany(company.id)}>
                    <td className="p-4">
                      <div className="flex items-center">
                        <img src={company.logo} alt={company.name} className="h-10 w-10 rounded object-cover" />
                        <div className="ml-3">
                          <div className="font-medium text-white">
                            {company.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            ID: {company.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{company.industry}</td>
                    <td className="p-4 text-white">
                      $
                      {(company.performance.profit - company.performance.loss).toLocaleString()}
                    </td>
                    <td className="p-4 text-yellow-500">
                      {company.performance.roi}%
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="secondary" size="sm" onClick={e => {
                  e.stopPropagation();
                  handleViewCompany(company.id);
                }}>
                        View Details
                      </Button>
                    </td>
                  </tr>) : <tr>
                  <td colSpan={6} className="p-0">
                    <EmptyState
                      type="companies"
                      title={searchTerm || filter !== 'all' ? 'No Companies Found' : 'No Companies Yet'}
                      message={searchTerm || filter !== 'all' ?
                        'No companies match your current search criteria. Try adjusting your filters.' :
                        'You haven\'t created any sub-companies yet. Create your first company to get started.'
                      }
                      actionLabel="Create Company"
                      onAction={handleCreateCompany}
                      secondaryActionLabel={searchTerm || filter !== 'all' ? 'Clear Filters' : undefined}
                      onSecondaryAction={searchTerm || filter !== 'all' ? () => {
                        setSearchTerm('');
                        setFilter('all');
                      } : undefined}
                      size="md"
                    />
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 p-6 bg-slate-800 rounded-lg">
        <div className="flex items-center mb-4">
          <BuildingIcon className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium text-white">Company Management</h3>
        </div>
        <p className="text-slate-400 mb-4">
          Use this dashboard to manage all your subsidiary companies. You can
          create new companies, view detailed performance metrics, and manage
          company settings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Total Companies</h4>
            <p className="text-2xl font-bold text-white">{companies.length}</p>
            <p className="text-sm text-slate-400">Across all regions</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Active Companies</h4>
            <p className="text-2xl font-bold text-green-500">
              {companies.filter(c => c.status === 'active').length}
            </p>
            <p className="text-sm text-slate-400">Currently operational</p>
          </div>
          <div className="bg-slate-700 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Average ROI</h4>
            <p className="text-2xl font-bold text-yellow-500">
              {companies.length > 0 ? (companies.reduce((sum, c) => sum + c.performance.roi, 0) / companies.length).toFixed(1) : 0}
              %
            </p>
            <p className="text-sm text-slate-400">Across all companies</p>
          </div>
        </div>
      </div>
    </DashboardLayout>;
};
export default Companies;