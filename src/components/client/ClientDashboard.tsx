import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, FolderOpen, Camera, Heart, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/ui/KpiCard';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { GallerySelectionStats } from '@/types/database';
import { GalleryProgressBar } from '@/components/ui/GalleryProgressBar';

type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'selected_desc';
type StatusFilter = 'all' | 'Draft' | 'Sent' | 'Reviewed' | 'Delivered';

export function ClientDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['client-gallery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gallery_selection_stats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GallerySelectionStats[];
    },
  });

  const filteredGalleries = useMemo(() => {
    let result = stats || [];
    
    // Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(g => g.status === statusFilter);
    }
    
    // Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(g => 
        g.name?.toLowerCase().includes(query) ||
        g.slug?.toLowerCase().includes(query)
      );
    }
    
    // Sort
    switch (sortBy) {
      case 'created_desc':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'created_asc':
        result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'name_asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'selected_desc':
        result.sort((a, b) => (b.selected_count || 0) - (a.selected_count || 0));
        break;
    }
    
    return result;
  }, [stats, statusFilter, searchQuery, sortBy]);

  // Calculate KPIs from filtered data
  const kpis = useMemo(() => ({
    galleries: filteredGalleries.length,
    photos: filteredGalleries.reduce((sum, g) => sum + (g.photos_count || 0), 0),
    selected: filteredGalleries.reduce((sum, g) => sum + (g.selected_count || 0), 0),
    staging: filteredGalleries.reduce((sum, g) => sum + (g.staging_count || 0), 0),
  }), [filteredGalleries]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Sent': return 'default';
      case 'Reviewed': return 'outline';
      case 'Delivered': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Draft': return 'Entwurf';
      case 'Sent': return 'Gesendet';
      case 'Reviewed': return 'Überprüft';
      case 'Delivered': return 'Geliefert';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Galerien werden geladen..." />
      </div>
    );
  }

  const hasNoGalleries = !stats || stats.length === 0;
  const hasNoResults = filteredGalleries.length === 0 && !hasNoGalleries;

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Meine Galerien</h1>
          <p className="text-muted-foreground">Verwalten und öffnen Sie Ihre zugewiesenen Fotogalerien</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Galerie suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 shadow-neu-pressed"
              aria-label="Galerie nach Name oder Slug suchen"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px] shadow-neu-pressed">
              <SelectValue placeholder="Status filtern" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              <SelectItem value="Draft">Entwurf</SelectItem>
              <SelectItem value="Sent">Gesendet</SelectItem>
              <SelectItem value="Reviewed">Überprüft</SelectItem>
              <SelectItem value="Delivered">Geliefert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-full sm:w-[180px] shadow-neu-pressed">
              <SelectValue placeholder="Sortierung" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Neueste</SelectItem>
              <SelectItem value="created_asc">Älteste</SelectItem>
              <SelectItem value="name_asc">Name A→Z</SelectItem>
              <SelectItem value="selected_desc">Meiste Auswahl</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="shadow-neu-flat-sm hover:shadow-neu-pressed rounded-full"
            title="Aktualisieren"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={FolderOpen}
          label="Galerien"
          value={kpis.galleries}
          description={statusFilter !== 'all' ? getStatusLabel(statusFilter) : 'Gesamt'}
        />
        <KpiCard
          icon={Camera}
          label="Fotos"
          value={kpis.photos}
          description="Insgesamt"
        />
        <KpiCard
          icon={Heart}
          label="Ausgewählt"
          value={kpis.selected}
          description="Ihre Auswahl"
        />
        <KpiCard
          icon={Home}
          label="Staging"
          value={kpis.staging}
          description="Angefordert"
        />
      </div>

      {/* Gallery Cards Grid */}
      {hasNoGalleries ? (
        <EmptyState
          icon={FolderOpen}
          title="Keine Galerien zugewiesen"
          description="Ihnen wurden noch keine Galerien zugewiesen. Bitte kontaktieren Sie Ihren Administrator."
        />
      ) : hasNoResults ? (
        <EmptyState
          icon={Search}
          title="Keine Ergebnisse gefunden"
          description="Keine Galerien entsprechen Ihren Suchkriterien. Versuchen Sie es mit anderen Filtern."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="rounded-full shadow-neu-flat-sm"
            >
              Filter zurücksetzen
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGalleries.map((gallery) => {
            const progress = gallery.photos_count && gallery.photos_count > 0
              ? Math.round((gallery.selected_count || 0) / gallery.photos_count * 100)
              : 0;
            
            const isLocked = gallery.status === 'Closed' || gallery.status === 'Delivered';

            return (
              <Card key={gallery.gallery_id} className="shadow-neu-flat hover:shadow-neu-flat-sm transition-all duration-200">
                <CardHeader className="space-y-3">
                  <div className="space-y-2">
                    <CardTitle className="text-lg leading-tight">{gallery.name}</CardTitle>
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        /{gallery.slug}
                      </code>
                    </div>
                    <GalleryProgressBar currentStatus={gallery.status || 'Planning'} compact />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Mini Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Camera className="h-3.5 w-3.5" />
                      <span>{gallery.photos_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Heart className="h-3.5 w-3.5" />
                      <span>{gallery.selected_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Home className="h-3.5 w-3.5" />
                      <span>{gallery.staging_count || 0}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Auswahlfortschritt</span>
                      <span className="font-medium text-primary">{progress}%</span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                      aria-label={`${progress}% ausgewählt`}
                    />
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => navigate(`/gallery/${gallery.slug}`)}
                    disabled={isLocked}
                    className="w-full rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed"
                    size="lg"
                  >
                    {isLocked ? 'Abgeschlossen' : 'Galerie öffnen'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
