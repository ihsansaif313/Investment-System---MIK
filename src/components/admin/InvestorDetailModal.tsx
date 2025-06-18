import React, { useState } from 'react';
import { XIcon, CheckCircleIcon, XCircleIcon, FileIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import Button from '../ui/Button';
interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  verified: boolean;
}
interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: string;
}

interface Investor {
  id: string;
  name: string;
  email: string;
  phone: string;
  investmentTotal: number;
  investmentCount: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  joinDate: string;
  lastActivity: string;
  documents?: Document[];
  investments?: Investment[];
}
interface InvestorDetailModalProps {
  investor: Investor;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}
const InvestorDetailModal: React.FC<InvestorDetailModalProps> = ({
  investor,
  onClose,
  onApprove,
  onReject,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const handleApprove = () => {
    onApprove(investor.id);
  };
  const handleReject = () => {
    onReject(investor.id);
  };
  return <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl border border-slate-700">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium mr-3">
              {investor.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">
                {investor.name}
              </h3>
              <p className="text-sm text-slate-400">
                {investor.status === 'pending' ? 'Waiting for approval' : `${investor.status.charAt(0).toUpperCase() + investor.status.slice(1)} investor`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'profile' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('profile')}>
              Profile
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'documents' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('documents')}>
              Documents
            </button>
            <button className={`px-6 py-4 text-sm font-medium ${activeTab === 'investments' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-slate-400 hover:text-white'}`} onClick={() => setActiveTab('investments')}>
              Investments
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'profile' && <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Full Name</p>
                    <p className="text-white font-medium">{investor.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Email Address</p>
                    <p className="text-white">{investor.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Phone Number</p>
                    <p className="text-white">{investor.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Joined On</p>
                    <p className="text-white">
                      {formatDate(investor.joinDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Last Activity</p>
                    <p className="text-white">
                      {formatDate(investor.lastActivity)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Status</p>
                    <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium
                      ${investor.status === 'active' ? 'bg-green-500/20 text-green-500' : investor.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : investor.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-slate-500/20 text-slate-500'}`}>
                      {investor.status.charAt(0).toUpperCase() + investor.status.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-6">
                <h4 className="text-md font-medium text-white mb-4">
                  Investment Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">
                      Total Invested
                    </p>
                    <p className="text-xl font-bold text-white">
                      ${investor.investmentTotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">
                      Number of Investments
                    </p>
                    <p className="text-xl font-bold text-white">
                      {investor.investmentCount}
                    </p>
                  </div>
                  <div className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-sm text-slate-400 mb-1">
                      Avg. Investment
                    </p>
                    <p className="text-xl font-bold text-white">
                      {investor.investmentCount > 0 ? `$${(investor.investmentTotal / investor.investmentCount).toLocaleString()}` : '$0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>}
          {activeTab === 'documents' && <div>
              <h4 className="text-md font-medium text-white mb-4">
                Verification Documents
              </h4>
              {investor.documents && investor.documents.length > 0 ? <div className="space-y-4">
                  {investor.documents.map(doc => <div key={doc.id} className="bg-slate-700 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-slate-600 flex items-center justify-center mr-4">
                          <FileIcon className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-sm text-slate-400">
                            Uploaded on {formatDate(doc.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <div>
                        {doc.verified ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-500/20 text-green-500">
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Verified
                          </span> : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-500">
                            <AlertTriangleIcon className="h-4 w-4 mr-1" />
                            Needs Review
                          </span>}
                      </div>
                    </div>)}
                  {investor.status === 'pending' && <div className="mt-6 bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                      <h5 className="font-medium text-white mb-2">
                        Document Verification Required
                      </h5>
                      <p className="text-slate-400 text-sm mb-4">
                        Please review all uploaded documents before approving
                        this investor. Ensure all information matches and
                        documents are valid.
                      </p>
                    </div>}
                </div> : <div className="text-center py-8 bg-slate-700/50 rounded-lg">
                  <FileIcon className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">No documents uploaded</p>
                </div>}
            </div>}
          {activeTab === 'investments' && <div>
              {investor.investmentCount > 0 ? <div>
                  <h4 className="text-md font-medium text-white mb-4">
                    Investment History
                  </h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-400 border-b border-slate-700">
                        <th className="pb-2 font-medium">Project</th>
                        <th className="pb-2 font-medium">Amount</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {investor.investments && investor.investments.length > 0 ? (
                        investor.investments.map(investment => (
                          <tr key={investment.id} className="border-b border-slate-700">
                            <td className="py-3 text-white">
                              {investment.name}
                            </td>
                            <td className="py-3 text-white">
                              ${investment.amount.toLocaleString()}
                            </td>
                            <td className="py-3 text-slate-300">
                              {formatDate(investment.date)}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                investment.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                                investment.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                                'bg-red-500/20 text-red-500'
                              }`}>
                                {investment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            No investment history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div> : <div className="text-center py-8 bg-slate-700/50 rounded-lg">
                  <AlertTriangleIcon className="h-12 w-12 mx-auto text-slate-500 mb-2" />
                  <p className="text-slate-400">
                    No investments found for this investor
                  </p>
                  {investor.status === 'pending' && <p className="text-sm text-slate-400 mt-2">
                      This investor is waiting for approval before making
                      investments.
                    </p>}
                </div>}
            </div>}
        </div>
        {investor.status === 'pending' && <div className="p-6 border-t border-slate-700 bg-slate-800/50">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <Button variant="danger" onClick={handleReject} disabled={isProcessing} className="flex items-center justify-center">
                <XCircleIcon className="h-5 w-5 mr-2" />
                Reject Investor
              </Button>
              <Button variant="success" onClick={handleApprove} isLoading={isProcessing} disabled={isProcessing} className="flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Approve Investor
              </Button>
            </div>
          </div>}
      </div>
    </div>;
};
export default InvestorDetailModal;