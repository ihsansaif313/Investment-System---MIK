import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, KeyIcon, CheckCircleIcon } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Validate email
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1500);
  };
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Validate code
    if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Please enter a valid 6-digit code');
      setIsLoading(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1500);
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    // Validate passwords
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }, 1500);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">
            Follow the steps to reset your password
          </p>
        </div>
        {/* Progress steps */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex items-center">
            <div className={`rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 1 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
              1
            </div>
            <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${step >= 1 ? 'text-white' : 'text-slate-400'}`}>
              Email
            </span>
          </div>
          <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${step >= 2 ? 'bg-yellow-500' : 'bg-slate-700'}`}></div>
          <div className="flex items-center">
            <div className={`rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 2 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
              2
            </div>
            <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${step >= 2 ? 'text-white' : 'text-slate-400'}`}>
              Verify
            </span>
          </div>
          <div className={`flex-1 h-0.5 sm:h-1 mx-1 sm:mx-2 ${step >= 3 ? 'bg-yellow-500' : 'bg-slate-700'}`}></div>
          <div className="flex items-center">
            <div className={`rounded-full h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center text-xs sm:text-sm font-medium ${step >= 3 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400'}`}>
              3
            </div>
            <span className={`ml-1 sm:ml-2 text-xs sm:text-sm ${step >= 3 ? 'text-white' : 'text-slate-400'}`}>
              Reset
            </span>
          </div>
        </div>
        <Card glassmorphism className="p-4 sm:p-6 lg:p-8">
          {step === 1 && <form onSubmit={handleSendCode}>
              <div className="space-y-4 sm:space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  leftIcon={<MailIcon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  error={error}
                  fullWidth
                />
                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                  Send Reset Code
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </form>}
          {step === 2 && <form onSubmit={handleVerifyCode}>
              <div className="space-y-4 sm:space-y-5">
                <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">
                  We've sent a 6-digit code to{' '}
                  <span className="text-white font-medium break-all">{email}</span>.
                  Please enter the code below.
                </p>
                <Input
                  label="Verification Code"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  leftIcon={<KeyIcon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  error={error}
                  fullWidth
                  maxLength={6}
                />
                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                  Verify Code
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                    onClick={() => setStep(1)}
                  >
                    Back to Email
                  </button>
                </div>
              </div>
            </form>}
          {step === 3 && <form onSubmit={handleResetPassword}>
              <div className="space-y-4 sm:space-y-5">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  error={error}
                  fullWidth
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                  Reset Password
                </Button>
              </div>
            </form>}
          {step === 4 && <div className="text-center py-4 sm:py-6">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-500/20 mb-3 sm:mb-4">
                <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
                Password Reset Successful
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Your password has been reset successfully. You'll be redirected
                to the login page shortly.
              </p>
            </div>}
        </Card>
      </div>
    </div>;
};
export default ResetPassword;