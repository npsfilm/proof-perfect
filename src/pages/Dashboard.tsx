import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ClientDashboard } from '@/components/client/ClientDashboard';
import { Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    // Removed auto-redirect for admins - they can now view client dashboard
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

  return (
    <div className="min-h-screen bg-background">
      <header className="h-16 border-b border-border bg-card shadow-neu-flat-sm flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
        <h1 className="text-xl font-bold text-primary">
          Meine Galerien
        </h1>
        <div className="flex items-center gap-3">
          {role === 'admin' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin')}
              className="gap-2 rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed transition-all duration-200 hover:scale-105 active:scale-95"
              title="Zur Admin-Ansicht wechseln"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin-Ansicht</span>
            </Button>
          )}
          <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={signOut}
            className="rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed"
          >
            Abmelden
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ClientDashboard />
      </main>
    </div>
  );
}

