import React from 'react';
import { BuildingIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import { SubCompany } from '../../types/database';

interface CompanySidebarProps {
  className?: string;
}

const CompanySidebar: React.FC<CompanySidebarProps> = ({ className = '' }) => {
  const {
    assignedCompanies,
    selectedCompany,
    loading,
    error,
    selectCompany,
    hasCompanyAccess
  } = useCompanySelection();

  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  if (!hasCompanyAccess) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-slate-800 border-r border-slate-700 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-8 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-800 border-r border-slate-700 ${className}`}>
        <div className="p-4">
          <div className="text-red-400 text-sm">
            <p className="font-medium mb-1">Error loading companies</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (assignedCompanies.length === 0) {
    return (
      <div className={`bg-slate-800 border-r border-slate-700 ${className}`}>
        <div className="p-4">
          <div className="text-slate-400 text-sm text-center">
            <BuildingIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium mb-1">No Companies Assigned</p>
            <p className="text-xs">Contact your super admin to get assigned to a company.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleCompanySelect = (company: SubCompany) => {
    selectCompany(company);
    setIsDropdownOpen(false);
  };

  return (
    <div className={`bg-slate-800 border-r border-slate-700 ${className}`}>
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-slate-300 mb-2">Your Companies</h3>
          
          {/* Company Selector */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-left text-white hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingIcon className="h-4 w-4 text-slate-400 mr-2" />
                  <div>
                    <div className="font-medium text-sm">
                      {selectedCompany?.name || 'Select Company'}
                    </div>
                    {selectedCompany && (
                      <div className="text-xs text-slate-400">
                        {selectedCompany.industry}
                      </div>
                    )}
                  </div>
                </div>
                <ChevronDownIcon 
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </div>
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-50">
                <div className="py-1">
                  {assignedCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySelect(company)}
                      className="w-full px-3 py-2 text-left hover:bg-slate-600 focus:outline-none focus:bg-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <BuildingIcon className="h-4 w-4 text-slate-400 mr-2" />
                          <div>
                            <div className="font-medium text-sm text-white">
                              {company.name}
                            </div>
                            <div className="text-xs text-slate-400">
                              {company.industry}
                            </div>
                          </div>
                        </div>
                        {selectedCompany?.id === company.id && (
                          <CheckIcon className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Company Info */}
        {selectedCompany && (
          <div className="bg-slate-700 rounded-md p-3">
            <div className="flex items-center mb-2">
              <BuildingIcon className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-white">Active Company</span>
            </div>
            <div className="text-sm text-slate-300">
              <div className="font-medium">{selectedCompany.name}</div>
              <div className="text-xs text-slate-400 mt-1">
                {selectedCompany.industry}
              </div>
              {selectedCompany.description && (
                <div className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {selectedCompany.description}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Stats */}
        {assignedCompanies.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="text-xs text-slate-400 text-center">
              You have access to {assignedCompanies.length} companies
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySidebar;
