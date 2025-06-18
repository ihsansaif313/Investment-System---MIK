import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Building2,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'financial' | 'performance' | 'portfolio' | 'compliance';
  roles: ('superadmin' | 'admin' | 'investor')[];
  format: ('pdf' | 'excel' | 'csv')[];
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const currentRole = user?.role.type;

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Comprehensive overview of financial performance, profit/loss, and ROI metrics',
      icon: <DollarSign className="w-6 h-6" />,
      type: 'financial',
      roles: ['superadmin', 'admin', 'investor'],
      format: ['pdf', 'excel', 'csv']
    },
    {
      id: 'investment-performance',
      name: 'Investment Performance Report',
      description: 'Detailed analysis of investment performance, trends, and comparative metrics',
      icon: <TrendingUp className="w-6 h-6" />,
      type: 'performance',
      roles: ['superadmin', 'admin', 'investor'],
      format: ['pdf', 'excel']
    },
    {
      id: 'portfolio-analysis',
      name: 'Portfolio Analysis Report',
      description: 'In-depth portfolio breakdown, asset allocation, and risk assessment',
      icon: <PieChart className="w-6 h-6" />,
      type: 'portfolio',
      roles: ['superadmin', 'admin', 'investor'],
      format: ['pdf', 'excel']
    },
    {
      id: 'company-overview',
      name: 'Company Overview Report',
      description: 'Complete company performance, sub-company analysis, and operational metrics',
      icon: <Building2 className="w-6 h-6" />,
      type: 'performance',
      roles: ['superadmin', 'admin'],
      format: ['pdf', 'excel']
    },
    {
      id: 'investor-summary',
      name: 'Investor Summary Report',
      description: 'Investor activity, engagement metrics, and investment patterns',
      icon: <Users className="w-6 h-6" />,
      type: 'performance',
      roles: ['superadmin', 'admin'],
      format: ['pdf', 'excel', 'csv']
    },
    {
      id: 'compliance-report',
      name: 'Compliance & Audit Report',
      description: 'Regulatory compliance status, audit trails, and documentation',
      icon: <FileText className="w-6 h-6" />,
      type: 'compliance',
      roles: ['superadmin', 'admin'],
      format: ['pdf', 'excel']
    },
    {
      id: 'monthly-statement',
      name: 'Monthly Statement',
      description: 'Monthly investment statement with transactions and performance summary',
      icon: <BarChart3 className="w-6 h-6" />,
      type: 'financial',
      roles: ['superadmin', 'admin', 'investor'],
      format: ['pdf']
    }
  ];

  // Filter reports based on user role
  const availableReports = reportTemplates.filter(report => 
    currentRole && report.roles.includes(currentRole)
  );

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const report = reportTemplates.find(r => r.id === reportId);
      successToast(
        'Report Generated Successfully', 
        `${report?.name} has been generated and will be downloaded shortly`
      );
      
      // In a real application, this would trigger the actual download
      // For now, we'll just simulate it
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = '#'; // This would be the actual file URL
        link.download = `${reportId}-${Date.now()}.${selectedFormat}`;
        // link.click(); // Uncomment for actual download
      }, 1000);
      
    } catch (error) {
      errorToast('Report Generation Failed', 'Please try again or contact support');
    } finally {
      setIsGenerating(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'bg-green-500/20 text-green-400';
      case 'performance':
        return 'bg-blue-500/20 text-blue-400';
      case 'portfolio':
        return 'bg-purple-500/20 text-purple-400';
      case 'compliance':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <DashboardLayout title="Reports" subtitle="Generate comprehensive reports and analytics">
      {/* Report Configuration */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={selectedDateRange.start}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
              leftIcon={<Calendar size={16} />}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={selectedDateRange.end}
              onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
              leftIcon={<Calendar size={16} />}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <Card key={report.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  {report.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{report.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                    {report.type}
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {report.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Formats:</span>
                {report.format.map((format) => (
                  <span key={format} className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {format.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Download size={16} />}
              onClick={() => handleGenerateReport(report.id)}
              isLoading={isGenerating === report.id}
              disabled={!!isGenerating || !report.format.includes(selectedFormat)}
            >
              {isGenerating === report.id ? 'Generating...' : 'Generate Report'}
            </Button>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            leftIcon={<TrendingUp size={16} />}
            onClick={() => handleGenerateReport('financial-summary')}
            disabled={!!isGenerating}
          >
            Generate Financial Summary
          </Button>
          
          <Button
            variant="secondary"
            leftIcon={<BarChart3 size={16} />}
            onClick={() => handleGenerateReport('investment-performance')}
            disabled={!!isGenerating}
          >
            Performance Report
          </Button>
          
          <Button
            variant="secondary"
            leftIcon={<PieChart size={16} />}
            onClick={() => handleGenerateReport('portfolio-analysis')}
            disabled={!!isGenerating}
          >
            Portfolio Analysis
          </Button>
        </div>
      </Card>

      {/* Report History */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Reports</h3>
        
        <div className="space-y-3">
          {[
            { name: 'Financial Summary Report', date: '2024-06-15', format: 'PDF', size: '2.4 MB' },
            { name: 'Investment Performance Report', date: '2024-06-10', format: 'Excel', size: '1.8 MB' },
            { name: 'Portfolio Analysis Report', date: '2024-06-05', format: 'PDF', size: '3.1 MB' }
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-white font-medium">{report.name}</p>
                  <p className="text-sm text-slate-400">{report.date} • {report.format} • {report.size}</p>
                </div>
              </div>
              <Button size="sm" variant="secondary" leftIcon={<Download size={14} />}>
                Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
};

export default Reports;
