import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import GalleriesList from "./pages/admin/GalleriesList";
import GalleryCreate from "./pages/admin/GalleryCreate";
import GalleryDetail from "./pages/admin/GalleryDetail";
import GalleryReview from "./pages/admin/GalleryReview";
import CompaniesList from "./pages/admin/CompaniesList";
import CompanyDetail from "./pages/admin/CompanyDetail";
import UsersList from "./pages/admin/UsersList";
import WebhookLogs from "./pages/admin/WebhookLogs";
import Analytics from "./pages/admin/Analytics";
import AdminSettings from "./pages/admin/AdminSettings";
import StagingRequests from "./pages/admin/StagingRequests";
import ClientGallery from "./pages/client/ClientGallery";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/gallery/:slug" element={<ClientGallery />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="galleries" element={<GalleriesList />} />
              <Route path="galleries/new" element={<GalleryCreate />} />
              <Route path="galleries/:id" element={<GalleryDetail />} />
              <Route path="galleries/:id/review" element={<GalleryReview />} />
              <Route path="companies" element={<CompaniesList />} />
              <Route path="companies/:id" element={<CompanyDetail />} />
              <Route path="users" element={<UsersList />} />
              <Route path="webhook-logs" element={<WebhookLogs />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="staging-requests" element={<StagingRequests />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;