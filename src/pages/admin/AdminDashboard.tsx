import { useGalleries } from '@/hooks/useGalleries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Clock, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { StatCardSkeletonGrid } from '@/components/admin/skeletons/StatCardSkeleton';
import { TimeElapsed } from '@/components/admin/TimeElapsed';

export default function AdminDashboard() {
  const { data: galleries, isLoading } = useGalleries();
  const navigate = useNavigate();

  const stats = {
    total: galleries?.length ?? 0,
    draft: galleries?.filter((g) => g.status === 'Planning').length ?? 0,
    sent: galleries?.filter((g) => g.status === 'Open').length ?? 0,
    reviewed: galleries?.filter((g) => g.status === 'Closed').length ?? 0,
  };

  return (
    <PageContainer size="full">
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Übersicht über Ihre Galerien und Aktivitäten"
          actions={
            <Button onClick={() => navigate('/admin/galleries/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Neue Galerie
            </Button>
          }
        />

      {isLoading ? (
        <StatCardSkeletonGrid count={4} />
      ) : (
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
      )}

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
                  className="flex items-center justify-between p-3 border rounded-2xl hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-neu-flat-sm group"
                  onClick={() => navigate(`/admin/galleries/${gallery.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{gallery.name}</p>
                      {gallery.status === 'Closed' && gallery.reviewed_at && (
                        <TimeElapsed 
                          startTime={gallery.reviewed_at}
                          variant="secondary"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {gallery.slug} • {gallery.status}
                    </p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/gallery/${gallery.slug}`, '_blank');
                      }}
                      title="Kunden-Ansicht öffnen"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      Ansehen
                    </Button>
                  </div>
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
    </PageContainer>
  );
}
