import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SubCompany, CompanyAssignment } from '../types/database';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

interface CompanySelectionContextType {
  assignedCompanies: SubCompany[];
  selectedCompany: SubCompany | null;
  loading: boolean;
  error: string | null;
  selectCompany: (company: SubCompany | null) => void;
  fetchAssignedCompanies: () => Promise<void>;
  hasCompanyAccess: boolean;
}

const CompanySelectionContext = createContext<CompanySelectionContextType | undefined>(undefined);

interface CompanySelectionProviderProps {
  children: ReactNode;
}

export const CompanySelectionProvider: React.FC<CompanySelectionProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [assignedCompanies, setAssignedCompanies] = useState<SubCompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<SubCompany | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignedCompanies = async () => {
    if (!user || user.role.id !== 'admin') {
      setAssignedCompanies([]);
      setSelectedCompany(null);
      return;
    }

    // If admin is pending approval, don't fetch companies
    if (user.role.status === 'pending') {
      setAssignedCompanies([]);
      setSelectedCompany(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/company-assignments/user/${user.id}`);
      const assignments: CompanyAssignment[] = response.data || [];
      
      // Extract companies from assignments
      const companies = assignments
        .filter(assignment => assignment.status === 'active')
        .map(assignment => assignment.subCompanyId)
        .filter(company => company != null);

      setAssignedCompanies(companies);

      // Auto-select first company if none selected and companies available
      if (companies.length > 0 && !selectedCompany) {
        setSelectedCompany(companies[0]);
        // Store selection in localStorage for persistence
        localStorage.setItem('selectedCompanyId', companies[0].id);
      } else if (companies.length === 0) {
        setSelectedCompany(null);
        localStorage.removeItem('selectedCompanyId');
      }
    } catch (error: any) {
      console.error('Failed to fetch assigned companies:', error);
      setError(error.response?.data?.message || 'Failed to load assigned companies');
      setAssignedCompanies([]);
      setSelectedCompany(null);
    } finally {
      setLoading(false);
    }
  };

  const selectCompany = (company: SubCompany | null) => {
    setSelectedCompany(company);
    if (company) {
      localStorage.setItem('selectedCompanyId', company.id);
    } else {
      localStorage.removeItem('selectedCompanyId');
    }
  };

  // Load persisted company selection on mount
  useEffect(() => {
    if (user && user.role.id === 'admin') {
      fetchAssignedCompanies();
    }
  }, [user]);

  // Restore selected company from localStorage after companies are loaded
  useEffect(() => {
    if (assignedCompanies.length > 0 && !selectedCompany) {
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        const savedCompany = assignedCompanies.find(c => c.id === savedCompanyId);
        if (savedCompany) {
          setSelectedCompany(savedCompany);
        }
      }
    }
  }, [assignedCompanies]);

  // Listen for real-time updates via window events
  useEffect(() => {
    const handleCompanyAssignmentUpdate = () => {
      fetchAssignedCompanies();
    };

    window.addEventListener('companyAssignmentUpdated', handleCompanyAssignmentUpdate);
    return () => {
      window.removeEventListener('companyAssignmentUpdated', handleCompanyAssignmentUpdate);
    };
  }, [fetchAssignedCompanies]);

  const hasCompanyAccess = user?.role.id === 'admin' && user.role.status === 'active' && assignedCompanies.length > 0;

  const value: CompanySelectionContextType = {
    assignedCompanies,
    selectedCompany,
    loading,
    error,
    selectCompany,
    fetchAssignedCompanies,
    hasCompanyAccess
  };

  return (
    <CompanySelectionContext.Provider value={value}>
      {children}
    </CompanySelectionContext.Provider>
  );
};

export const useCompanySelection = (): CompanySelectionContextType => {
  const context = useContext(CompanySelectionContext);
  if (context === undefined) {
    throw new Error('useCompanySelection must be used within a CompanySelectionProvider');
  }
  return context;
};

// Hook to get current company ID for API calls
export const useSelectedCompanyId = (): string | null => {
  const { selectedCompany } = useCompanySelection();
  return selectedCompany?.id || null;
};

// Hook to check if user has access to a specific company
export const useCompanyAccess = (companyId?: string): boolean => {
  const { assignedCompanies, selectedCompany } = useCompanySelection();
  
  if (!companyId) {
    return selectedCompany != null;
  }
  
  return assignedCompanies.some(company => company.id === companyId);
};
