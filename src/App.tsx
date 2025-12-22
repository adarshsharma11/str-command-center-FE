import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
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
