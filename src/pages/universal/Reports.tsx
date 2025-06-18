import React, { useState } from 'react';
import { FileTextIcon, DownloadIcon, FilterIcon, SearchIcon, CalendarIcon, TrendingUpIcon, PieChartIcon, AlertTriangleIcon, DollarSignIcon, BarChart3Icon, UsersIcon, PlusIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { REPORT_TYPE_OPTIONS } from '../../constants/formOptions';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
const Reports: React.FC = () => {
  const {
    user
  } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('month');
  // Sample reports data
  const reports = [{
    id: 'rep-001',
    name: 'Monthly Performance Summary',
    type: 'performance',
    date: '2023-05-01',
    size: '2.4 MB',
    format: 'PDF',
    roles: ['superadmin', 'admin', 'investor']
  }, {
    id: 'rep-002',
    name: 'Investment Portfolio Analysis',
    type: 'investment',
    date: '2023-05-05',
    size: '3.8 MB',
    format: 'XLSX',
    roles: ['superadmin', 'admin', 'investor']
  }, {
    id: 'rep-003',
    name: 'Risk Assessment Report',
    type: 'risk',
    date: '2023-04-28',
    size: '1.7 MB',
    format: 'PDF',
    roles: ['superadmin', 'admin']
  }, {
    id: 'rep-004',
    name: 'Quarterly Financial Statement',
    type: 'financial',
    date: '2023-04-01',
    size: '4.2 MB',
    format: 'PDF',
    roles: ['superadmin', 'admin', 'investor']
  }, {
    id: 'rep-005',
    name: 'Market Trend Analysis',
    type: 'market',
    date: '2023-05-10',
    size: '2.9 MB',
    format: 'PDF',
    roles: ['superadmin', 'admin']
  }, {
    id: 'rep-006',
    name: 'Investor Distribution Report',
    type: 'investor',
    date: '2023-04-15',
    size: '1.5 MB',
    format: 'XLSX',
    roles: ['superadmin', 'admin']
  }, {
    id: 'rep-007',
    name: 'Tax Documentation',
    type: 'tax',
    date: '2023-03-30',
    size: '3.1 MB',
    format: 'PDF',
    roles: ['investor']
  }];
  // Filter reports based on user role
  const filteredReports = reports.filter(report => user?.role && report.roles.includes(user.role)).filter(report => {
    if (filter === 'all') return true;
    return report.type === filter;
  }).filter(report => report.name.toLowerCase().includes(searchTerm.toLowerCase()) || report.type.toLowerCase().includes(searchTerm.toLowerCase()));
  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-500/20 text-red-500';
      case 'XLSX':
        return 'bg-green-500/20 text-green-500';
      case 'DOCX':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-slate-500/20 text-slate-500';
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUpIcon className="h-5 w-5 text-blue-500" />;
      case 'investment':
        return <PieChartIcon className="h-5 w-5 text-purple-500" />;
      case 'risk':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'financial':
        return <DollarSignIcon className="h-5 w-5 text-green-500" />;
      case 'market':
        return <BarChart3Icon className="h-5 w-5 text-teal-500" />;
      case 'investor':
        return <UsersIcon className="h-5 w-5 text-indigo-500" />;
      case 'tax':
        return <FileTextIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <FileTextIcon className="h-5 w-5 text-slate-500" />;
    }
  };
  return <DashboardLayout title="Reports" subtitle="View and download your reports">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <input type="text" placeholder="Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <div className="relative">
            <select value={filter} onChange={e => setFilter(e.target.value)} className="appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              {REPORT_TYPE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FilterIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="appearance-none bg-slate-700 border border-slate-600 rounded-md py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Button variant="primary" className="flex items-center justify-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Generate Report
        </Button>
      </div>
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            Available Reports
          </h2>
          <p className="text-slate-400 mt-1">
            {filteredReports.length} reports found
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {filteredReports.map(report => <div key={report.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="mr-3">{getTypeIcon(report.type)}</div>
                  <div>
                    <h3 className="font-medium text-white">{report.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(report.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatColor(report.format)}`}>
                  {report.format}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-slate-400">{report.size}</span>
                <Button variant="secondary" size="sm" className="flex items-center">
                  <DownloadIcon className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>)}
          {filteredReports.length === 0 && <div className="col-span-full text-center py-8">
              <FileTextIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                No reports found matching your criteria
              </p>
            </div>}
        </div>
      </div>
    </DashboardLayout>;
};
export default Reports;