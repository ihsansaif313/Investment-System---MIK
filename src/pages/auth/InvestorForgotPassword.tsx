import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle, 
  Shield,
  AlertCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import apiService from '../../services/api';

const InvestorForgotPassword: React.FC = () => {
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    
    try {
      await apiService.forgotInvestorPassword(email);
      
      setIsSubmitted(true);
      successToast(
        'Reset Link Sent!',
        'If an account exists with this email, you will receive password reset instructions.'
      );
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      // Don't reveal specific error details for security
      setIsSubmitted(true);
      successToast(
        'Reset Link Sent!',
        'If an account exists with this email, you will receive password reset instructions.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Check Your Email</h1>
              <p className="text-slate-400 text-sm sm:text-base mb-6">
                If an account exists with <strong className="text-white">{email}</strong>, 
                you will receive password reset instructions shortly.
              </p>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-blue-400 font-medium mb-1">Next Steps</h4>
                    <ul className="text-xs text-slate-300 space-y-1">
                      <li>• Check your email inbox and spam folder</li>
                      <li>• Click the reset link in the email</li>
                      <li>• Create a new secure password</li>
                      <li>• Log in with your new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  variant="secondary"
                  fullWidth
                >
                  Send Another Reset Link
                </Button>

                <Link to="/login">
                  <Button variant="primary" fullWidth leftIcon={<ArrowLeft size={16} />}>
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                leftIcon={<Mail size={16} />}
                error={error}
                disabled={isLoading}
                fullWidth
                autoFocus
              />
            </div>

            {/* Security Notice */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-amber-400 font-medium mb-1">Security Notice</h4>
                  <p className="text-xs text-slate-300">
                    For security reasons, we'll send reset instructions to your email 
                    regardless of whether an account exists with this address.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<Mail size={18} />}
            >
              {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <p className="text-slate-400 text-xs">
              Need help? Contact your company administrator for assistance.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvestorForgotPassword;
