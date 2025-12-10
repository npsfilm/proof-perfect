import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/admin/PageTransition';
import { Eye } from 'lucide-react';

export default function AdminLayout() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border bg-background shadow-neu-flat-sm flex items-center justify-between px-3 md:px-6 sticky top-0 z-10 backdrop-blur-sm bg-background/95">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="transition-transform duration-200 hover:scale-110 active:scale-95" />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1.5 md:gap-2 rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed transition-all duration-200 hover:scale-105 active:scale-95 px-2.5 md:px-3"
                title="Zur Kunden-Ansicht wechseln"
              >
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Kunden-Ansicht</span>
              </Button>
              <span className="text-sm text-muted-foreground hidden md:inline transition-colors duration-200 hover:text-foreground truncate max-w-[150px]">{user.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="px-2 md:px-3"
              >
                <span className="hidden sm:inline">Abmelden</span>
                <span className="sm:hidden">×</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 bg-background">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
