import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, BarChart3Icon, BuildingIcon, PieChartIcon, UsersIcon, FileTextIcon, SettingsIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: Array<'superadmin' | 'admin' | 'investor'>;
}
const Sidebar: React.FC = () => {
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
    return basePath;
  };

  const links: SidebarLink[] = [{
    icon: <LayoutDashboardIcon size={20} />,
    label: 'Dashboard',
    path: getPathForRole('/dashboard'),
    roles: ['superadmin', 'admin', 'investor']
  }, {
    icon: <BuildingIcon size={20} />,
    label: 'Sub-Companies',
    path: '/superadmin/companies',
    roles: ['superadmin']
  }, {
    icon: <PieChartIcon size={20} />,
    label: 'Investments',
    path: '/admin/investments',
    roles: ['admin']
  }, {
    icon: <UsersIcon size={20} />,
    label: 'Investors',
    path: '/admin/investors',
    roles: ['admin']
  }, {
    icon: <PieChartIcon size={20} />,
    label: 'Portfolio',
    path: '/investor/portfolio',
    roles: ['investor']
  }, {
    icon: <BarChart3Icon size={20} />,
    label: 'Marketplace',
    path: '/investor/marketplace',
    roles: ['investor']
  }, {
    icon: <BarChart3Icon size={20} />,
    label: 'Analytics',
    path: getPathForRole('/analytics'),
    roles: ['superadmin', 'admin', 'investor']
  }, {
    icon: <FileTextIcon size={20} />,
    label: 'Reports',
    path: '/reports',
    roles: ['superadmin', 'admin', 'investor']
  }, {
    icon: <SettingsIcon size={20} />,
    label: 'Settings',
    path: '/profile',
    roles: ['superadmin', 'admin', 'investor']
  }];
  // Filter links based on user role
  const filteredLinks = links.filter(link => user?.role?.type && link.roles.includes(user.role.type));
  return <div className="h-screen w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">InvestPro</h1>
        </div>
      </div>
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {filteredLinks.map(link => {
          const isActive = pathname === link.path;
          return <li key={link.path}>
                <Link to={link.path} className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-yellow-500/10 text-yellow-500' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}>
                  <span className="mr-3">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>;
        })}
        </ul>
      </div>
      {/* User section */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
            {user?.firstName?.charAt(0).toUpperCase() || user?.role?.type?.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` :
               user?.role?.type === 'superadmin' ? 'Super Admin' :
               user?.role?.type === 'admin' ? 'Admin User' : 'Investor'}
            </p>
            <p className="text-xs text-slate-400">
              {user?.role?.type === 'superadmin' ? 'System Administrator' :
               user?.role?.type === 'admin' ? 'Company Admin' : 'Investor Account'}
            </p>
          </div>
        </div>
        <button onClick={logout} className="mt-4 flex items-center w-full px-3 py-2 text-sm text-slate-400 rounded-md hover:bg-slate-700 hover:text-white transition-colors">
          <LogOutIcon size={18} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>;
};
export default Sidebar;