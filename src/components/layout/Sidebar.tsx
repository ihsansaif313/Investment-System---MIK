import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, BarChart3Icon, BuildingIcon, PieChartIcon, UsersIcon, FileTextIcon, SettingsIcon, LogOutIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { SubCompany } from '../../types/database';

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
  const {
    assignedCompanies,
    selectedCompany,
    loading: companyLoading,
    error: companyError,
    selectCompany,
    hasCompanyAccess
  } = useCompanySelection();

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
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

  const handleCompanySelect = (company: SubCompany) => {
    selectCompany(company);
    setIsCompanyDropdownOpen(false);
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
        bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-r border-slate-700/50
        flex flex-col shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 flex items-center justify-center shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">InvestPro</h1>
          </div>
        </div>

        {/* Company Selector for Admins */}
        {user?.role?.type === 'admin' && hasCompanyAccess && (
          <div className="px-3 sm:px-4 py-3 border-b border-slate-700">
            <div className="mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Active Company
              </span>
            </div>

            {companyLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-slate-700 rounded-lg"></div>
              </div>
            ) : companyError ? (
              <div className="text-red-400 text-xs p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                Error loading companies
              </div>
            ) : assignedCompanies.length === 0 ? (
              <div className="text-slate-400 text-xs p-2 bg-slate-700/50 rounded-lg text-center">
                No companies assigned
              </div>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-600 rounded-lg py-2.5 px-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all duration-200 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mr-3 flex-shrink-0">
                        <BuildingIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-white truncate">
                          {selectedCompany?.name || 'Select Company'}
                        </div>
                        {selectedCompany && (
                          <div className="text-xs text-slate-300 truncate">
                            {selectedCompany.industry}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 text-slate-300 transition-transform duration-200 flex-shrink-0 ml-2 ${
                        isCompanyDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown */}
                {isCompanyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {assignedCompanies.map((company) => (
                        <button
                          key={company.id}
                          onClick={() => handleCompanySelect(company)}
                          className="w-full px-3 py-2.5 text-left hover:bg-slate-600 focus:outline-none focus:bg-slate-600 transition-colors duration-150"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mr-3 flex-shrink-0">
                                <BuildingIcon className="h-3 w-3 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm text-white truncate">
                                  {company.name}
                                </div>
                                <div className="text-xs text-slate-300 truncate">
                                  {company.industry}
                                </div>
                              </div>
                            </div>
                            {selectedCompany?.id === company.id && (
                              <CheckIcon className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
                      flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg
                      transition-all duration-200 text-sm sm:text-base font-medium
                      ${isActive
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-r-2 border-yellow-500 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white hover:shadow-sm'
                      }
                    `}
                  >
                    <span className="mr-3 flex-shrink-0">{link.icon}</span>
                    <span className="truncate">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        {/* User section */}
        <div className="p-4 sm:p-5 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg">
              {user?.firstName?.charAt(0).toUpperCase() || user?.role?.type?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` :
                 user?.role?.type === 'superadmin' ? 'Super Admin' :
                 user?.role?.type === 'admin' ? 'Admin User' : 'Investor'}
              </p>
              <p className="text-xs text-slate-300 truncate">
                {user?.role?.type === 'superadmin' ? 'System Administrator' :
                 user?.role?.type === 'admin' ? 'Company Admin' : 'Investor Account'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-4 flex items-center w-full px-3 py-2.5 text-sm text-slate-300 rounded-lg hover:bg-slate-700/50 hover:text-white transition-all duration-200 font-medium"
          >
            <LogOutIcon size={18} className="mr-3 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};
export default Sidebar;