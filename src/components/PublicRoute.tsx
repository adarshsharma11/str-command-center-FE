import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getToken } from "@/lib/auth/token";

export default function PublicRoute() {
  const { token } = useAuth();
  const stored = getToken();

  // If logged in, redirect to dashboard
  if (token && stored) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
