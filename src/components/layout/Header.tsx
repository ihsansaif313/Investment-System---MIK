import React from 'react';
import { BellIcon, SearchIcon } from 'lucide-react';
interface HeaderProps {
  title: string;
  subtitle?: string;
}
const Header: React.FC<HeaderProps> = ({
  title,
  subtitle
}) => {
  return <header className="bg-slate-800 border-b border-slate-700 py-4 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <input type="text" placeholder="Search..." className="w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          {/* Notifications */}
          <button className="relative p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <BellIcon size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>;
};
export default Header;