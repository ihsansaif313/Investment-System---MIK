/**
 * Demo Credentials Card Component
 * Simple display of demo login credentials for quick reference
 */

import React from 'react';
import { Shield, User, TrendingUp, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { useSuccessToast } from '../ui/Toast';

const DemoCredentialsCard: React.FC = () => {
  const [copiedCredential, setCopiedCredential] = useState<string | null>(null);
  const successToast = useSuccessToast();

  const demoAccounts = [
    {
      role: 'Super Admin',
      email: 'miksupadmin@gmail.com',
      password: 'Mik123!',
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      color: 'border-purple-500/30 bg-purple-500/5'
    },
    {
      role: 'Admin',
      email: 'mikadmin@gmail.com',
      password: 'Mik123!',
      icon: <User className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/30 bg-blue-500/5'
    },
    {
      role: 'Investor',
      email: 'mikinvestor@gmail.com',
      password: 'Mik123!',
      icon: <TrendingUp className="w-4 h-4 text-green-400" />,
      color: 'border-green-500/30 bg-green-500/5'
    }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCredential(`${type}`);
      successToast('Copied!', `${type} copied to clipboard`);
      setTimeout(() => setCopiedCredential(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Demo Accounts</h3>
        <p className="text-sm text-slate-400">Quick access for presentations</p>
      </div>

      <div className="space-y-3">
        {demoAccounts.map((account) => (
          <div
            key={account.email}
            className={`border rounded-lg p-3 ${account.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {account.icon}
                <span className="font-medium text-white text-sm">{account.role}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <div className="flex items-center gap-1">
                  <code className="text-white bg-slate-900/50 px-2 py-1 rounded">
                    {account.email}
                  </code>
                  <button
                    onClick={() => copyToClipboard(account.email, 'Email')}
                    className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                  >
                    {copiedCredential === 'Email' ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password:</span>
                <div className="flex items-center gap-1">
                  <code className="text-white bg-slate-900/50 px-2 py-1 rounded">
                    {account.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(account.password, 'Password')}
                    className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                  >
                    {copiedCredential === 'Password' ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} className="text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-yellow-500 text-xs font-bold">!</span>
          </div>
          <p className="text-yellow-500/80 text-xs">
            These accounts use hardcoded demo data and bypass normal authentication. 
            Perfect for client presentations without database dependencies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoCredentialsCard;
