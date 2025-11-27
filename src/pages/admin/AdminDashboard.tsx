import { useGalleries } from '@/hooks/useGalleries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen } from 'lucide-react';

export default function AdminDashboard() {
  const { galleries, isLoading } = useGalleries();
  const navigate = useNavigate();

  const stats = {
    total: galleries?.length ?? 0,
    draft: galleries?.filter((g) => g.status === 'Draft').length ?? 0,
    sent: galleries?.filter((g) => g.status === 'Sent').length ?? 0,
    reviewed: galleries?.filter((g) => g.status === 'Reviewed').length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Button onClick={() => navigate('/admin/galleries/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Galerie
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Galerien gesamt</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entwurf</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesendet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Überprüft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Neueste Galerien</CardTitle>
          <CardDescription>Ihre zuletzt erstellten Galerien</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Lädt...</p>
          ) : galleries && galleries.length > 0 ? (
            <div className="space-y-2">
              {galleries.slice(0, 5).map((gallery) => (
                <div
                  key={gallery.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                >
                  <div>
                    <p className="font-medium">{gallery.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {gallery.slug} • {gallery.status}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ansehen
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Noch keine Galerien. Erstellen Sie Ihre erste Galerie, um loszulegen.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
