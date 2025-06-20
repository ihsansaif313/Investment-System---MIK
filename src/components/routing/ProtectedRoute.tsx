import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'superadmin' | 'admin' | 'investor' | 'salesman';
}
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  role
}) => {
  const {
    isAuthenticated,
    user,
    isLoading
  } = useAuth();
  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // If a specific role is required and user doesn't have it
  if (role && user?.role.type !== role) {
    // Redirect to appropriate dashboard based on user's role
    if (user?.role.type === 'superadmin') {
      return <Navigate to="/superadmin/dashboard" replace />;
    } else if (user?.role.type === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role.type === 'investor') {
      return <Navigate to="/investor/dashboard" replace />;
    } else if (user?.role.type === 'salesman') {
      return <Navigate to="/salesman/dashboard" replace />;
    }
  }
  return <>{children}</>;
};
export default ProtectedRoute;