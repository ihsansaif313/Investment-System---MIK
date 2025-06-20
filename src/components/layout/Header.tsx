import React, { useState } from 'react';
import { BellIcon, SearchIcon, MenuIcon, XIcon } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onMenuToggle,
  isMobileMenuOpen = false
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return <header className="bg-slate-800 border-b border-slate-700 py-3 sm:py-4 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu button + Title */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 sm:p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{title}</h1>
            {subtitle && <p className="text-slate-400 mt-0.5 sm:mt-1 text-xs sm:text-sm truncate">{subtitle}</p>}
          </div>
        </div>

        {/* Right side - Search + Notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search - Desktop */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-48 lg:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-9 sm:pl-10 pr-3 sm:pr-4 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            />
            <SearchIcon className="absolute left-2.5 sm:left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
          </div>

          {/* Search - Mobile Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden p-1.5 sm:p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Toggle search"
          >
            <SearchIcon size={18} className="sm:w-5 sm:h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 sm:p-2 rounded-md text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
            <BellIcon size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-0.5 sm:top-1 right-0.5 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-slate-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 pl-9 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoFocus
            />
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
        </div>
      )}
    </header>;
};
export default Header;