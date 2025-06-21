/**
 * Demo Banner Component
 * Shows when the user is logged in with a demo account
 */

import React, { useState } from 'react';
import { Zap, X, Info, Eye } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { getDemoAccountsInfo } from '../../services/demoAuth';

const DemoBanner: React.FC = () => {
  const { user } = useAuth();
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Only show for demo users
  const isDemoUser = user && (user as any).isDemo;
  if (!isDemoUser) return null;

  const demoAccounts = getDemoAccountsInfo();
  const currentAccount = demoAccounts.find(account => account.email === user?.email);

  if (isMinimized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsMinimized(false)}
          className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 flex items-center gap-2"
        >
          <Zap size={14} />
          Demo Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-500/30 rounded-full flex items-center justify-center">
                <Zap size={14} className="text-yellow-400" />
              </div>
              <span className="text-yellow-400 font-semibold text-sm">Demo Mode Active</span>
            </div>
            
            {currentAccount && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="text-yellow-400/80">Logged in as:</span>
                <span className="text-white font-medium">{currentAccount.role}</span>
                <span className="text-yellow-400/60">({user?.email})</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="bg-transparent border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-1"
            >
              <Info size={12} />
              <span className="hidden sm:inline">Details</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMinimized(true)}
              className="bg-transparent border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              <X size={14} />
            </Button>
          </div>
        </div>

        {showDetails && (
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Demo Features</span>
                </div>
                <ul className="text-yellow-400/80 space-y-1 text-xs">
                  <li>• Hardcoded demo data</li>
                  <li>• No backend dependencies</li>
                  <li>• Perfect for presentations</li>
                  <li>• All features functional</li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Current Role</span>
                </div>
                <div className="text-yellow-400/80 text-xs">
                  <div className="font-medium text-white">{currentAccount?.role}</div>
                  <div className="mt-1">{currentAccount?.description}</div>
                </div>
              </div>

              <div className="bg-yellow-500/10 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Other Demo Accounts</span>
                </div>
                <div className="text-yellow-400/80 text-xs space-y-1">
                  {demoAccounts
                    .filter(account => account.email !== user?.email)
                    .map(account => (
                      <div key={account.email}>
                        <span className="text-white font-medium">{account.role}:</span> {account.email}
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 bg-orange-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-400 text-xs font-bold">!</span>
                </div>
                <div className="text-xs">
                  <span className="text-orange-400 font-medium">Note:</span>
                  <span className="text-orange-400/80 ml-1">
                    This is a demonstration environment with simulated data. 
                    All investments, users, and financial data are fictional and for presentation purposes only.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoBanner;
