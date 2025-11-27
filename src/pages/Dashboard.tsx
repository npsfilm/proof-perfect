import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            {role === 'admin' ? 'Admin Dashboard' : 'My Galleries'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Welcome! You are logged in as <strong className="text-foreground">{role}</strong>.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dashboard functionality coming soon...
          </p>
        </div>
      </main>
    </div>
  );
}
