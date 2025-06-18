import React, { useState, createContext, useContext } from 'react';
import apiService from '../services/api';
interface Investment {
  id: string;
  name: string;
  type: 'Stocks' | 'Real Estate' | 'Crypto' | 'Business';
  amount: number;
  roi: number;
  startDate: string;
  term: string;
  status: 'Performing' | 'At Risk' | 'Closed';
  companyId: string;
}
interface InvestmentContextType {
  investments: Investment[];
  loading: boolean;
  fetchInvestments: (companyId?: string) => Promise<void>;
  getInvestmentById: (id: string) => Investment | undefined;
}
const InvestmentContext = createContext<InvestmentContextType>({
  investments: [],
  loading: false,
  fetchInvestments: async () => {},
  getInvestmentById: () => undefined
});
export const useInvestment = () => useContext(InvestmentContext);
export const InvestmentProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchInvestments = async (companyId?: string) => {
    setLoading(true);
    try {
      // Fetch investments from API service
      const investmentDetails = await apiService.getInvestments();

      // Filter by companyId if provided
      const filteredInvestments = companyId ?
        investmentDetails.filter(inv => inv.sub_company_id === companyId) :
        investmentDetails;

      // Transform InvestmentWithDetails to Investment format
      const transformedInvestments: Investment[] = filteredInvestments.map(investment => ({
        id: investment.id,
        name: investment.name,
        type: (investment.asset?.type as 'Stocks' | 'Real Estate' | 'Crypto' | 'Business') || 'Business',
        amount: investment.initial_amount,
        roi: investment.currentROI || investment.expected_roi || 0,
        startDate: investment.start_date.toISOString().split('T')[0],
        term: '12 months', // Default term - could be calculated from dates
        status: investment.status === 'Active' ? 'Performing' :
                investment.status === 'Completed' ? 'Closed' : 'At Risk',
        companyId: investment.sub_company_id
      }));

      setInvestments(transformedInvestments);
    } catch (error) {
      console.error('Failed to fetch investments:', error);
      setInvestments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  const getInvestmentById = (id: string): Investment | undefined => {
    return investments.find(investment => investment.id === id);
  };
  return <InvestmentContext.Provider value={{
    investments,
    loading,
    fetchInvestments,
    getInvestmentById
  }}>
      {children}
    </InvestmentContext.Provider>;
};