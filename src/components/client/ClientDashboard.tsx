import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FolderOpen, ExternalLink, Lock, Unlock, Heart, Search, SortAsc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ReopenRequestModal } from '@/components/client/ReopenRequestModal';
import { GalleryHeroCard } from '@/components/client/GalleryHeroCard';
import { GalleryCompactCard } from '@/components/client/GalleryCompactCard';
import { NextStepsWizard } from '@/components/client/NextStepsWizard';
import { useGalleryCoverPhotos } from '@/hooks/useGalleryCoverPhotos';
import { GallerySelectionStats } from '@/types/database';

export function ClientDashboard() {
  const navigate = useNavigate();
  const [reopenGalleryId, setReopenGalleryId] = useState<string | null>(null);
  const [reopenGalleryName, setReopenGalleryName] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveSort, setArchiveSort] = useState<'newest' | 'oldest' | 'name'>('newest');

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

  // Fetch cover photos for all galleries
  const galleryIds = useMemo(() => stats?.map(g => g.gallery_id || '').filter(Boolean) || [], [stats]);
  const { data: coverPhotos } = useGalleryCoverPhotos(galleryIds);

  // Section galleries into Active, Closed, and Completed
  const { activeGalleries, closedGalleries, completedGalleries } = useMemo(() => {
    const active: GallerySelectionStats[] = [];
    const closed: GallerySelectionStats[] = [];
    const completed: GallerySelectionStats[] = [];
    
    (stats || []).forEach(gallery => {
      if (gallery.status === 'Planning' || gallery.status === 'Open' || gallery.status === 'Processing') {
        active.push(gallery);
      } else if (gallery.status === 'Closed') {
        closed.push(gallery);
      } else {
        completed.push(gallery); // Delivered
      }
    });
    
    return { activeGalleries: active, closedGalleries: closed, completedGalleries: completed };
  }, [stats]);

  // Helper to check if gallery is new (< 2 days old)
  const isNewGallery = (createdAt: string | null) => {
    if (!createdAt) return false;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return new Date(createdAt) > twoDaysAgo;
  };

  // Filter and sort archived galleries
  const filteredArchivedGalleries = useMemo(() => {
    let result = [...completedGalleries];
    
    // Apply search filter
    if (archiveSearch) {
      const query = archiveSearch.toLowerCase();
      result = result.filter(g => 
        g.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch (archiveSort) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
        break;
      case 'name':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
    }
    
    return result;
  }, [completedGalleries, archiveSearch, archiveSort]);

  // Find galleries that need immediate attention
  const nextStepsGallery = useMemo(() => {
    // Priority 1: Open galleries with 0 selections
    const openWithZero = activeGalleries.find(g => 
      g.status === 'Open' && 
      (g.selected_count || 0) === 0 &&
      (g.photos_count || 0) > 0
    );
    if (openWithZero) return { gallery: openWithZero, type: 'select' as const };
    
    // Priority 2: Open galleries with partial selections
    const openWithPartial = activeGalleries.find(g => 
      g.status === 'Open' && 
      (g.selected_count || 0) > 0 &&
      (g.photos_count || 0) > 0
    );
    if (openWithPartial) return { gallery: openWithPartial, type: 'continue' as const };
    
    // Priority 3: Processing galleries
    const processing = activeGalleries.find(g => g.status === 'Processing');
    if (processing) return { gallery: processing, type: 'processing' as const };
    
    // Priority 4: Delivered galleries
    const delivered = completedGalleries.find(g => g.status === 'Delivered');
    if (delivered) return { gallery: delivered, type: 'delivered' as const };
    
    return null;
  }, [activeGalleries, completedGalleries]);

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
          disabled: true,
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

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-[1920px]">
      <div className="space-y-8 pb-8">
        {/* Header with simple controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {completedGalleries.length > 0 && (
              <Button
                variant={showArchived ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="rounded-full shadow-neu-flat-sm"
              >
                {showArchived ? 'Aktive anzeigen' : 'Archiv anzeigen'}
              </Button>
            )}
          </div>
          
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

        {/* Action Center / Next Steps Hero */}
        {nextStepsGallery && !showArchived && (
          <NextStepsWizard
            gallery={nextStepsGallery.gallery}
            type={nextStepsGallery.type}
            onAction={() => {
              const { gallery } = nextStepsGallery;
              if (nextStepsGallery.type === 'select' || nextStepsGallery.type === 'continue') {
                navigate(`/gallery/${gallery.slug}`);
              }
            }}
          />
        )}

        {hasNoGalleries ? (
          <EmptyState
            icon={FolderOpen}
            title="Keine Galerien zugewiesen"
            description="Ihnen wurden noch keine Galerien zugewiesen. Bitte kontaktieren Sie Ihren Administrator."
          />
        ) : (
          <>
            {/* Active Projects Section */}
            {!showArchived && activeGalleries.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-foreground">
                    Aktive Projekte ({activeGalleries.length})
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeGalleries.map((gallery) => {
                    const buttonConfig = getButtonConfig(
                      gallery.status || 'Planning',
                      gallery.slug || '',
                      gallery.gallery_id || '',
                      gallery.name || ''
                    );

                    const coverImageUrl = coverPhotos?.[gallery.gallery_id || '']?.signed_url;

                    return (
                      <GalleryHeroCard
                        key={gallery.gallery_id}
                        name={gallery.name || ''}
                        status={gallery.status || 'Planning'}
                        photosCount={gallery.photos_count || 0}
                        selectedCount={gallery.selected_count || 0}
                        stagingCount={gallery.staging_count || 0}
                        coverImageUrl={coverImageUrl}
                        buttonLabel={buttonConfig.label}
                        buttonIcon={buttonConfig.icon}
                        buttonAction={buttonConfig.action}
                        buttonDisabled={buttonConfig.disabled}
                        buttonVariant={buttonConfig.variant}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Closed Projects Section */}
            {!showArchived && closedGalleries.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-muted-foreground">
                  Abgeschlossen ({closedGalleries.length})
                </h2>
                
                <div className="space-y-2">
                  {closedGalleries.map((gallery) => {
                    const buttonConfig = getButtonConfig(
                      gallery.status || 'Closed',
                      gallery.slug || '',
                      gallery.gallery_id || '',
                      gallery.name || ''
                    );

                    return (
                      <GalleryCompactCard
                        key={gallery.gallery_id}
                        name={gallery.name || ''}
                        status={gallery.status || 'Closed'}
                        photosCount={gallery.photos_count || 0}
                        selectedCount={gallery.selected_count || 0}
                        buttonLabel={buttonConfig.label}
                        buttonIcon={buttonConfig.icon}
                        buttonAction={buttonConfig.action}
                        buttonDisabled={buttonConfig.disabled}
                        buttonVariant={buttonConfig.variant}
                        isNew={isNewGallery(gallery.created_at)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Completed/Archived Section */}
            {showArchived && completedGalleries.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Abgeschlossen ({completedGalleries.length})
                  </h2>
                  
                  {/* Search and Sort Controls */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Archiv durchsuchen..."
                        value={archiveSearch}
                        onChange={(e) => setArchiveSearch(e.target.value)}
                        className="pl-9 shadow-neu-pressed"
                      />
                    </div>
                    
                    <Select value={archiveSort} onValueChange={(v) => setArchiveSort(v as 'newest' | 'oldest' | 'name')}>
                      <SelectTrigger className="w-full sm:w-40 shadow-neu-pressed">
                        <SortAsc className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Neueste</SelectItem>
                        <SelectItem value="oldest">Älteste</SelectItem>
                        <SelectItem value="name">Name A→Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {filteredArchivedGalleries.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="Keine Ergebnisse"
                      description="Keine Galerien entsprechen Ihrer Suche."
                      action={
                        <Button
                          variant="outline"
                          onClick={() => setArchiveSearch('')}
                          className="rounded-full shadow-neu-flat-sm"
                        >
                          Suche zurücksetzen
                        </Button>
                      }
                    />
                  ) : (
                    filteredArchivedGalleries.map((gallery) => {
                    const buttonConfig = getButtonConfig(
                      gallery.status || 'Planning',
                      gallery.slug || '',
                      gallery.gallery_id || '',
                      gallery.name || ''
                    );

                    return (
                      <GalleryCompactCard
                        key={gallery.gallery_id}
                        name={gallery.name || ''}
                        status={gallery.status || 'Delivered'}
                        photosCount={gallery.photos_count || 0}
                        selectedCount={gallery.selected_count || 0}
                        buttonLabel={buttonConfig.label}
                        buttonIcon={buttonConfig.icon}
                        buttonAction={buttonConfig.action}
                        buttonDisabled={buttonConfig.disabled}
                        buttonVariant={buttonConfig.variant}
                      />
                    );
                  })
                  )}
                </div>
              </div>
            )}

            {/* Empty state for active galleries */}
            {!showArchived && activeGalleries.length === 0 && (
              <EmptyState
                icon={FolderOpen}
                title="Keine aktiven Projekte"
                description="Alle Ihre Galerien sind abgeschlossen."
                action={
                  completedGalleries.length > 0 ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowArchived(true)}
                      className="rounded-full shadow-neu-flat-sm"
                    >
                      Archiv anzeigen
                    </Button>
                  ) : undefined
                }
              />
            )}
          </>
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
