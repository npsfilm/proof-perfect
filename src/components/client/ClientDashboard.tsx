import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw, FolderOpen, Camera, Heart, Home, ExternalLink, Lock, Unlock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KpiCard } from '@/components/ui/KpiCard';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ReopenRequestModal } from '@/components/client/ReopenRequestModal';
import { GallerySelectionStats } from '@/types/database';

type SortOption = 'created_desc' | 'created_asc' | 'name_asc' | 'selected_desc';
type StatusFilter = 'all' | 'Planning' | 'Open' | 'Closed' | 'Processing' | 'Delivered';

export function ClientDashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [reopenGalleryId, setReopenGalleryId] = useState<string | null>(null);
  const [reopenGalleryName, setReopenGalleryName] = useState('');

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
        g.name?.toLowerCase().includes(query)
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Planning': return 'Planung';
      case 'Open': return 'Offen';
      case 'Closed': return 'Geschlossen';
      case 'Processing': return 'Bearbeitung';
      case 'Delivered': return 'Geliefert';
      default: return status;
    }
  };

  const getButtonConfig = (status: string, slug: string, galleryId: string, name: string) => {
    switch (status) {
      case 'Planning':
        return {
          label: 'In Vorbereitung',
          icon: Lock,
          disabled: true,
          action: () => {},
        };
      case 'Open':
        return {
          label: 'Fotos auswählen',
          icon: Heart,
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
        };
      case 'Closed':
        return {
          label: 'Um Wiedereröffnung bitten',
          icon: Unlock,
          disabled: false,
          variant: 'outline' as const,
          action: () => {
            setReopenGalleryId(galleryId);
            setReopenGalleryName(name);
          },
        };
      case 'Processing':
        return {
          label: 'In Bearbeitung',
          icon: RefreshCw,
          disabled: true,
          action: () => {},
        };
      case 'Delivered':
        return {
          label: 'Herunterladen',
          icon: ExternalLink,
          disabled: true, // We'd need final_delivery_link from full gallery data
          action: () => {},
        };
      default:
        return {
          label: 'Galerie öffnen',
          icon: FolderOpen,
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
        };
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <LoadingState message="Galerien werden geladen..." />
      </div>
    );
  }

  const hasNoGalleries = !stats || stats.length === 0;
  const hasNoResults = filteredGalleries.length === 0 && !hasNoGalleries;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8">
      <div className="space-y-6 pb-8">
        {/* Header & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Galerie suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 shadow-neu-pressed"
                aria-label="Galerie nach Name suchen"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] shadow-neu-pressed">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="Planning">Planung</SelectItem>
                <SelectItem value="Open">Offen</SelectItem>
                <SelectItem value="Closed">Geschlossen</SelectItem>
                <SelectItem value="Processing">Bearbeitung</SelectItem>
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
              
              const buttonConfig = getButtonConfig(
                gallery.status || 'Planning', 
                gallery.slug || '',
                gallery.gallery_id || '',
                gallery.name || ''
              );
              const ButtonIcon = buttonConfig.icon;

              return (
                <Card key={gallery.gallery_id} className="shadow-neu-flat hover:shadow-neu-flat-sm transition-all duration-200">
                  <CardHeader className="space-y-3">
                    <div className="space-y-2">
                      <CardTitle className="text-lg leading-tight">{gallery.name}</CardTitle>
                      <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
                        {getStatusLabel(gallery.status || 'Planning')}
                      </div>
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

                    {/* Progress Bar with X von Y Label */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {gallery.selected_count || 0} von {gallery.photos_count || 0} Fotos ausgewählt
                        </span>
                        <span className="font-medium text-primary">{progress}%</span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2"
                        aria-label={`${gallery.selected_count || 0} von ${gallery.photos_count || 0} Fotos ausgewählt`}
                      />
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={buttonConfig.action}
                      disabled={buttonConfig.disabled}
                      variant={buttonConfig.variant || 'default'}
                      className="w-full rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed gap-2"
                      size="lg"
                    >
                      <ButtonIcon className="h-4 w-4" />
                      {buttonConfig.label}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Reopen Request Modal */}
      <ReopenRequestModal
        open={!!reopenGalleryId}
        onOpenChange={(open) => {
          if (!open) {
            setReopenGalleryId(null);
            setReopenGalleryName('');
          }
        }}
        galleryId={reopenGalleryId || ''}
        galleryName={reopenGalleryName}
      />
    </div>
  );
}
