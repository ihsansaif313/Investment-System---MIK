import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import CompanySidebar from '../components/admin/CompanySidebar';
import PendingAssignment from '../components/admin/PendingAssignment';
import { useAuth } from '../contexts/AuthContext';
import { useCompanySelection } from '../contexts/CompanySelectionContext';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const { user } = useAuth();
  const { hasCompanyAccess, loading, assignedCompanies } = useCompanySelection();

  // Show loading state while checking company assignments
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your company assignments...</p>
        </div>
      </div>
    );
  }

  // Show pending assignment screen if admin has no company access OR is pending approval
  if (user?.role.id === 'admin' && (!hasCompanyAccess || user.role.status === 'pending')) {
    return <PendingAssignment />;
  }

  // Regular admin dashboard layout with company sidebar
  return (
    <div className="flex h-screen bg-slate-900">
      {/* Main Sidebar */}
      <Sidebar />
      
      {/* Company Sidebar for Admins */}
      {user?.role.id === 'admin' && hasCompanyAccess && (
        <CompanySidebar className="w-64 flex-shrink-0" />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
