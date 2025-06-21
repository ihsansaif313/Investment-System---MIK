import React, { useEffect, useState } from 'react';
import {
  PlusIcon, SearchIcon, UserIcon, BuildingIcon, TrashIcon, EditIcon, CheckIcon, XIcon, ClockIcon,
  FilterIcon, DownloadIcon, MoreVerticalIcon, EyeIcon, HistoryIcon, SettingsIcon, UsersIcon,
  CalendarIcon, TrendingUpIcon, AlertCircleIcon, ShieldIcon, FileTextIcon
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import { CompanyAssignment, SubCompany, UserWithRole, ActivityLog } from '../../types/database';
import { companyUpdates, adminUpdates } from '../../utils/realTimeUpdates';
import apiService from '../../services/api';

interface AssignmentFormData {
  userId: string;
  subCompanyId: string;
  permissions: string[];
  notes: string;
}

interface PendingAdmin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationDate: string;
  roleId: string;
  status: string;
}

interface AdminStats {
  totalAdmins: number;
  activeAdmins: number;
  pendingAdmins: number;
  assignedAdmins: number;
  unassignedAdmins: number;
  totalAssignments?: number;
}

interface FilterOptions {
  status: string;
  company: string;
  dateRange: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface AdminHistory {
  id: string;
  adminId: string;
  action: string;
  description: string;
  timestamp: string;
  performedBy: string;
}

const AdminAssignments: React.FC = () => {
  const { user } = useAuth();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();

  const [assignments, setAssignments] = useState<CompanyAssignment[]>([]);
  const [companies, setCompanies] = useState<SubCompany[]>([]);
  const [admins, setAdmins] = useState<UserWithRole[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalAdmins: 0,
    activeAdmins: 0,
    pendingAdmins: 0,
    assignedAdmins: 0,
    unassignedAdmins: 0,
    totalAssignments: 0
  });
  const [adminHistory, setAdminHistory] = useState<AdminHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'assignments' | 'pending' | 'history' | 'analytics'>('assignments');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<UserWithRole | null>(null);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    company: 'all',
    dateRange: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [formData, setFormData] = useState<AssignmentFormData>({
    userId: '',
    subCompanyId: '',
    permissions: ['view_company_data', 'manage_investments', 'view_analytics', 'generate_reports'],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, companiesRes, adminsRes, pendingRes, historyRes] = await Promise.all([
        apiService.getCompanyAssignments(),
        apiService.getSubCompanies(),
        apiService.getApprovedAdmins(),
        apiService.getPendingAdmins(),
        apiService.getActivityLogs({ limit: 50, actions: ['admin_assigned', 'admin_removed', 'user_approved', 'user_rejected'] })
      ]);

      setAssignments(assignmentsRes || []);
      setCompanies(companiesRes || []);
      setAdmins(adminsRes || []);
      setPendingAdmins(pendingRes || []);

      // Transform activity logs to admin history
      const history = (historyRes || []).map(log => ({
        id: log.id,
        adminId: log.user_id,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp,
        performedBy: log.userName || 'System'
      }));
      setAdminHistory(history);

      // Calculate stats
      const totalAdmins = (adminsRes || []).length + (pendingRes || []).length;
      const activeAdmins = (adminsRes || []).length;

      // Count unique admins who have assignments (not total assignments)
      const uniqueAssignedAdminIds = new Set(
        (assignmentsRes || []).map(assignment => assignment.userId?.id || assignment.userId?._id)
      );
      const assignedAdmins = uniqueAssignedAdminIds.size;
      const unassignedAdmins = activeAdmins - assignedAdmins;

      setAdminStats({
        totalAdmins,
        activeAdmins,
        pendingAdmins: (pendingRes || []).length,
        assignedAdmins, // Number of unique admins with assignments
        unassignedAdmins, // Number of active admins without any assignments
        totalAssignments: (assignmentsRes || []).length // Total number of assignments
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      errorToast('Failed to load assignments data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      if (!formData.userId || !formData.subCompanyId) {
        errorToast('Please select both admin and company');
        return;
      }

      const response = await apiService.createCompanyAssignment({
        userId: formData.userId,
        subCompanyId: formData.subCompanyId
      });
      successToast('Admin assigned to company successfully');

      // Trigger real-time update
      companyUpdates.assignmentCreated({
        userId: formData.userId,
        subCompanyId: formData.subCompanyId,
        assignment: response
      });

      setShowAssignModal(false);
      setFormData({
        userId: '',
        subCompanyId: '',
        permissions: ['view_company_data', 'manage_investments', 'view_analytics', 'generate_reports'],
        notes: ''
      });
      fetchData();
    } catch (error: any) {
      console.error('Failed to create assignment:', error);
      errorToast(error.response?.data?.message || 'Failed to assign admin');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, adminName?: string, companyName?: string) => {
    console.log('[AdminAssignments] Attempting to remove assignment:', { assignmentId, adminName, companyName });

    const message = adminName && companyName
      ? `Are you sure you want to remove ${adminName} from ${companyName}?`
      : 'Are you sure you want to remove this assignment?';
    if (!confirm(message)) return;

    try {
      console.log('[AdminAssignments] Calling removeCompanyAssignment API with ID:', assignmentId);
      await apiService.removeCompanyAssignment(assignmentId);
      console.log('[AdminAssignments] Assignment removal successful');

      successToast('Assignment removed successfully');

      // Trigger real-time update
      companyUpdates.assignmentRemoved({ assignmentId });

      // Force refresh with delay
      setTimeout(() => {
        fetchData();
      }, 1000);
    } catch (error: any) {
      console.error('Failed to remove assignment:', error);
      errorToast(error.response?.data?.message || 'Failed to remove assignment');
    }
  };

  const handleApproveAdmin = async (userId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to approve ${adminName} as an admin?`)) return;

    try {
      await apiService.approveAdmin(userId);
      successToast(`${adminName} approved successfully`);

      // Trigger real-time update
      adminUpdates.adminApproved({ userId, adminData: { userId } });

      fetchData();
    } catch (error: any) {
      console.error('Failed to approve admin:', error);
      errorToast(error.response?.data?.message || 'Failed to approve admin');
    }
  };

  const handleRejectAdmin = async (userId: string, adminName: string) => {
    const reason = prompt(`Please provide a reason for rejecting ${adminName}:`);
    if (reason === null) return; // User cancelled

    try {
      await apiService.rejectAdmin(userId, reason);
      successToast(`${adminName} rejected successfully`);

      // Trigger real-time update
      adminUpdates.adminRejected({ userId, reason, adminData: { userId } });

      fetchData();
    } catch (error: any) {
      console.error('Failed to reject admin:', error);
      errorToast(error.response?.data?.message || 'Failed to reject admin');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedAdmins.length === 0) {
      errorToast('Please select admins to approve');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedAdmins.length} admin(s)?`)) return;

    try {
      await Promise.all(selectedAdmins.map(adminId => apiService.approveAdmin(adminId)));
      successToast(`${selectedAdmins.length} admin(s) approved successfully`);
      setSelectedAdmins([]);
      fetchData();
    } catch (error: any) {
      console.error('Failed to bulk approve admins:', error);
      errorToast('Failed to approve some admins');
    }
  };

