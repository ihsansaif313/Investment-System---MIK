import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DemoBanner from '../components/demo/DemoBanner';
import DeveloperCredits from '../components/layout/DeveloperCredits';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  subtitle
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-900">
      <DemoBanner />
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={handleMenuClose}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header
          title={title}
          subtitle={subtitle}
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-16">{children}</main>
      </div>
      <DeveloperCredits />
    </div>
  );
};
export default DashboardLayout;