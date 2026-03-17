import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { env } from "./config/env";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Inbox from "./pages/Inbox";
import Crews from "./pages/Crews";
import Automation from "./pages/Automation";
import Properties from "./pages/Properties";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Testing from "./pages/Testing"; // New testing page for developers
import ServiceBookingRespond from "./pages/ServiceBookingRespond";
import NotFound from "./pages/NotFound";
import { AuthProvider, AuthWatcher } from "@/context/AuthContext";
import PrivateRoute from "@/components/PrivateRoute";
import PublicRoute from "@/components/PublicRoute";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <AuthWatcher />
          <Routes>
            {/* Root redirects to dashboard in dev mode, otherwise to auth */}
            <Route path="/" element={<Navigate to={env.devMode ? "/dashboard" : "/auth"} replace />} />
            
            {/* Public routes - only accessible when NOT logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>

            {/* Public landing pages (always accessible) */}
            <Route path="/service-bookings/respond" element={<ServiceBookingRespond />} />
            
            {/* Private routes - only accessible when logged in */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/crews" element={<Crews />} />
              <Route path="/automation" element={<Automation />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/pricing" element={<Pricing />} />
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
