import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Play, Download } from 'lucide-react';
import Button from '../ui/Button';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { runDataFlowTestSuite, generateTestReport, DataFlowTestSuite } from '../../utils/dataFlowTesting';

interface DataFlowValidatorProps {
  className?: string;
}

const DataFlowValidator: React.FC<DataFlowValidatorProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { 
    state, 
    calculateMetrics, 
    validateDataConsistency,
    synchronizeData 
  } = useData();
  
  const [testResults, setTestResults] = useState<DataFlowTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    
    try {
      // Prepare test data
      const testData = {
        investments: state.investments,
        investorInvestments: state.investorInvestments,
        users: state.users,
        calculateMetrics,
        adminData: user?.role?.id === 'admin' ? {
          subCompanyId: user.subCompanyAdmin?.sub_company_id,
          investments: state.investments.filter(inv => 
            inv.sub_company_id === user.subCompanyAdmin?.sub_company_id
          )
        } : undefined,
        superadminData: user?.role?.id === 'superadmin' ? {
          investments: state.investments,
          users: state.users,
          subCompanies: state.subCompanies
        } : undefined,
        investorData: user?.role?.id === 'investor' ? {
          userId: user.id,
          investments: state.investorInvestments.filter(ii => ii.user_id === user.id)
        } : undefined
      };

      // Run the test suite
      const results = runDataFlowTestSuite(testData);
      setTestResults(results);
      setLastRunTime(new Date());
    } catch (error) {
      console.error('Failed to run data flow tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!testResults) return;

    const report = generateTestReport(testResults);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-flow-test-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const renderTestSection = (title: string, tests: any[]) => (
    <div className="bg-slate-700 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-white mb-3">{title}</h4>
      <div className="space-y-2">
        {tests.map((test, index) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-slate-600 rounded">
            {test.passed ? (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-white">{test.testName}</div>
              <div className={`text-xs ${test.passed ? 'text-green-300' : 'text-red-300'}`}>
                {test.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Auto-run tests on component mount if user is superadmin
  useEffect(() => {
    if (user?.role?.id === 'superadmin' && !testResults) {
      runTests();
    }
  }, [user]);

  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Data Flow Validator</h3>
          <p className="text-slate-400 text-sm">
            Validates zero dummy data policy and calculation accuracy
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastRunTime && (
            <span className="text-xs text-slate-400">
              Last run: {lastRunTime.toLocaleTimeString()}
            </span>
          )}
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Play size={16} />}
            onClick={runTests}
            isLoading={isRunning}
            disabled={isRunning}
          >
            Run Tests
          </Button>
          
          {testResults && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Download size={16} />}
              onClick={downloadReport}
            >
              Download Report
            </Button>
          )}
        </div>
      </div>

      {testResults && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className={`rounded-lg p-4 ${getScoreBgColor(testResults.overallScore)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-white">Overall Score</h4>
                <p className="text-slate-300 text-sm">
                  Data flow validation results
                </p>
              </div>
              <div className={`text-3xl font-bold ${getScoreColor(testResults.overallScore)}`}>
                {testResults.overallScore.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Test Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {renderTestSection('Fresh Installation', testResults.freshInstallationTests)}
            {renderTestSection('Calculation Accuracy', testResults.calculationAccuracyTests)}
            {renderTestSection('Cross-Platform Sync', testResults.crossPlatformSyncTests)}
            {renderTestSection('Real-Time Updates', testResults.realTimeUpdateTests)}
          </div>

          {/* Data Consistency Check */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">Data Consistency</h4>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const consistency = validateDataConsistency();
                console.log('Data consistency check:', consistency);
                if (!consistency.isConsistent) {
                  alert(`Data inconsistencies found:\n${consistency.errors.join('\n')}`);
                } else {
                  alert('Data is consistent across all platforms!');
                }
              }}
            >
              Check Data Consistency
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="ml-2"
              onClick={() => {
                synchronizeData();
                alert('Data synchronized across platforms!');
              }}
            >
              Synchronize Data
            </Button>
          </div>

          {/* System Information */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3">System Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Investments</div>
                <div className="text-white font-medium">{state.investments.length}</div>
              </div>
              <div>
                <div className="text-slate-400">Users</div>
                <div className="text-white font-medium">{state.users.length}</div>
              </div>
              <div>
                <div className="text-slate-400">Sub-Companies</div>
                <div className="text-white font-medium">{state.subCompanies.length}</div>
              </div>
              <div>
                <div className="text-slate-400">User Role</div>
                <div className="text-white font-medium">{user?.role?.name || 'Unknown'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!testResults && !isRunning && (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Click "Run Tests" to validate data flow</p>
        </div>
      )}
    </div>
  );
};

export default DataFlowValidator;
