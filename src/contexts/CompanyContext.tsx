import React, { useState, createContext, useContext } from 'react';
import apiService from '../services/api';
interface Company {
  id: string;
  name: string;
  industry: string;
  adminId: string;
  joinDate: string;
  logo: string;
  performance: {
    profit: number;
    loss: number;
    roi: number;
  };
  status: 'active' | 'inactive' | 'pending';
}
interface CompanyContextType {
  companies: Company[];
  loading: boolean;
  fetchCompanies: () => Promise<void>;
  getCompanyById: (id: string) => Company | undefined;
}
const CompanyContext = createContext<CompanyContextType>({
  companies: [],
  loading: false,
  fetchCompanies: async () => {},
  getCompanyById: () => undefined
});
export const useCompany = () => useContext(CompanyContext);
export const CompanyProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Fetch companies from API service
      const subCompanies = await apiService.getSubCompanies();

      // Transform SubCompanyWithDetails to Company format
      const transformedCompanies: Company[] = subCompanies.map(company => ({
        id: company.id,
        name: company.name,
        industry: company.industry,
        adminId: company.admin?.id || '',
        joinDate: company.established_date.toISOString().split('T')[0],
        logo: 'https://via.placeholder.com/150', // Default logo
        performance: {
          profit: company.profitLoss?.profit || 0,
          loss: company.profitLoss?.loss || 0,
          roi: company.profitLoss?.roi || 0
        },
        status: company.status as 'active' | 'inactive' | 'pending'
      }));

      setCompanies(transformedCompanies);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  const getCompanyById = (id: string): Company | undefined => {
    return companies.find(company => company.id === id);
  };
  return <CompanyContext.Provider value={{
    companies,
    loading,
    fetchCompanies,
    getCompanyById
  }}>
      {children}
    </CompanyContext.Provider>;
};