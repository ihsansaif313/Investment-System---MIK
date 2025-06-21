import React, { useEffect, useState } from 'react';
import { PlusIcon, SearchIcon, FilterIcon, UsersIcon, UserPlusIcon, MailIcon, PhoneIcon, CheckCircleIcon, XCircleIcon, EyeIcon } from 'lucide-react';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import InvestorDetailModal from '../../components/admin/InvestorDetailModal';
import CreateInvestorModal from '../../components/investor/CreateInvestorModal';
interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  investmentTotal: number;
  investmentCount: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  joinDate: string;
  lastActivity: string;
  documents?: {
    id: string;
    name: string;
    type: string;
    uploadDate: string;
    verified: boolean;
  }[];
}
const Investors: React.FC = () => {
  const { user } = useAuth();
  const { state, fetchUsers, updateUserStatus } = useData();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Get the admin's sub-company ID
  const subCompanyId = user?.subCompanyAdmin?.sub_company_id;

  useEffect(() => {
    const loadInvestors = async () => {
      if (!subCompanyId) return;

      try {
        // Fetch users with investor role for this sub-company
        await fetchUsers({
          role: ['investor'],
          subCompanyId
        });
      } catch (error) {
        errorToast('Failed to load investors', 'Please try refreshing the page');
      }
    };

    loadInvestors();
  }, [subCompanyId, fetchUsers]);

  // Transform users to investor format
  const investors: Investor[] = state.users
    .filter(user => user.role?.id === 'investor' || user.role?.id === 'role_investor')
    .map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone || 'N/A',
      investmentTotal: 0, // This would come from investment calculations
      investmentCount: 0, // This would come from investment calculations
      status: user.status as 'active' | 'inactive' | 'pending' | 'rejected',
      joinDate: user.created_at.toISOString().split('T')[0],
      lastActivity: user.last_login?.toISOString().split('T')[0] || user.created_at.toISOString().split('T')[0],
      documents: [] // This would come from a separate API call
    }));

  const loading = state.loading.users;
  const filteredInvestors = investors.filter(investor => {
    if (filter === 'all') return true;
    return investor.status === filter;
  }).filter(investor => investor.name.toLowerCase().includes(searchTerm.toLowerCase()) || investor.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleViewDetails = (investor: Investor) => {
    setSelectedInvestor(investor);
  };
  const handleApproveInvestor = async (id: string) => {
    try {
      setProcessingId(id);
      await updateUserStatus(id, 'active');
      successToast('Investor Approved', 'The investor has been approved successfully');
      // Refresh the users list
      await fetchUsers({ role: ['investor'], subCompanyId });
    } catch (error) {
      console.error('Error approving investor:', error);
      errorToast('Failed to approve investor', 'Please try again');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectInvestor = async (id: string) => {
    try {
      setProcessingId(id);
      await updateUserStatus(id, 'rejected');
      successToast('Investor Rejected', 'The investor has been rejected');
      // Refresh the users list
      await fetchUsers({ role: ['investor'], subCompanyId });
    } catch (error) {
      console.error('Error rejecting investor:', error);
      errorToast('Failed to reject investor', 'Please try again');
    } finally {
      setProcessingId(null);
    }
  };
  const handleCloseModal = () => {
    setSelectedInvestor(null);
  };
  return <AdminDashboardLayout title="Investors" subtitle={`Manage investors for your company`}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Search investors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <div className="relative">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
            <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Button
          variant="primary"
          className="flex items-center justify-center"
          onClick={() => setShowCreateModal(true)}
        >
          <UserPlusIcon className="h-5 w-5 mr-2" />
          Add Investor
        </Button>
      </div>
      {/* Pending Approval Alert */}
      {filteredInvestors.some(investor => investor.status === 'pending') && <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-500">
                Pending Approvals
              </h3>
              <div className="mt-1 text-sm text-slate-300">
                <p>
                  {filteredInvestors.filter(inv => inv.status === 'pending').length}{' '}
                  investor(s) waiting for approval. Please review their
                  information and documentation.
                </p>
              </div>
            </div>
          </div>
        </div>}
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                <th className="p-4 font-medium">Investor</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Total Investment</th>
                <th className="p-4 font-medium"># Investments</th>
                <th className="p-4 font-medium">Join Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse border-b border-slate-700">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-700"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-slate-700 rounded"></div>
                          <div className="h-3 w-16 bg-slate-700 rounded mt-1"></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-32 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-12 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-20 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    </td>
                  </tr>) : filteredInvestors.length > 0 ? filteredInvestors.map(investor => <tr key={investor.id} className={`border-b border-slate-700 ${investor.status === 'pending' ? 'bg-yellow-500/5' : ''} hover:bg-slate-700/50`}>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
                          {investor.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-white">
                            {investor.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            ID: {investor.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-slate-300">
                          <MailIcon className="h-4 w-4 mr-2 text-slate-400" />
                          {investor.email}
                        </div>
                        <div className="flex items-center text-slate-300">
                          <PhoneIcon className="h-4 w-4 mr-2 text-slate-400" />
                          {investor.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      ${investor.investmentTotal.toLocaleString()}
                    </td>
                    <td className="p-4 text-white">
                      {investor.investmentCount}
                    </td>
                    <td className="p-4 text-slate-300">
                      {formatDate(investor.joinDate)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investor.status)}`}>
                        {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(investor)}>
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {investor.status === 'pending' && <>
                            <Button variant="primary" size="sm" onClick={() => handleApproveInvestor(investor.id)} isLoading={processingId === investor.id} disabled={!!processingId}>
                              {processingId !== investor.id && <CheckCircleIcon className="h-4 w-4 mr-1" />}
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleRejectInvestor(investor.id)} isLoading={processingId === investor.id} disabled={!!processingId}>
                              {processingId !== investor.id && <XCircleIcon className="h-4 w-4 mr-1" />}
                              Reject
                            </Button>
                          </>}
                      </div>
                    </td>
                  </tr>) : <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <UsersIcon className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                    <p>No investors found matching your criteria</p>
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 text-blue-500 mr-2" />
            Investor Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Investors:</span>
              <span className="text-white font-medium">{investors.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active Investors:</span>
              <span className="text-green-500 font-medium">
                {investors.filter(inv => inv.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pending Approval:</span>
              <span className="text-yellow-500 font-medium">
                {investors.filter(inv => inv.status === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Inactive Investors:</span>
              <span className="text-slate-300 font-medium">
                {investors.filter(inv => inv.status === 'inactive').length}
              </span>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <PlusIcon className="h-5 w-5 text-green-500 mr-2" />
            New Investors
          </h3>
          <div className="space-y-3">
            {investors.filter(inv => {
            const joinDate = new Date(inv.joinDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return joinDate >= thirtyDaysAgo;
          }).slice(0, 3).map(inv => <div key={inv.id} className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium mr-3">
                    {inv.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{inv.name}</div>
                    <div className="text-xs text-slate-400">
                      Joined {formatDate(inv.joinDate)}
                    </div>
                  </div>
                </div>)}
            {investors.filter(inv => {
            const joinDate = new Date(inv.joinDate);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return joinDate >= thirtyDaysAgo;
          }).length === 0 && <div className="text-center py-4 text-slate-400">
                No new investors in the last 30 days
              </div>}
          </div>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center">
            <UsersIcon className="h-5 w-5 text-yellow-500 mr-2" />
            Top Investors
          </h3>
          <div className="space-y-3">
            {[...investors].sort((a, b) => b.investmentTotal - a.investmentTotal).slice(0, 3).map((inv, index) => <div key={inv.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium mr-3">
                      {index + 1}
                    </div>
                    <div className="text-white font-medium">{inv.name}</div>
                  </div>
                  <div className="text-yellow-500 font-medium">
                    ${inv.investmentTotal.toLocaleString()}
                  </div>
                </div>)}
          </div>
        </div>
      </div>
      {/* Investor Detail Modal */}
      {selectedInvestor && <InvestorDetailModal investor={selectedInvestor} onClose={handleCloseModal} onApprove={handleApproveInvestor} onReject={handleRejectInvestor} isProcessing={processingId === selectedInvestor.id} />}

      {/* Create Investor Modal */}
      <CreateInvestorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refreshInvestors();
          setShowCreateModal(false);
        }}
        companyId={user?.companyAssignments?.[0]?.subCompanyId || 'default-company-id'}
      />
    </AdminDashboardLayout>;
};
export default Investors;