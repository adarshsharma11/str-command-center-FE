import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PublicRoute() {
  const { token } = useAuth();

  // If logged in, redirect to dashboard
  if (token) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
