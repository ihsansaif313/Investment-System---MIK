import React, { useState, useEffect } from 'react';
import { SettingsIcon, DatabaseIcon, UsersIcon, ServerIcon, ShieldIcon, BarChart3Icon, RefreshCwIcon, AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'logs') {
      setLoadingLogs(true);
      setLogError(null);
      fetch('/api/activity-logs?limit=10', {
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch logs');
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setLogs(
              data.data.map((log: any) => ({
                id: log.id,
                type: log.action?.includes('error') ? 'error' : log.action?.includes('warning') ? 'warning' : 'info',
                message: log.description || log.action,
                timestamp: new Date(log.timestamp).toLocaleString(),
              }))
            );
          } else {
            setLogs([]);
          }
        })
        .catch((err) => {
          setLogError(err.message);
          setLogs([]);
        })
        .finally(() => setLoadingLogs(false));
    }
  }, [activeTab]);
  const handleRunBackup = () => {
    setIsBackupRunning(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackupRunning(false);
      setLogs(prev => [{
        id: prev.length + 1,
        type: 'info',
        message: 'Manual backup completed successfully',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }, ...prev]);
    }, 3000);
  };
  const handleToggleMaintenance = () => {
    setIsMaintenanceMode(!isMaintenanceMode);
    setLogs(prev => [{
      id: prev.length + 1,
      type: 'warning',
      message: `Maintenance mode ${!isMaintenanceMode ? 'enabled' : 'disabled'}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }, ...prev]);
  };
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
    }
  };
  return <DashboardLayout title="Admin Console" subtitle="Advanced system configuration and management">
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        {/* Tabs navigation */}
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'system' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('system')}>
              <ServerIcon className="h-4 w-4 inline mr-2" />
              System
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'users' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('users')}>
              <UsersIcon className="h-4 w-4 inline mr-2" />
              User Management
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'security' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('security')}>
              <ShieldIcon className="h-4 w-4 inline mr-2" />
              Security
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'logs' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('logs')}>
              <DatabaseIcon className="h-4 w-4 inline mr-2" />
              Logs
            </button>
          </div>
        </div>
        <div className="p-6">
          {/* System Settings */}
          {activeTab === 'system' && <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                System Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <ServerIcon className="h-5 w-5 text-blue-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-white font-medium">Server Status</h3>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-green-500 text-sm">Online</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Last restart: 22 days ago
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <DatabaseIcon className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-white font-medium">Database</h3>
                      <div className="flex items-center mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-green-500 text-sm">
                          Connected
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Version: 14.5.0
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <BarChart3Icon className="h-5 w-5 text-purple-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-white font-medium">System Usage</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">CPU</span>
                        <span className="text-xs text-white">24%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-600 rounded-full mt-1">
                        <div className="h-full bg-green-500 rounded-full" style={{
                      width: '24%'
                    }}></div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">Memory</span>
                        <span className="text-xs text-white">68%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-600 rounded-full mt-1">
                        <div className="h-full bg-yellow-500 rounded-full" style={{
                      width: '68%'
                    }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Backup & Restore
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Create backups of the system database and configuration
                    files. Automatic backups are performed daily at 3:00 AM.
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <Button variant="primary" onClick={handleRunBackup} isLoading={isBackupRunning} className="flex items-center justify-center">
                      {!isBackupRunning && <RefreshCwIcon className="h-4 w-4 mr-2" />}
                      {isBackupRunning ? 'Running Backup...' : 'Run Backup Now'}
                    </Button>
                    <Button variant="secondary">Restore from Backup</Button>
                  </div>
                </div>
                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4">
                    Maintenance Mode
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Enable maintenance mode to temporarily prevent user access
                    while performing system updates or maintenance tasks.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${isMaintenanceMode ? 'bg-yellow-500' : 'bg-green-500'} mr-2`}></div>
                      <span className={`text-sm ${isMaintenanceMode ? 'text-yellow-500' : 'text-green-500'}`}>
                        {isMaintenanceMode ? 'Maintenance Mode Active' : 'System Available'}
                      </span>
                    </div>
                    <Button variant={isMaintenanceMode ? 'secondary' : 'warning'} size="sm" onClick={handleToggleMaintenance}>
                      {isMaintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>}
          {/* User Management */}
          {activeTab === 'users' && <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                User Management
              </h2>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <input type="text" placeholder="Search users..." className="w-full sm:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
                <Button variant="primary" className="flex items-center justify-center">
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Role</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Last Active</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                            S
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              Super Admin
                            </div>
                            <div className="text-sm text-slate-400">
                              superadmin@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-500">
                          Superadmin
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">Now</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            Disable
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                            A
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              Admin User
                            </div>
                            <div className="text-sm text-slate-400">
                              admin@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-500">
                          Admin
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">2 hours ago</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            Disable
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                            J
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              John Investor
                            </div>
                            <div className="text-sm text-slate-400">
                              investor@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          Investor
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          Active
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">1 day ago</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                          <Button variant="danger" size="sm">
                            Disable
                          </Button>
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-700">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-medium">
                            M
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-white">
                              Mary Smith
                            </div>
                            <div className="text-sm text-slate-400">
                              mary@example.com
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                          Investor
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-500/20 text-slate-500">
                          Inactive
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">2 weeks ago</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">
                            Edit
                          </Button>
                          <Button variant="success" size="sm">
                            Enable
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>}
          {/* Security Settings */}
          {activeTab === 'security' && <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Security Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <ShieldIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    Authentication Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-sm text-slate-400">
                          Require 2FA for all admin users
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          Password Expiration
                        </h4>
                        <p className="text-sm text-slate-400">
                          Force password reset every 90 days
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          Login Attempts
                        </h4>
                        <p className="text-sm text-slate-400">
                          Lock account after 5 failed attempts
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <ShieldIcon className="h-5 w-5 text-yellow-500 mr-2" />
                    API Security
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">
                        API Rate Limiting
                      </h4>
                      <div className="flex items-center mb-2">
                        <input type="range" min="50" max="500" step="50" defaultValue="100" className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer" />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>50 req/min</span>
                        <span>100 req/min</span>
                        <span>500 req/min</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          API Key Rotation
                        </h4>
                        <p className="text-sm text-slate-400">
                          Automatically rotate API keys
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">
                          IP Whitelisting
                        </h4>
                        <p className="text-sm text-slate-400">
                          Restrict API access by IP
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-700 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-white mb-4">
                  Security Audit Log
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 mr-3">
                      <UsersIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-white">
                        Admin user login from new IP address
                      </p>
                      <p className="text-xs text-slate-400">Today, 10:24 AM</p>
                    </div>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mr-3">
                      <AlertTriangleIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-white">
                        Failed login attempts (3) for user investor@example.com
                      </p>
                      <p className="text-xs text-slate-400">
                        Yesterday, 6:42 PM
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </div>
                  <div className="flex items-center p-3 bg-slate-800 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mr-3">
                      <RefreshCwIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-grow">
                      <p className="text-white">
                        Security settings updated by superadmin
                      </p>
                      <p className="text-xs text-slate-400">
                        May 20, 2023, 3:15 PM
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      View
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Button variant="secondary" size="sm">
                    View Full Audit Log
                  </Button>
                </div>
              </div>
            </div>}
          {/* System Logs */}
          {activeTab === 'logs' && <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                System Logs
              </h2>
              {loadingLogs ? (
                <div className="text-slate-400">Loading logs...</div>
              ) : logError ? (
                <div className="text-red-500">{logError}</div>
              ) : (
                <>
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center">
                      <input type="text" placeholder="Search logs..." className="w-full sm:w-64 bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                    </div>
                    <div className="flex space-x-2">
                      <select className="bg-slate-700 border border-slate-600 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500">
                        <option value="all">All Types</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </select>
                      <Button variant="secondary" size="sm" className="flex items-center">
                        <RefreshCwIcon className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  <div className="bg-slate-700 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-slate-400 border-b border-slate-600">
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">Message</th>
                            <th className="p-4 font-medium">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map(log => <tr key={log.id} className="border-b border-slate-600">
                              <td className="p-4">
                                <div className="flex items-center">
                                  {getLogIcon(log.type)}
                                  <span className={`ml-2 ${log.type === 'info' ? 'text-blue-500' : log.type === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
                                    {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                  </span>
                                </div>
                              </td>
                              <td className="p-4 text-white">{log.message}</td>
                              <td className="p-4 text-slate-400">
                                {log.timestamp}
                              </td>
                            </tr>)}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>}
        </div>
      </div>
    </DashboardLayout>;
};
export default AdminConsole;