/**
 * Demo Login Panel Component
 * Displays available demo accounts for quick client presentation access
 */

import React, { useState } from 'react';
import { User, Shield, TrendingUp, Eye, EyeOff, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';
import { getDemoAccountsInfo } from '../../services/demoAuth';
import { useAuth } from '../../contexts/AuthContext';
import { useSuccessToast, useErrorToast } from '../ui/Toast';

interface DemoLoginPanelProps {
  onClose?: () => void;
  className?: string;
}

const DemoLoginPanel: React.FC<DemoLoginPanelProps> = ({ onClose, className = '' }) => {
  const { login } = useAuth();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const demoAccounts = getDemoAccountsInfo();

  const handleDemoLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await login(email, password);
      successToast('Demo login successful', `Logged in as ${email}`);
      onClose?.();
    } catch (error: any) {
      errorToast('Demo login failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const copyCredentials = async (email: string, password: string) => {
    try {
      await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`);
      setCopiedAccount(email);
      successToast('Credentials copied', 'Email and password copied to clipboard');
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (error) {
      errorToast('Copy failed', 'Unable to copy to clipboard');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return <Shield className="w-5 h-5 text-purple-500" />;
      case 'Admin':
        return <User className="w-5 h-5 text-blue-500" />;
      case 'Investor':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'Admin':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'Investor':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Demo Accounts</h3>
          <p className="text-sm text-slate-400">Quick access for client presentations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
            className="flex items-center gap-2"
          >
            {showPasswords ? <EyeOff size={14} /> : <Eye size={14} />}
            {showPasswords ? 'Hide' : 'Show'} Passwords
          </Button>
          {onClose && (
            <Button variant="secondary" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className={`border rounded-lg p-4 transition-all duration-200 hover:border-opacity-50 ${getRoleColor(account.role)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getRoleIcon(account.role)}
                <div>
                  <h4 className="font-medium text-white">{account.role}</h4>
                  <p className="text-sm text-slate-400">{account.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyCredentials(account.email, account.password)}
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  {copiedAccount === account.email ? (
                    <Check size={12} className="text-green-400" />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={isLoading}
                  className="min-w-[80px]"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <div className="bg-slate-900/50 rounded px-3 py-2 text-white font-mono text-xs">
                  {account.email}
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <div className="bg-slate-900/50 rounded px-3 py-2 text-white font-mono text-xs">
                  {showPasswords ? account.password : '••••••••'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-yellow-500 text-xs font-bold">!</span>
          </div>
          <div>
            <h5 className="text-yellow-500 font-medium text-sm mb-1">Demo Mode</h5>
            <p className="text-yellow-500/80 text-xs leading-relaxed">
              These accounts bypass normal authentication and use hardcoded demo data. 
              Perfect for client presentations without requiring database setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoLoginPanel;
