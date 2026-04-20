import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/auth/login";
import Signup from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import InstallerDashboard from "./pages/installer/InstallerDashboard";
import InstallerBookings from "./pages/installer/InstallerBookings";
import ProfileManagement from "./pages/installer/ProfileManagement";
import InstallerPortfolio from "./pages/installer/InstallerPortfolio";
import InstallerSettings from "./pages/installer/InstallerSettings";
import InstallerListingPublic from "./pages/public/InstallerListingPublic";
import InstallerProfilePublic from "./pages/public/InstallerProfilePublic";
import ClientDashboard from "./pages/client/ClientDashboard";
import InstallerSearch from "./pages/client/InstallerSearch";
import ClientBookings from "./pages/client/ClientBookings"; 
import ClientHistory from "./pages/client/ClientHistory";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import { AppDataProvider } from "./contexts/AppDataProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <AppDataProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/auth/verify-otp" element={<VerifyOtp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/installers" element={<InstallerListingPublic />} />
            <Route path="/installers/:id" element={<InstallerProfilePublic />} />

            <Route
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

                      <Route 
              path="/installer/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['installer']}>
                  <InstallerDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/installer/profile" 
              element={
                <ProtectedRoute allowedRoles={['installer']}>
                  <ProfileManagement />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/installer/bookings" 
              element={
                <ProtectedRoute allowedRoles={['installer']}>
                  <InstallerBookings />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/installer/portfolio" 
              element={
                <ProtectedRoute allowedRoles={['installer']}>
                  <InstallerPortfolio />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/installer/settings" 
              element={
                <ProtectedRoute allowedRoles={['installer']}>
                  <InstallerSettings />
                </ProtectedRoute>
              } 
            />

            <Route
              path="/client/dashboard"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/client/search" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <InstallerSearch />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/client/bookings" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientBookings />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/client/history" 
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            
            
          </Routes>
        </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
