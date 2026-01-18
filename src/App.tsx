import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Inbox from "./pages/Inbox";
import Crews from "./pages/Crews";
import Automation from "./pages/Automation";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Settings from "./pages/Settings";
import Testing from "./pages/Testing"; // New testing page for developers
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";
import { useAuth } from "@/context/AuthContext";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      const msg = (error as Error)?.message || '';
      if (msg.includes('HTTP 401') || msg.includes('HTTP 403')) {
        try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch { void 0; }
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const msg = (error as Error)?.message || '';
      if (msg.includes('HTTP 401') || msg.includes('HTTP 403')) {
        try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch { void 0; }
      }
    },
  }),
});

function AuthWatcher() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!token && location.pathname !== "/auth") {
      navigate("/auth", { replace: true });
    }
  }, [token, location.pathname, navigate]);
  useEffect(() => {
    const handler = () => navigate("/auth", { replace: true });
    window.addEventListener("auth:unauthorized", handler);
    return () => window.removeEventListener("auth:unauthorized", handler);
  }, [navigate]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AuthWatcher />
          <Routes>
            {/* Root redirects to auth (or dashboard if logged in via PublicRoute) */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            
            {/* Public routes - only accessible when NOT logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>
            
            {/* Private routes - only accessible when logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/crews" element={<Crews />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/testing" element={<Testing />} /> {/* Developer testing page */}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
