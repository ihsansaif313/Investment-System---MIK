import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon, ChevronRightIcon } from 'lucide-react';
import Card from '../ui/Card';
interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string;
  performance: {
    profit: number;
    loss: number;
    roi: number;
  };
  status: 'active' | 'inactive' | 'pending';
}
interface CompanyTableProps {
  companies: Company[];
  isLoading?: boolean;
  className?: string;
}
const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  isLoading = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-500';
      case 'inactive':
        return 'bg-slate-500/20 text-slate-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  return <Card className={`${className}`} title="Sub-Company Performance">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
              <th className="pb-2 font-medium">Company</th>
              <th className="pb-2 font-medium">Profit</th>
              <th className="pb-2 font-medium">Loss</th>
              <th className="pb-2 font-medium">ROI</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? [...Array(3)].map((_, i) => <tr key={i} className="animate-pulse">
                    <td className="py-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-slate-700"></div>
                        <div className="ml-3">
                          <div className="h-4 w-24 bg-slate-700 rounded"></div>
                          <div className="h-3 w-16 bg-slate-700 rounded mt-1"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-4 w-12 bg-slate-700 rounded"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-6 w-16 bg-slate-700 rounded"></div>
                    </td>
                    <td className="py-3">
                      <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                    </td>
                  </tr>) : companies.map(company => <tr key={company.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="py-3">
                      <div className="flex items-center">
                        <img src={company.logo} alt={company.name} className="h-10 w-10 rounded object-cover" />
                        <div className="ml-3">
                          <div className="font-medium text-white">
                            {company.name}
                          </div>
                          <div className="text-sm text-slate-400">
                            {company.industry}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-green-500">
                      {formatCurrency(company.performance.profit)}
                    </td>
                    <td className="py-3 text-red-500">
                      {formatCurrency(company.performance.loss)}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center">
                        {company.performance.roi > 0 ? <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" /> : <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />}
                        <span className={company.performance.roi > 0 ? 'text-green-500' : 'text-red-500'}>
                          {company.performance.roi}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => navigate(`/superadmin/company/${company.id}`)} className="p-1 rounded-full hover:bg-slate-700">
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      </button>
                    </td>
                  </tr>)}
            {!isLoading && companies.length === 0 && <tr>
                <td colSpan={6} className="py-4 text-center text-slate-400">
                  No companies found
                </td>
              </tr>}
          </tbody>
        </table>
      </div>
    </Card>;
};
export default CompanyTable;