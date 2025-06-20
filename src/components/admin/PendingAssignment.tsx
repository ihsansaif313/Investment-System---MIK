import React, { useEffect, useState } from 'react';
import { ClockIcon, BuildingIcon, UserIcon, RefreshCwIcon, MailIcon, XCircleIcon } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { useRealTimeUpdates } from '../../utils/realTimeUpdates';
import apiService from '../../services/api';

const PendingAssignment: React.FC = () => {
  const { user } = useAuth();
  const { fetchAssignedCompanies, loading } = useCompanySelection();
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [adminStatus, setAdminStatus] = useState<'pending' | 'rejected' | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const handleRefresh = async () => {
    await fetchAssignedCompanies();
    await checkAdminStatus();
    setLastChecked(new Date());
  };

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      // Get fresh admin status data
      const statusData = await apiService.getAdminStatus(user.id);
      console.log('[PendingAssignment] Admin status check result:', statusData);
      setAdminStatus(statusData.status as 'pending' | 'rejected');
      setRejectionReason(statusData.notes || null);
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  // Check admin status on mount
  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  // Auto-refresh every 10 seconds for faster status updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAssignedCompanies();
      checkAdminStatus();
      setLastChecked(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchAssignedCompanies]);

  // Listen for real-time assignment updates
  useRealTimeUpdates('companyAssignmentUpdated', (detail) => {
    console.log('[PendingAssignment] Received assignment update:', detail);
    fetchAssignedCompanies();
    checkAdminStatus();
    setLastChecked(new Date());
  }, [fetchAssignedCompanies]);

  // Listen for real-time admin approval updates
  useRealTimeUpdates('adminApprovalUpdated', (detail) => {
    console.log('[PendingAssignment] Received admin approval update:', detail);
    if (detail.data?.userId === user?.id) {
      checkAdminStatus();
      fetchAssignedCompanies();
      setLastChecked(new Date());
    }
  }, [user?.id]);

  // Show rejection screen if admin was rejected
  if (adminStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Application Rejected
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 mb-6">
              Your admin application has been rejected by the super admin.
            </p>

            {/* Rejection Reason */}
            {rejectionReason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-400 mb-2">Reason:</h3>
                <p className="text-sm text-red-300">{rejectionReason}</p>
              </div>
            )}

            {/* Contact Support */}
            <div className="space-y-3">
              <Button
                variant="secondary"
                onClick={() => window.location.href = 'mailto:admin@company.com?subject=Admin Application Appeal'}
                className="w-full"
              >
                <MailIcon className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                If you believe this is an error, please contact the super admin for clarification.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">
            {adminStatus === 'pending' ? 'Pending Admin Approval' : 'Pending Company Assignment'}
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 mb-6">
            {adminStatus === 'pending'
              ? 'Please wait for a super admin to approve your admin application.'
              : 'Please wait for a super admin to assign you to a company before you can access the admin dashboard.'
            }
          </p>

          {/* User Info */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <UserIcon className="w-5 h-5 text-slate-400 mr-2" />
              <span className="text-sm font-medium text-slate-300">Your Account</span>
            </div>
            <div className="text-white font-medium">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="text-sm text-slate-400">
              {user?.email}
            </div>
            <div className="text-xs text-slate-500 mt-2">
              Role: Administrator
            </div>
          </div>

          {/* Status */}
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              {adminStatus === 'pending' ? (
                <>
                  <UserIcon className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="text-sm font-medium text-slate-300">Approval Status</span>
                </>
              ) : (
                <>
                  <BuildingIcon className="w-5 h-5 text-slate-400 mr-2" />
                  <span className="text-sm font-medium text-slate-300">Assignment Status</span>
                </>
              )}
            </div>
            <div className="text-yellow-500 font-medium mb-1">
              {adminStatus === 'pending' ? 'Waiting for Approval' : 'Waiting for Assignment'}
            </div>
            <div className="text-xs text-slate-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="primary"
              onClick={handleRefresh}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2" />
                  Check for Updates
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={() => window.location.href = 'mailto:admin@company.com?subject=Company Assignment Request'}
              className="w-full"
            >
              <MailIcon className="w-4 h-4 mr-2" />
              Contact Super Admin
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">
              What happens next?
            </h3>
            <div className="text-xs text-slate-400 space-y-1">
              {adminStatus === 'pending' ? (
                <>
                  <p>1. A super admin will review your admin application</p>
                  <p>2. Once approved, you'll be available for company assignment</p>
                  <p>3. You'll gain access to the admin dashboard for your assigned companies</p>
                </>
              ) : (
                <>
                  <p>1. A super admin will assign you to one or more companies</p>
                  <p>2. You'll automatically gain access to the admin dashboard</p>
                  <p>3. You can manage investments and view analytics for your assigned companies</p>
                </>
              )}
            </div>
          </div>

          {/* Auto-refresh indicator */}
          <div className="mt-6 text-xs text-slate-500">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Auto-checking every 30 seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingAssignment;