  const handleBulkReject = async () => {
    if (selectedAdmins.length === 0) {
      errorToast('Please select admins to reject');
      return;
    }

    const reason = prompt(`Please provide a reason for rejecting ${selectedAdmins.length} admin(s):`);
    if (reason === null) return;

    try {
      await Promise.all(selectedAdmins.map(adminId => apiService.rejectAdmin(adminId, reason)));
      successToast(`${selectedAdmins.length} admin(s) rejected successfully`);
      setSelectedAdmins([]);
      fetchData();
    } catch (error: any) {
      console.error('Failed to bulk reject admins:', error);
      errorToast('Failed to reject some admins');
    }
  };

  const handleExportData = () => {
    const data = activeTab === 'assignments' ? assignments : pendingAdmins;
    const csvContent = generateCSV(data, activeTab);
    downloadCSV(csvContent, `admin-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    successToast('Data exported successfully');
  };

  const generateCSV = (data: any[], type: string) => {
    if (type === 'assignments') {
      const headers = ['Admin Name', 'Email', 'Company', 'Industry', 'Assigned Date', 'Status'];
      const rows = data.map(assignment => [
        `${assignment.userId?.firstName} ${assignment.userId?.lastName}`,
        assignment.userId?.email,
        assignment.subCompanyId?.name,
        assignment.subCompanyId?.industry,
        new Date(assignment.assignedDate).toLocaleDateString(),
        assignment.status
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    } else {
      const headers = ['Name', 'Email', 'Registration Date', 'Status'];
      const rows = data.map(admin => [
        `${admin.firstName} ${admin.lastName}`,
        admin.email,
        new Date(admin.registrationDate).toLocaleDateString(),
        admin.status
      ]);
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewAdminProfile = (admin: UserWithRole) => {
    setSelectedAdmin(admin);
    setShowAdminProfileModal(true);
  };

  const applyFiltersAndSort = (data: any[], type: 'assignments' | 'pending') => {
    let filtered = data.filter(item => {
      const searchMatch = type === 'assignments'
        ? `${item.userId?.firstName} ${item.userId?.lastName} ${item.userId?.email} ${item.subCompanyId?.name}`.toLowerCase().includes(searchTerm.toLowerCase())
        : `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = filters.status === 'all' || item.status === filters.status;

      const companyMatch = type === 'assignments'
        ? filters.company === 'all' || item.subCompanyId?.id === filters.company
        : true;

      const dateMatch = filters.dateRange === 'all' || checkDateRange(
        type === 'assignments' ? item.assignedDate : item.registrationDate,
        filters.dateRange
      );

      return searchMatch && statusMatch && companyMatch && dateMatch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'name':
          aValue = type === 'assignments'
            ? `${a.userId?.firstName} ${a.userId?.lastName}`
            : `${a.firstName} ${a.lastName}`;
          bValue = type === 'assignments'
            ? `${b.userId?.firstName} ${b.userId?.lastName}`
            : `${b.firstName} ${b.lastName}`;
          break;
        case 'date':
          aValue = new Date(type === 'assignments' ? a.assignedDate : a.registrationDate);
          bValue = new Date(type === 'assignments' ? b.assignedDate : b.registrationDate);
          break;
        case 'company':
          aValue = type === 'assignments' ? a.subCompanyId?.name || '' : '';
          bValue = type === 'assignments' ? b.subCompanyId?.name || '' : '';
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const checkDateRange = (date: string, range: string) => {
    const itemDate = new Date(date);
    const now = new Date();

    switch (range) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      default:
        return true;
    }
  };

  const filteredAssignments = applyFiltersAndSort(assignments, 'assignments');
  const filteredPendingAdmins = applyFiltersAndSort(pendingAdmins, 'pending');

  const availableAdmins = admins.filter(admin =>
    !admin.assignments || admin.assignments.length === 0
  );

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
    <DashboardLayout title="Admin Management" subtitle="Manage admin approvals and company assignments">
      {/* Admin Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <UsersIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Total Admins</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{adminStats.totalAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <CheckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Active</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{adminStats.activeAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{adminStats.pendingAdmins}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <BuildingIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Assigned Admins</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{adminStats.assignedAdmins}</p>
              {adminStats.totalAssignments && adminStats.totalAssignments > adminStats.assignedAdmins && (
                <p className="text-xs text-slate-500">
                  {adminStats.totalAssignments} total assignments
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 sm:p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center">
            <AlertCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-slate-400 truncate">Unassigned</p>
              <p className="text-lg sm:text-2xl font-bold text-white">{adminStats.unassignedAdmins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'assignments'
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              <BuildingIcon className="h-4 w-4 mr-2" />
              Admin Assignments
              {assignments.length > 0 && (
                <span className="ml-2 bg-slate-700 text-slate-300 py-1 px-2 rounded-full text-xs">
                  {assignments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'pending'
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              <ClockIcon className="h-4 w-4 mr-2" />
              Pending Approvals
              {pendingAdmins.length > 0 && (
                <span className="ml-2 bg-red-500 text-white py-1 px-2 rounded-full text-xs">
                  {pendingAdmins.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'history'
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              <HistoryIcon className="h-4 w-4 mr-2" />
              Activity History
              {adminHistory.length > 0 && (
                <span className="ml-2 bg-slate-700 text-slate-300 py-1 px-2 rounded-full text-xs">
                  {adminHistory.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'analytics'
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }`}
            >
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>

          {/* Filters */}
          <Button
            variant="secondary"
            onClick={() => setShowFilterModal(true)}
            className="flex items-center"
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
            {(filters.status !== 'all' || filters.company !== 'all' || filters.dateRange !== 'all') && (
              <span className="ml-2 bg-yellow-500 text-black rounded-full w-2 h-2"></span>
            )}
          </Button>

          {/* Bulk Actions for Pending Tab */}
          {activeTab === 'pending' && selectedAdmins.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApprove}
                className="flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Approve ({selectedAdmins.length})
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                className="flex items-center"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Reject ({selectedAdmins.length})
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <Button
            variant="secondary"
            onClick={handleExportData}
            className="flex items-center"
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>

          {/* Primary Actions */}
          {activeTab === 'assignments' && (
            <Button
              variant="primary"
              onClick={() => setShowAssignModal(true)}
              className="flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Assign Admin
            </Button>
          )}

          {activeTab === 'pending' && (
            <div className="text-sm text-slate-400">
              {pendingAdmins.length} admin{pendingAdmins.length !== 1 ? 's' : ''} awaiting approval
            </div>
          )}
        </div>
      </div>

      {/* Assignments Table */}
      {activeTab === 'assignments' && (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="p-4 font-medium">Admin</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Assigned Date</th>
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
                        <div className="h-10 w-10 rounded-full bg-slate-700"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-slate-700 rounded"></div>
                          <div className="h-3 w-32 bg-slate-700 rounded mt-1"></div>
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
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-20 bg-slate-700 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredAssignments.length > 0 ? (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                          <UserIcon className="h-5 w-5 text-slate-300" />
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-white">
                            {assignment.userId?.firstName} {assignment.userId?.lastName}
                          </div>
                          <div className="text-sm text-slate-400">
                            {assignment.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <BuildingIcon className="h-5 w-5 text-slate-400 mr-2" />
                        <div>
                          <div className="font-medium text-white">
                            {assignment.subCompanyId?.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {assignment.subCompanyId?.industry}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewAdminProfile(assignment.userId!)}
                          title="View Profile"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment._id || assignment.id, `${assignment.userId?.firstName} ${assignment.userId?.lastName}`, assignment.subCompanyId?.name || '')}
                          title="Remove Assignment"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="text-slate-400">
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No Assignments Found</h3>
                      <p className="mb-4">
                        {searchTerm ? 'No assignments match your search criteria.' : 'No admin assignments have been created yet.'}
                      </p>
                      <Button variant="primary" onClick={() => setShowAssignModal(true)}>
                        Create First Assignment
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* Pending Admins Table */}
      {activeTab === 'pending' && (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="p-4 font-medium">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.length === filteredPendingAdmins.length && filteredPendingAdmins.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAdmins(filteredPendingAdmins.map(admin => admin.id));
                        } else {
                          setSelectedAdmins([]);
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                    />
                  </th>
                  <th className="p-4 font-medium">Admin User</th>
                  <th className="p-4 font-medium">Registration Date</th>
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
                          <div className="h-10 w-10 rounded-full bg-slate-700"></div>
                          <div className="ml-3">
                            <div className="h-4 w-24 bg-slate-700 rounded"></div>
                            <div className="h-3 w-32 bg-slate-700 rounded mt-1"></div>
                          </div>
                        </div>
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
                ) : filteredPendingAdmins.length > 0 ? (
                  filteredPendingAdmins.map((admin) => (
                    <tr key={admin.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedAdmins.includes(admin.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAdmins([...selectedAdmins, admin.id]);
                            } else {
                              setSelectedAdmins(selectedAdmins.filter(id => id !== admin.id));
                            }
                          }}
                          className="rounded border-slate-600 bg-slate-700 text-yellow-500 focus:ring-yellow-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-slate-300" />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-slate-400">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {new Date(admin.registrationDate).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500 flex items-center w-fit">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pending Approval
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveAdmin(admin.id, `${admin.firstName} ${admin.lastName}`)}
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectAdmin(admin.id, `${admin.firstName} ${admin.lastName}`)}
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="text-slate-400">
                        <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Pending Approvals</h3>
                        <p className="mb-4">
                          {searchTerm ? 'No pending admins match your search criteria.' : 'All admin registrations have been processed.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Activity History Tab */}
      {activeTab === 'history' && (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Performed By</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {adminHistory.length > 0 ? (
                  adminHistory.map((historyItem) => (
                    <tr key={historyItem.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            historyItem.action.includes('approved') ? 'bg-green-500/20' :
                            historyItem.action.includes('rejected') ? 'bg-red-500/20' :
                            historyItem.action.includes('assigned') ? 'bg-blue-500/20' :
                            'bg-slate-500/20'
                          }`}>
                            {historyItem.action.includes('approved') ? <CheckIcon className="h-4 w-4 text-green-500" /> :
                             historyItem.action.includes('rejected') ? <XIcon className="h-4 w-4 text-red-500" /> :
                             historyItem.action.includes('assigned') ? <BuildingIcon className="h-4 w-4 text-blue-500" /> :
                             <HistoryIcon className="h-4 w-4 text-slate-500" />}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white capitalize">
                              {historyItem.action.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {historyItem.description}
                      </td>
                      <td className="p-4 text-slate-300">
                        {historyItem.performedBy}
                      </td>
                      <td className="p-4 text-slate-300">
                        {new Date(historyItem.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center">
                      <div className="text-slate-400">
                        <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No Activity History</h3>
                        <p className="mb-4">No admin management activities have been recorded yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Admin Distribution Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2" />
                Admin Status Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Active Admins</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-slate-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${adminStats.totalAdmins > 0 ? (adminStats.activeAdmins / adminStats.totalAdmins) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{adminStats.activeAdmins}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Pending Approval</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-slate-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${adminStats.totalAdmins > 0 ? (adminStats.pendingAdmins / adminStats.totalAdmins) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{adminStats.pendingAdmins}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Assigned to Companies</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-slate-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${adminStats.activeAdmins > 0 ? (adminStats.assignedAdmins / adminStats.activeAdmins) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{adminStats.assignedAdmins}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Unassigned</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-slate-700 rounded-full h-2 mr-3">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${adminStats.activeAdmins > 0 ? (adminStats.unassignedAdmins / adminStats.activeAdmins) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-medium">{adminStats.unassignedAdmins}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Recent Activity Summary
              </h3>
              <div className="space-y-3">
                {adminHistory.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-3 ${
                        activity.action.includes('approved') ? 'bg-green-500' :
                        activity.action.includes('rejected') ? 'bg-red-500' :
                        activity.action.includes('assigned') ? 'bg-blue-500' :
                        'bg-slate-500'
                      }`}></div>
                      <span className="text-slate-300 text-sm">{activity.description}</span>
                    </div>
                    <span className="text-slate-400 text-xs">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {adminHistory.length === 0 && (
                  <div className="text-center py-4">
                    <span className="text-slate-400 text-sm">No recent activity</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Assignment Overview */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <BuildingIcon className="h-5 w-5 mr-2" />
              Company Assignment Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{companies.length}</div>
                <div className="text-slate-300 text-sm">Total Companies</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">{assignments.length}</div>
                <div className="text-slate-300 text-sm">Active Assignments</div>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {companies.length > 0 ? Math.round((assignments.length / companies.length) * 100) : 0}%
                </div>
                <div className="text-slate-300 text-sm">Assignment Coverage</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Advanced Filters"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Company</label>
            <select
              value={filters.company}
              onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sort By</label>
            <div className="flex gap-2">
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="name">Name</option>
                <option value="date">Date</option>
                <option value="company">Company</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => {
              setFilters({
                status: 'all',
                company: 'all',
                dateRange: 'all',
                sortBy: 'name',
                sortOrder: 'asc'
              });
            }}>
              Reset
            </Button>
            <Button variant="primary" onClick={() => setShowFilterModal(false)}>
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Profile Modal */}
      <Modal
        isOpen={showAdminProfileModal}
        onClose={() => setShowAdminProfileModal(false)}
        title={selectedAdmin ? `${selectedAdmin.firstName} ${selectedAdmin.lastName}` : 'Admin Profile'}
      >
        {selectedAdmin && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-yellow-500 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-black" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">
                  {selectedAdmin.firstName} {selectedAdmin.lastName}
                </h3>
                <p className="text-slate-400">{selectedAdmin.email}</p>
                <p className="text-sm text-slate-500">
                  Role: {selectedAdmin.role?.type || 'Admin'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Current Assignments</h4>
              {selectedAdmin.assignments && selectedAdmin.assignments.length > 0 ? (
                <div className="space-y-2">
                  {selectedAdmin.assignments.map((assignment: any, index: number) => (
                    <div key={index} className="bg-slate-700 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{assignment.subCompanyId?.name}</div>
                          <div className="text-sm text-slate-400">{assignment.subCompanyId?.industry}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm">No current assignments</p>
              )}
            </div>

            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Account Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Status:</span>
                  <span className="ml-2 text-white">{selectedAdmin.status || 'Active'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Joined:</span>
                  <span className="ml-2 text-white">
                    {selectedAdmin.createdAt ? new Date(selectedAdmin.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Admin to Company"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Admin
            </label>
            <select
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Choose an admin...</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.firstName} {admin.lastName} ({admin.email})
                  {admin.assignments && admin.assignments.length > 0 && ' - Already assigned'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Company
            </label>
            <select
              value={formData.subCompanyId}
              onChange={(e) => setFormData({ ...formData, subCompanyId: e.target.value })}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Choose a company...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.industry})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes about this assignment..."
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateAssignment}>
              Assign Admin
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminAssignments;
