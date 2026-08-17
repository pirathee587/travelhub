import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  const hasToken = isAuthenticated || !!localStorage.getItem('travelhub_token') || !!localStorage.getItem('token');

  // If not logged in, redirect to login page
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // If role-restricted and user does not have the allowed role, redirect to home page
  if (allowedRoles && allowedRoles.length > 0) {
    const rawRole = (user?.role || '').toString().trim().toUpperCase();
    const normalizedUserRole = rawRole.replace(/^ROLE_/, '');
    const hasAllowedRole = allowedRoles.some(r => {
      const normalizedAllowed = r.toString().trim().toUpperCase().replace(/^ROLE_/, '');
      return normalizedAllowed === normalizedUserRole || rawRole === r.toUpperCase();
    });

    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
