import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useErrorToast } from '../../components/ui/Toast';
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showEmailVerificationError, setShowEmailVerificationError] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { login, isLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const errorToast = useErrorToast();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Defensive: prevent double submit
    const nativeEvent = e.nativeEvent as SubmitEvent;
    if (nativeEvent.submitter && nativeEvent.submitter instanceof HTMLButtonElement) {
      nativeEvent.submitter.disabled = true;
    }
    // Simple validation
    const newErrors: {
      email?: string;
      password?: string;
    } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      const err = error as { code?: string; message?: string };
      console.error('Login error:', err);

      // Show a toast if verification email was resent
      if (err.message && err.message.includes('A new verification email has been sent')) {
        errorToast(
          'Verification Email Resent',
          'A new verification email has been sent to your email address. Please check your inbox.'
        );
        setShowEmailVerificationError(true);
        setErrors({
          email: 'Please verify your email address before logging in.'
        });
        return;
      }

      // Check if it's an email verification error
      if (err.code === 'EMAIL_NOT_VERIFIED' || (err.message && err.message.includes('verify your email'))) {
        setShowEmailVerificationError(true);
        setErrors({
          email: 'Please verify your email address before logging in.'
        });
        errorToast(
          'Email Verification Required',
          'Please check your email and click the verification link before logging in.'
        );
      } else {
        setShowEmailVerificationError(false);
        setErrors({
          password: err.message || 'Invalid email or password'
        });
      }
    }
   };


  return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      {/* Animated particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => <div key={i} className="absolute bg-yellow-500/20 rounded-full" style={{
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `float ${Math.random() * 10 + 10}s linear infinite`,
        opacity: Math.random() * 0.5 + 0.2
      }} />)}
      </div>
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Investment Management
            </h1>
            <p className="text-slate-400 mt-1 text-sm sm:text-base">Sign in to your account</p>
          </div>
        </div>



        {/* Login form */}
        <Card glassmorphism className="backdrop-blur-lg p-4 sm:p-6 lg:p-8">
          {/* Email Verification Notice */}
          {showEmailVerificationError && (
            <div className="mb-4 sm:mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-yellow-400 font-medium mb-1 text-sm sm:text-base">Email Verification Required</h4>
                  <p className="text-xs sm:text-sm text-slate-300 mb-2 sm:mb-3">
                    Your account needs to be verified before you can log in. Please check your email for a verification link.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/verify-email')}
                    className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                  >
                    <Mail size={14} className="sm:w-4 sm:h-4" />
                    Resend Verification Email
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 sm:space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
                leftIcon={<UserIcon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                fullWidth
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<LockIcon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                fullWidth
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-500 border-slate-600 rounded bg-slate-700 focus:ring-2 focus:ring-offset-0"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/reset-password"
                  className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                className="mt-6"
              >
                Sign In
              </Button>
            </div>
          </form>
        </Card>

        {/* Registration Link */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-slate-400 text-sm sm:text-base">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>


      </div>
    </div>;
};
export default Login;