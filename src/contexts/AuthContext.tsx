import React, { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { UserWithRole, UserRole, UserStatus, LoginResponse } from '../types/database';

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
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
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
      let loginResponse: LoginResponse | undefined;
      try {
        loginResponse = await apiService.login(email, password);
      } catch (error: any) {
        // Show backend error message if available
        const errorMessage = error.response?.data?.message || error.message || 'Login failed';
        throw new Error(errorMessage);
      }
      if (!loginResponse) {
        throw new Error('Login failed: No response from server.');
      }
      setUser(loginResponse.user);
      setToken(loginResponse.token);
      setRefreshToken(loginResponse.refreshToken);

      // Store in localStorage
      localStorage.setItem('authToken', loginResponse.token);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(loginResponse.user));

      // Redirect based on role and status
      const role = loginResponse.user.role.type;
      const userStatus = loginResponse.user.role.type === 'investor' ?
        loginResponse.user.subCompanyAdmin?.status : 'active';

      if (role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'investor') {
        if (userStatus === 'pending') {
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
      // Call logout API to invalidate token on server
      await apiService.logout();
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
      const refreshResponse = await apiService.refreshToken();

      setUser(refreshResponse.user);
      setToken(refreshResponse.token);
      setRefreshToken(refreshResponse.refreshToken);

      localStorage.setItem('authToken', refreshResponse.token);
      localStorage.setItem('refreshToken', refreshResponse.refreshToken);
      localStorage.setItem('authUser', JSON.stringify(refreshResponse.user));
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
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
