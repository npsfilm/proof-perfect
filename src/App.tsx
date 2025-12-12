import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnspracheProvider } from "@/contexts/AnspracheContext";
import { BrandingProvider } from "@/contexts/BrandingContext";
import { TrackingProvider } from "@/contexts/TrackingContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";
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
import AdminEmails from "./pages/admin/AdminEmails";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import StagingRequests from "./pages/admin/StagingRequests";
import AdminCalendar from "./pages/admin/AdminCalendar";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminServices from "./pages/admin/AdminServices";
import AdminWorkflows from "./pages/admin/AdminWorkflows";
import WorkflowEditorPage from "./pages/admin/WorkflowEditorPage";
import ClientGallery from "./pages/client/ClientGallery";
import VirtualEditing from "./pages/client/VirtualEditing";
import Buchung from "./pages/Buchung";
import FeatureRequest from "./pages/FeatureRequest";
import FeatureRequests from "./pages/admin/FeatureRequests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <TrackingProvider>
                <BrandingProvider>
                  <AnspracheProvider>
                    <Routes>
                  {/* Auth routes (no layout) */}
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/reset-password" element={<ResetPassword />} />
                  <Route path="/auth/verify-email" element={<VerifyEmail />} />
                  
                  {/* Public booking page (no layout) */}
                  <Route path="/buchen" element={<Buchung />} />
                  
                  {/* Feature Request page (no layout - own header) */}
                  <Route path="/feature-anfrage" element={<FeatureRequest />} />
                  
                  {/* Client routes with ClientLayout */}
                  <Route element={<ClientLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/gallery/:slug" element={<ClientGallery />} />
                    <Route path="/virtuelle-bearbeitung" element={<VirtualEditing />} />
                  </Route>

                  {/* Admin routes with AdminLayout */}
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
                    <Route path="emails" element={<AdminEmails />} />
                    <Route path="newsletter" element={<AdminNewsletter />} />
                    <Route path="staging-requests" element={<StagingRequests />} />
                    <Route path="calendar" element={<AdminCalendar />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="workflows" element={<AdminWorkflows />} />
                    <Route path="workflows/:id" element={<WorkflowEditorPage />} />
                    <Route path="feature-requests" element={<FeatureRequests />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AnspracheProvider>
                </BrandingProvider>
              </TrackingProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
