import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, BarChart3Icon, BuildingIcon, PieChartIcon, UsersIcon, FileTextIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: Array<'superadmin' | 'admin' | 'investor' | 'salesman'>;
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const {
    pathname
  } = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const getPathForRole = (basePath: string) => {
    const role = user?.role?.type;
    if (role === 'superadmin') return `/superadmin${basePath}`;
    if (role === 'admin') return `/admin${basePath}`;
    if (role === 'investor') return `/investor${basePath}`;
    if (role === 'salesman') return `/salesman${basePath}`;
    return basePath;
  };

  const handleNavClick = () => {
    // Close mobile menu when navigation item is clicked
    if (onClose) {
      onClose();
    }
  };

  const links: SidebarLink[] = [{
    icon: <LayoutDashboardIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Dashboard',
    path: getPathForRole('/dashboard'),
    roles: ['superadmin', 'admin', 'investor', 'salesman']
  }, {
    icon: <BuildingIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Companies',
    path: '/superadmin/company-management',
    roles: ['superadmin']
  }, {
    icon: <UsersIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Admin Assignments',
    path: '/superadmin/admin-assignments',
    roles: ['superadmin']
  }, {
    icon: <PieChartIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Investments',
    path: '/admin/investments',
    roles: ['admin']
  }, {
    icon: <UsersIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Investors',
    path: '/admin/investors',
    roles: ['admin']
  }, {
    icon: <PieChartIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Portfolio',
    path: '/investor/portfolio',
    roles: ['investor']
  }, {
    icon: <BarChart3Icon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Marketplace',
    path: '/investor/marketplace',
    roles: ['investor']
  }, {
    icon: <BarChart3Icon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Analytics',
    path: getPathForRole('/analytics'),
    roles: ['superadmin', 'admin', 'investor', 'salesman']
  }, {
    icon: <FileTextIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Reports',
    path: '/reports',
    roles: ['superadmin', 'admin', 'investor', 'salesman']
  }, {
    icon: <SettingsIcon size={18} className="sm:w-5 sm:h-5" />,
    label: 'Settings',
    path: '/profile',
    roles: ['superadmin', 'admin', 'investor', 'salesman']
  }];
  // Filter links based on user role
  const filteredLinks = links.filter(link => user?.role?.type && link.roles.includes(user.role.type));

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-64 sm:w-72 lg:w-64 xl:w-72
        bg-slate-800 border-r border-slate-700
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-3 sm:p-4 border-b border-slate-700">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-white">InvestPro</h1>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 sm:px-3">
          <ul className="space-y-0.5 sm:space-y-1">
            {filteredLinks.map(link => {
              const isActive = pathname === link.path;
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    onClick={handleNavClick}
                    className={`
                      flex items-center px-2 sm:px-3 py-2 sm:py-2.5 rounded-md
                      transition-all duration-200 text-sm sm:text-base
                      ${isActive
                        ? 'bg-yellow-500/10 text-yellow-500 border-r-2 border-yellow-500'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    <span className="mr-2 sm:mr-3 flex-shrink-0">{link.icon}</span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {/* User section */}
        <div className="p-3 sm:p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium text-sm sm:text-base">
              {user?.firstName?.charAt(0).toUpperCase() || user?.role?.type?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-2 sm:ml-3 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-white truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` :
                 user?.role?.type === 'superadmin' ? 'Super Admin' :
                 user?.role?.type === 'admin' ? 'Admin User' :
                 user?.role?.type === 'salesman' ? 'Sales Representative' : 'Investor'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role?.type === 'superadmin' ? 'System Administrator' :
                 user?.role?.type === 'admin' ? 'Company Admin' :
                 user?.role?.type === 'salesman' ? 'Sales Account' : 'Investor Account'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 sm:mt-4 flex items-center w-full px-2 sm:px-3 py-2 text-xs sm:text-sm text-slate-400 rounded-md hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOutIcon size={16} className="sm:w-[18px] sm:h-[18px] mr-2 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;