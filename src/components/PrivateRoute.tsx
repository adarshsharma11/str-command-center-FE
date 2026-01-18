import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth/token';

export default function PrivateRoute() {
  const { token } = useAuth();
  const stored = getToken();
  if (!token || !stored) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
