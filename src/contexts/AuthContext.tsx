import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { UserWithRole, UserRole, UserStatus, LoginResponse } from '../types/database';
import { isDemoAccount, authenticateDemo, validateDemoToken, DemoUser } from '../services/demoAuth';

interface AuthContextType {
  user: UserWithRole | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isRole: (role: UserRole) => boolean;
  setUser: (user: UserWithRole | null) => void;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  login: async () => Promise.resolve(),
  logout: () => {},
  isLoading: false,
  updateUserStatus: async () => Promise.resolve(),
  refreshAuthToken: async () => Promise.resolve(),
  hasPermission: () => false,
  isRole: () => false,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('[AuthContext] Initializing with stored user:', parsedUser);

            // Check if this is a demo user
            if (parsedUser?.isDemo) {
              console.log('[AuthContext] Demo user detected, validating demo token');
              const demoUser = validateDemoToken(storedToken);
              if (demoUser) {
                setToken(storedToken);
                setRefreshToken(storedRefreshToken);
                setUser(demoUser as any);
                console.log('[AuthContext] Successfully initialized with demo session');
              } else {
                console.warn('[AuthContext] Invalid demo token, clearing session');
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
              }
            } else {
              // Regular user validation
              if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
                setToken(storedToken);
                setRefreshToken(storedRefreshToken);
                setUser(parsedUser);
                console.log('[AuthContext] Successfully initialized with stored session');
              } else {
                console.warn('[AuthContext] Stored user data is invalid, clearing session');
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
              }
            }
          } catch (parseError) {
            console.error('[AuthContext] Failed to parse stored user data:', parseError);
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('authUser');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Check if this is a demo account first
      if (isDemoAccount(email, password)) {
        console.log('[AuthContext] Demo account detected, bypassing API authentication');
        const demoAuthResult = await authenticateDemo(email, password);

        if (demoAuthResult.success && demoAuthResult.user && demoAuthResult.token) {
          const userData = demoAuthResult.user;
          const authToken = demoAuthResult.token;

          setUser(userData as any);
          setToken(authToken);
          setRefreshToken(authToken); // Use same token for demo

          // Store in localStorage
          localStorage.setItem('authToken', authToken);
          localStorage.setItem('refreshToken', authToken);
          localStorage.setItem('authUser', JSON.stringify(userData));

          console.log('[AuthContext] Demo login successful, redirecting to dashboard');

          // Redirect based on demo user role
          const role = userData.role.type;
          if (role === 'superadmin') {
            navigate('/superadmin/dashboard');
          } else if (role === 'admin') {
            navigate('/admin/dashboard');
          } else if (role === 'investor') {
            navigate('/investor/dashboard');
          }

          return; // Exit early for demo accounts
        } else {
          throw new Error(demoAuthResult.message || 'Demo authentication failed');
        }
      }

      // Regular API authentication for non-demo accounts
      let loginResponse: any;
      try {
        // Call the API service login method directly to get the raw response
        const response = await apiService.api.post('/auth/login', { email, password });
        loginResponse = response.data;
        console.log('[AuthContext] Login response received:', JSON.stringify(loginResponse, null, 2));
      } catch (error: any) {
        // Show backend error message if available
        const errorMessage = error?.response?.data?.message || error?.message || 'Login failed';
        console.error('[AuthContext] Login API error:', error);
        throw new Error(errorMessage);
      }

      if (!loginResponse || !loginResponse.success) {
        console.error('[AuthContext] Invalid login response:', loginResponse);
        throw new Error('Login failed: No response from server.');
      }

      // BYPASS: Skip password setup redirect - investors can login directly
      if (loginResponse.requiresPasswordSetup) {
        console.log('[AuthContext] First-time login detected, but BYPASSING password setup - proceeding with normal login');
        // Continue with normal login flow instead of redirecting to password setup
      }

      // Regular login - process normally
      const userData = loginResponse.data?.user;
      const authToken = loginResponse.data?.token;
      const refreshToken = loginResponse.data?.refreshToken;

      console.log('[AuthContext] Regular login data:', {
        userData: !!userData,
        authToken: !!authToken,
        refreshToken: !!refreshToken
      });
      console.log('[AuthContext] User data details:', userData);

      if (!userData || !authToken) {
        console.error('[AuthContext] Missing regular login data:', { userData, authToken });
        throw new Error('Invalid login response structure');
      }

      setUser(userData);
      setToken(authToken);
      setRefreshToken(refreshToken);

      // Store in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      // Redirect based on role and status
      const role = userData.role?.type;
      const roleStatus = userData.role?.status;

      if (!role) {
        throw new Error('User role not found in login response');
      }

      console.log('[AuthContext] Login successful, determining redirect...');
      console.log('[AuthContext] User role:', role, 'Status:', roleStatus);
      console.log('[AuthContext] Company assignments:', userData.companyAssignments?.length || 0);

      if (role === 'superadmin') {
        console.log('[AuthContext] Redirecting superadmin to dashboard');
        navigate('/superadmin/dashboard');
      } else if (role === 'admin') {
        // Check if admin has company assignments
        const hasAssignments = userData.companyAssignments &&
                              userData.companyAssignments.length > 0;

        if (roleStatus === 'pending') {
          console.log('[AuthContext] Admin pending approval, showing pending screen');
          navigate('/admin/dashboard'); // Will show pending screen via AdminDashboardLayout
        } else if (roleStatus === 'active' && hasAssignments) {
          console.log('[AuthContext] Admin active with assignments, redirecting to dashboard');
          navigate('/admin/dashboard');
        } else {
          console.log('[AuthContext] Admin active but no assignments, showing pending screen');
          navigate('/admin/dashboard'); // Will show pending screen via AdminDashboardLayout
        }
      } else if (role === 'investor') {
        const investorStatus = userData.subCompanyAdmin?.status;
        if (investorStatus === 'pending') {
          navigate('/investor/pending');
        } else {
          navigate('/investor/dashboard');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      // Check if current user is a demo user
      const isDemoUser = user && (user as any).isDemo;

      if (!isDemoUser) {
        // Call logout API to invalidate token on server for regular users
        await apiService.logout();
      } else {
        console.log('[AuthContext] Demo user logout, skipping API call');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      navigate('/login');
    }
  };

  const refreshAuthToken = async () => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const refreshResponse = await apiService.refreshToken();

      setUser(refreshResponse.user);
      setToken(refreshResponse.token);
      setRefreshToken(refreshResponse.refreshToken);

      localStorage.setItem('authToken', refreshResponse.token);
      localStorage.setItem('refreshToken', refreshResponse.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(refreshResponse.user));

      return refreshResponse;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Don't automatically logout here, let the API interceptor handle it
      throw error;
    }
  };

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      setIsLoading(true);
      await apiService.updateUserStatus(userId, status);

      // If updating the current user's status
      if (user && user.id === userId) {
        const updatedUser = {
          ...user,
          subCompanyAdmin: user.subCompanyAdmin ? {
            ...user.subCompanyAdmin,
            status: status as any
          } : undefined
        };
        setUser(updatedUser);
        localStorage.setItem('authUser', JSON.stringify(updatedUser));

        // Redirect if necessary
        if (user.role.type === 'investor') {
          if (status === 'active') {
            navigate('/investor/dashboard');
          } else if (status === 'rejected') {
            logout();
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setIsLoading(false);
    }
  };

  // Permission and role checking utilities
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Check if this is a demo user
    const isDemoUser = (user as any).isDemo;
    if (isDemoUser) {
      // Demo users have permissions based on their role
      const demoPermissions = (user as any).role?.permissions || [];
      return demoPermissions.includes(permission);
    }

    // Superadmin has all permissions
    if (user.role.type === 'superadmin') return true;

    // Check specific permissions based on role
    const permissions = user.subCompanyAdmin?.permissions || [];
    return permissions.includes(permission);
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role.type === role;
  };
  return (
    <AuthContext.Provider value={{
      user,
      token,
      refreshToken,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      isLoading,
      updateUserStatus,
      refreshAuthToken,
      hasPermission,
      isRole,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
