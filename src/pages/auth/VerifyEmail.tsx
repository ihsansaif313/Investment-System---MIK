import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  RefreshCw,
  ArrowRight,
  Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import apiService from '../../services/api';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setVerificationStatus('error');
      setMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      setVerificationStatus('loading');

      console.log('🔍 Starting email verification for token:', verificationToken);

      const response = await apiService.verifyEmail(verificationToken);

      console.log('✅ Verification successful!', response);

      setVerificationStatus('success');
      setMessage('Your email has been verified successfully! You can now log in to your account.');

      successToast('Email Verified!', 'Your account is now active');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Email verified successfully! You can now log in.'
          }
        });
      }, 3000);

    } catch (error: any) {
      console.error('❌ Email verification error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      // Check if it's a mock API error (no response object)
      if (!error.response && error.message) {
        if (error.message.includes('Invalid or expired')) {
          setVerificationStatus('expired');
          setMessage('This verification link has expired or is invalid. Please request a new verification email.');
          setShowResendForm(true);
        } else if (error.message.includes('already verified')) {
          setVerificationStatus('success');
          setMessage('Your email has already been verified! You can now log in to your account.');
        } else {
          setVerificationStatus('error');
          setMessage(error.message || 'Failed to verify email. Please try again.');
        }
      } else if (error.response?.status === 400) {
        setVerificationStatus('expired');
        setMessage('This verification link has expired or is invalid. Please request a new verification email.');
        setShowResendForm(true);
      } else {
        setVerificationStatus('error');
        setMessage(error.response?.data?.message || error.message || 'Failed to verify email. Please try again.');
      }
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      errorToast('Email Required', 'Please enter your email address');
      return;
    }
    
    setIsResending(true);
    
    try {
      await apiService.resendVerification(email);
      
      successToast(
        'Verification Email Sent!', 
        'Please check your email for the new verification link'
      );
      
      setShowResendForm(false);
      setMessage('A new verification email has been sent. Please check your inbox.');
      
    } catch (error: any) {
      console.error('Resend verification error:', error);
      errorToast(
        'Failed to Send Email',
        error.response?.data?.message || 'Please try again later'
      );
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <LoadingSpinner size="lg" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h1>
            <p className="text-slate-400 mb-6">
              Please wait while we verify your email address...
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Email Verified Successfully!</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Account Activated</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                You will be redirected to the login page in a few seconds...
              </p>
            </div>
            
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              leftIcon={<ArrowRight size={16} />}
            >
              Continue to Login
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Verification Link Expired</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            
            {showResendForm ? (
              <div className="bg-slate-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Request New Verification Email</h3>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      disabled={isResending}
                      required
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isResending}
                    leftIcon={<Mail size={16} />}
                  >
                    {isResending ? 'Sending...' : 'Send New Verification Email'}
                  </Button>
                </form>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowResendForm(true)}
                leftIcon={<RefreshCw size={16} />}
              >
                Request New Verification Email
              </Button>
            )}
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
            <p className="text-slate-400 mb-6">{message}</p>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Verification Error</span>
              </div>
              <p className="text-sm text-slate-300 mt-2">
                The verification link may be invalid, expired, or already used.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={() => setShowResendForm(true)}
                leftIcon={<RefreshCw size={16} />}
              >
                Request New Link
              </Button>
              
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                leftIcon={<ArrowRight size={16} />}
              >
                Go to Login
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          {renderContent()}
          
          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="text-center">
              <p className="text-sm text-slate-400 mb-2">
                Need help with verification?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                <Link 
                  to="/contact" 
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  Contact Support
                </Link>
                <span className="hidden sm:inline text-slate-600">•</span>
                <Link 
                  to="/login" 
                  className="text-yellow-500 hover:text-yellow-400"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
