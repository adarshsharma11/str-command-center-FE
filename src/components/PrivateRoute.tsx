import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/lib/auth/token';

export default function PrivateRoute() {
  const { token, isDevMode } = useAuth();

  // In dev mode or demo mode, bypass authentication — Added by Agent 3
  if (isDevMode) {
    return <Outlet />;
  }

  const stored = getToken();
  if (!token || !stored) return <Navigate to="/auth" replace />;
  return <Outlet />;
}
