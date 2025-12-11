import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { PageTransition } from '@/components/admin/PageTransition';
import { ThemeModeToggle } from '@/components/ui/theme-toggle';
import { SeoHead, PageType } from '@/components/SeoHead';

export default function AdminLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageType = (): PageType => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return 'admin_dashboard';
    if (path.includes('/admin/galleries')) return 'admin_galleries';
    if (path.includes('/admin/settings')) return 'admin_settings';
    return 'admin_dashboard';
  };

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <>
      <SeoHead pageType={getPageType()} />
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border bg-background flex items-center justify-between px-3 md:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="transition-colors hover:bg-muted" />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeModeToggle />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
        </div>
      </SidebarProvider>
    </>
  );
}
