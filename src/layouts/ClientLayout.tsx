import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ClientSidebar, MobileClientNav } from '@/components/client/ClientSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeModeToggle } from '@/components/ui/theme-toggle';
import { Shield } from 'lucide-react';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ClientLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: clientProfile } = useClientProfile(user?.email);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lädt...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  };

  const getClientName = () => {
    if (!clientProfile) return '';
    
    const title = clientProfile.anrede || '';
    const name = clientProfile.ansprache === 'Du' 
      ? clientProfile.vorname 
      : `${title} ${clientProfile.nachname}`;
    
    return name;
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');

    if (path.startsWith('/gallery/')) return 'Galerie';
    if (path === '/virtuelle-bearbeitung') return 'Virtuelle Bearbeitung';
    if (path === '/buchung') return 'Shooting buchen';
    if (path === '/' && tab === 'staging') return 'Staging anfordern';
    if (path === '/' && tab === 'settings') return 'Einstellungen';
    return 'Meine Galerien';
  };

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-background">
        <ClientSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-background shadow-sm flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 backdrop-blur-sm bg-background/95">
            <div className="flex items-center gap-3 md:gap-4">
              {/* Mobile: Sheet trigger, Desktop: Sidebar trigger */}
              {isMobile ? (
                <MobileClientNav />
              ) : (
                <SidebarTrigger className="transition-transform duration-200 hover:scale-110 active:scale-95" />
              )}
              <div>
                <h1 className="text-base md:text-lg font-semibold text-foreground">{getPageTitle()}</h1>
                {clientProfile && (
                  <p className="text-xs text-muted-foreground">
                    {getGreeting()}, {getClientName()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <ThemeModeToggle />
              {role === 'admin' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                  title="Zur Admin-Ansicht wechseln"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
            </div>
          </header>
          <main className="flex-1 bg-background">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
