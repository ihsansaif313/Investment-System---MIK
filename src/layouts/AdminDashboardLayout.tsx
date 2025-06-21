import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import PendingAssignment from '../components/admin/PendingAssignment';
import DemoBanner from '../components/demo/DemoBanner';
import DeveloperCredits from '../components/layout/DeveloperCredits';
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

  // Check if this is a demo user
  const isDemoUser = user && (user as any).isDemo;

  // Show pending assignment screen if admin has no company access OR is pending approval
  // BUT bypass for demo users
  if (user?.role.id === 'admin' && !isDemoUser && (!hasCompanyAccess || user.role.status === 'pending')) {
    return <PendingAssignment />;
  }

  // Enhanced admin dashboard layout with integrated company selector
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <DemoBanner />
      {/* Enhanced Main Sidebar with Company Selector */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          {/* Content Container with Enhanced Styling */}
          <div className="p-6 space-y-6 pb-16">
            {children}
          </div>
        </main>
      </div>
      <DeveloperCredits />
    </div>
  );
};

export default AdminDashboardLayout;
