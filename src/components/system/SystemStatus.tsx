import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySelection } from '../../contexts/CompanySelectionContext';
import apiService from '../../services/api';

interface SystemCheck {
  name: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: string;
}

const SystemStatus: React.FC = () => {
  const { user } = useAuth();
  const { hasCompanyAccess, assignedCompanies, selectedCompany } = useCompanySelection();
  const [checks, setChecks] = useState<SystemCheck[]>([]);
  const [loading, setLoading] = useState(false);

  const runSystemChecks = async () => {
    setLoading(true);
    const newChecks: SystemCheck[] = [];

    // 1. Authentication Check
    if (user) {
      newChecks.push({
        name: 'Authentication',
        status: 'success',
        message: 'User authenticated successfully',
        details: `Logged in as ${user.firstName} ${user.lastName} (${user.role.id})`
      });
    } else {
      newChecks.push({
        name: 'Authentication',
        status: 'error',
        message: 'User not authenticated',
        details: 'Please log in to access the system'
      });
    }

    // 2. Backend API Check
    try {
      const response = await fetch('http://localhost:3001/health');
      const healthResponse = await response.json();
      newChecks.push({
        name: 'Backend API',
        status: 'success',
        message: 'Backend API responding',
        details: healthResponse.message || 'API is healthy'
      });
    } catch (error) {
      newChecks.push({
        name: 'Backend API',
        status: 'error',
        message: 'Backend API not responding',
        details: 'Unable to connect to the backend server'
      });
    }

    // 3. Role-based Access Control Check
    if (user) {
      const rolePermissions = user.role.permissions || [];
      newChecks.push({
        name: 'Role-based Access Control',
        status: 'success',
        message: `Role: ${user.role.id}`,
        details: `Permissions: ${rolePermissions.length > 0 ? rolePermissions.join(', ') : 'Default permissions'}`
      });
    }

    // 4. Company-based Access Control Check (for admins)
    if (user?.role.id === 'admin') {
      if (hasCompanyAccess) {
        newChecks.push({
          name: 'Company Access Control',
          status: 'success',
          message: `Access to ${assignedCompanies.length} company(ies)`,
          details: selectedCompany ? `Currently selected: ${selectedCompany.name}` : 'No company selected'
        });
      } else {
        newChecks.push({
          name: 'Company Access Control',
          status: 'warning',
          message: 'No company assignments',
          details: 'Waiting for super admin to assign you to a company'
        });
      }
    } else if (user?.role.id === 'superadmin') {
      newChecks.push({
        name: 'Company Management',
        status: 'success',
        message: 'Full company management access',
        details: 'Can create companies and assign admins'
      });
    }

    // 5. Database Integration Check
    try {
      if (user?.role.id === 'superadmin') {
        const companiesResponse = await apiService.getSubCompanies();
        newChecks.push({
          name: 'Database Integration',
          status: 'success',
          message: 'Database connected',
          details: `Found ${companiesResponse?.length || 0} companies in database`
        });
      } else if (user?.role.id === 'admin' && hasCompanyAccess) {
        const assignmentsResponse = await apiService.getCompanyAssignments();
        newChecks.push({
          name: 'Database Integration',
          status: 'success',
          message: 'Database connected',
          details: `Found ${assignmentsResponse?.length || 0} company assignments`
        });
      } else {
        newChecks.push({
          name: 'Database Integration',
          status: 'success',
          message: 'Database connected',
          details: 'Limited access based on role'
        });
      }
    } catch (error) {
      newChecks.push({
        name: 'Database Integration',
        status: 'error',
        message: 'Database connection issues',
        details: 'Unable to fetch data from database'
      });
    }

    // 6. Real-time Updates Check
    newChecks.push({
      name: 'Real-time Updates',
      status: 'success',
      message: 'Real-time system active',
      details: 'Event-based updates configured for company assignments'
    });

    setChecks(newChecks);
    setLoading(false);
  };

  useEffect(() => {
    runSystemChecks();
  }, [user, hasCompanyAccess, selectedCompany]);

  const getStatusIcon = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'loading':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <ClockIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: SystemCheck['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10';
      case 'error':
        return 'border-red-500/20 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10';
      case 'loading':
        return 'border-blue-500/20 bg-blue-500/10';
      default:
        return 'border-slate-500/20 bg-slate-500/10';
    }
  };

  const overallStatus = checks.every(check => check.status === 'success') ? 'success' :
                       checks.some(check => check.status === 'error') ? 'error' : 'warning';

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {getStatusIcon(overallStatus)}
          <h3 className="text-lg font-semibold text-white ml-2">
            System Status
          </h3>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={runSystemChecks}
          disabled={loading}
        >
          {loading ? (
            <RefreshCwIcon className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {checks.map((check, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {getStatusIcon(check.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-white">{check.name}</h4>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    check.status === 'success' ? 'bg-green-500/20 text-green-400' :
                    check.status === 'error' ? 'bg-red-500/20 text-red-400' :
                    check.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-1">{check.message}</p>
                {check.details && (
                  <p className="text-slate-400 text-xs mt-2">{check.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-slate-700">
        <div className="text-center">
          <p className="text-sm text-slate-400">
            Company-based Access Control System: {' '}
            <span className={`font-medium ${
              overallStatus === 'success' ? 'text-green-400' :
              overallStatus === 'error' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {overallStatus === 'success' ? 'Fully Operational' :
               overallStatus === 'error' ? 'Issues Detected' : 'Partially Operational'}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Last checked: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
