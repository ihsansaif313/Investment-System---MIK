import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Shield,
  AlertCircle,
  Key
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useSuccessToast, useErrorToast } from '../../components/ui/Toast';
import apiService from '../../services/api';

const InvestorResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const successToast = useSuccessToast();
  const errorToast = useErrorToast();
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [token, setToken] = useState<string | null>(null);

  // Get token from URL parameters
  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      errorToast('Invalid Reset Link', 'The password reset link is invalid or has expired.');
      navigate('/login');
      return;
    }
    setToken(resetToken);
  }, [searchParams, navigate, errorToast]);

  // Password strength checker
  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check password strength for new password
    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !token) return;
    
    setIsLoading(true);
    
    try {
      await apiService.resetInvestorPassword(token, formData.newPassword);
      
      successToast(
        'Password Reset Successful!',
        'Your password has been reset successfully. You can now log in with your new password.'
      );
      
      // Redirect to login
      navigate('/login', { 
        state: { 
          message: 'Password reset complete. Please log in with your new password.'
        } 
      });
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      errorToast(
        'Password Reset Failed',
        error.response?.data?.message || 'An error occurred while resetting your password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Fair';
    if (passwordStrength <= 4) return 'Good';
    return 'Strong';
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="p-6 sm:p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Invalid Reset Link</h1>
              <p className="text-slate-400 mb-6">
                The password reset link is invalid or has expired.
              </p>
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                fullWidth
              >
                Back to Login
              </Button>
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
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Create a new secure password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                New Password
              </label>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.newPassword}
                disabled={isLoading}
                fullWidth
                autoFocus
              />

              {formData.newPassword && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${
                      passwordStrength <= 2 ? 'text-red-400' :
                      passwordStrength <= 3 ? 'text-yellow-400' :
                      passwordStrength <= 4 ? 'text-blue-400' : 'text-green-400'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Password must contain uppercase, lowercase, number, and special character
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Confirm New Password
              </label>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your new password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.confirmPassword}
                disabled={isLoading}
                fullWidth
              />
            </div>

            {/* Security Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-blue-400 font-medium mb-1">Security Requirements</h4>
                  <ul className="text-xs text-slate-300 space-y-1">
                    <li>• Minimum 8 characters long</li>
                    <li>• At least one uppercase letter</li>
                    <li>• At least one lowercase letter</li>
                    <li>• At least one number</li>
                    <li>• At least one special character (@$!%*?&)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              leftIcon={<CheckCircle size={18} />}
              className="mt-6"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          {/* Help Link */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Need help?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
              >
                Back to Login
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvestorResetPassword;
