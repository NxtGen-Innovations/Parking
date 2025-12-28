import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ChooseRole from "./pages/ChooseRole";
import RegisterSpace from "./pages/RegisterSpace";
import Browse from "./pages/Browse";
import Booking from "./pages/Booking";
import ProviderDashboard from "./pages/ProviderDashboard";
import MyBookings from "./pages/MyBookings";
import Navigation from "./pages/Navigation";
import SpaceDashboard from "./pages/SpaceDashboard";
import ScanQR from "./pages/ScanQR"; // NEW IMPORT
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected Routes */}
      <Route
        path="/choose-role"
        element={
          <ProtectedRoute>
            <ChooseRole />
          </ProtectedRoute>
        }
      />
      
      {/* Provider Routes */}
      <Route
        path="/register-space"
        element={
          <ProtectedRoute>
            <RegisterSpace />
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
      <Route
        path="/space-dashboard/:id"
        element={
          <ProtectedRoute>
            <SpaceDashboard />
          </ProtectedRoute>
        }
      />

      {/* Driver Routes */}
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
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navigation/:bookingId"
        element={
          <ProtectedRoute>
            <Navigation />
          </ProtectedRoute>
        }
      />
      
      {/* QR Scanner Route */}
      <Route
        path="/scan-qr"
        element={
          <ProtectedRoute>
            <ScanQR />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;