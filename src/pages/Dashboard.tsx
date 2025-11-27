import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, loading, navigate]);

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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            {role === 'admin' ? 'Admin Dashboard' : 'Meine Galerien'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {role === 'client' ? (
          <ClientDashboard />
        ) : (
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Willkommen! Sie sind angemeldet als <strong className="text-foreground">{role}</strong>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ClientDashboard() {
  const { user } = useAuth();
  const { data: galleries, isLoading } = useQuery({
    queryKey: ['my-galleries', user?.id],
    queryFn: async () => {
      const { data: accessData, error: accessError } = await supabase
        .from('gallery_access')
        .select('gallery_id')
        .eq('user_id', user!.id);

      if (accessError) throw accessError;

      const galleryIds = accessData.map(a => a.gallery_id);

      if (galleryIds.length === 0) return [];

      const { data: galleriesData, error: galleriesError } = await supabase
        .from('galleries')
        .select('*')
        .in('id', galleryIds)
        .order('created_at', { ascending: false });

      if (galleriesError) throw galleriesError;
      return galleriesData as Gallery[];
    },
  });

  if (isLoading) {
    return <p className="text-center text-muted-foreground">Ihre Galerien werden geladen...</p>;
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-2">Sie haben noch keinen Zugriff auf Galerien.</p>
        <p className="text-sm text-muted-foreground">Ihr Fotograf sendet Ihnen einen Link, sobald die Fotos bereit sind.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Ihre Galerien</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {galleries.map((gallery) => (
          <Card key={gallery.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">{gallery.name}</CardTitle>
              <Badge className="w-fit">{gallery.status}</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Wählen Sie bis zu {gallery.package_target_count} Fotos aus
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = `/gallery/${gallery.slug}`}
                disabled={gallery.is_locked}
              >
                {gallery.is_locked ? 'Abgeschlossen' : 'Galerie ansehen'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
