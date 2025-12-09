import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ChooseRole from "./pages/ChooseRole";
import RegisterType from "./pages/RegisterType";
import RegisterSpace from "./pages/RegisterSpace";
import Browse from "./pages/Browse";
import Booking from "./pages/Booking";
import ProviderDashboard from "./pages/ProviderDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/**
 * ForceHomeOnRefresh
 * - When developing locally (Vite/dev), forces the URL to "/" on first load/reload.
 * - This prevents the dev server from opening the app on the last closed route.
 */
function ForceHomeOnRefresh() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only run in development
    if (import.meta.env.DEV) {
      // Only redirect when current path is not "/"
      if (location.pathname !== "/") {
        // Use replace so it's not added to history stack
        navigate("/", { replace: true });
      }
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Destructure user and isLoading correctly from useAuth
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/choose-role"
        element={
          <ProtectedRoute>
            <ChooseRole />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-type"
        element={
          <ProtectedRoute>
            <RegisterType />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register-space"
        element={
          <ProtectedRoute>
            <RegisterSpace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/browse"
        element={
          <ProtectedRoute>
            <Browse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider-dashboard"
        element={
          <ProtectedRoute>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* Force home on dev reloads — harmless in production */}
        <ForceHomeOnRefresh />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
