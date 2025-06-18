import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, FileTextIcon, CheckCircleIcon, LogOutIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
const PendingApproval: React.FC = () => {
  const {
    logout
  } = useAuth();
  const navigate = useNavigate();
  return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6">
            <ClockIcon className="h-10 w-10 text-yellow-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Account Pending Approval
          </h1>
          <p className="text-slate-400 mb-6">
            Your investor account is currently under review by our
            administration team. This process typically takes 1-2 business days.
          </p>
          <div className="w-full bg-slate-700/50 rounded-lg p-4 mb-6">
            <h2 className="text-white font-medium mb-3 flex items-center">
              <FileTextIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Next Steps:
            </h2>
            <ul className="text-left space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-slate-300">
                  Your application has been received
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full border-2 border-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  Our team is reviewing your verification documents
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full border-2 border-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  Once approved, you'll receive an email confirmation
                </span>
              </li>
              <li className="flex items-start">
                <div className="h-5 w-5 rounded-full border-2 border-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">
                  You can then log in and start investing
                </span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            If you have any questions or need assistance, please contact our
            support team at
            <a href="mailto:support@example.com" className="text-yellow-500 ml-1">
              support@example.com
            </a>
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full">
            <Button variant="secondary" onClick={() => navigate('/login')} fullWidth className="flex items-center justify-center">
              <LogOutIcon className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        <div className="bg-slate-700/30 p-4 text-center">
          <p className="text-sm text-slate-400">
            Thank you for your patience. We're working to verify your account as
            quickly as possible.
          </p>
        </div>
      </div>
    </div>;
};
export default PendingApproval;