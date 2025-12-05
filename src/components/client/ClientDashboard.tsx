import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FolderOpen, ExternalLink, Lock, Unlock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { ReopenRequestModal } from '@/components/client/ReopenRequestModal';
import { GalleryHeroCard } from '@/components/client/GalleryHeroCard';
import { GalleryCompactCard } from '@/components/client/GalleryCompactCard';
import { NextStepsWizard } from '@/components/client/NextStepsWizard';
import { DashboardHero } from '@/components/client/DashboardHero';
import { QuickActionsGrid } from '@/components/client/QuickActionsGrid';
import { CostCalculatorModal } from '@/components/client/CostCalculatorModal';
import { QuickDownloadsModal } from '@/components/client/QuickDownloadsModal';
import { useGalleryCoverPhotos } from '@/hooks/useGalleryCoverPhotos';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useStagingRequests } from '@/hooks/useStagingRequests';
import { useAuth } from '@/contexts/AuthContext';
import { GallerySelectionStats } from '@/types/database';

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reopenGalleryId, setReopenGalleryId] = useState<string | null>(null);
  const [reopenGalleryName, setReopenGalleryName] = useState('');
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);

  const { data: clientProfile } = useClientProfile(user?.email);
  const { data: stagingRequests } = useStagingRequests();

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

  // Count open staging requests
  const openStagingCount = useMemo(() => {
    return stagingRequests?.filter(r => r.status === 'pending').length || 0;
  }, [stagingRequests]);

  // Helper to check if gallery is new (< 2 days old)
  const isNewGallery = (createdAt: string | null) => {
    if (!createdAt) return false;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return new Date(createdAt) > twoDaysAgo;
  };

  // Find galleries that need immediate attention
  const nextStepsGallery = useMemo(() => {
    const openWithZero = activeGalleries.find(g => 
      g.status === 'Open' && 
      (g.selected_count || 0) === 0 &&
      (g.photos_count || 0) > 0
    );
    if (openWithZero) return { gallery: openWithZero, type: 'select' as const };
    
    const openWithPartial = activeGalleries.find(g => 
      g.status === 'Open' && 
      (g.selected_count || 0) > 0 &&
      (g.photos_count || 0) > 0
    );
    if (openWithPartial) return { gallery: openWithPartial, type: 'continue' as const };
    
    const processing = activeGalleries.find(g => g.status === 'Processing');
    if (processing) return { gallery: processing, type: 'processing' as const };
    
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
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
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
        {/* Hero Welcome Section */}
        <DashboardHero 
          clientName={clientProfile?.nachname}
          anrede={clientProfile?.anrede}
        />

        {/* Quick Actions Grid */}
        <QuickActionsGrid
          deliveredCount={completedGalleries.length}
          stagingRequestsCount={openStagingCount}
          onOpenCalculator={() => setCalculatorOpen(true)}
          onOpenDownloads={() => setDownloadsOpen(true)}
        />

        {/* Refresh Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Meine Projekte</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Aktualisieren"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Action Center / Next Steps Hero */}
        {nextStepsGallery && (
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
            description="Ihnen wurden noch keine Galerien zugewiesen. Buchen Sie jetzt Ihr erstes Shooting!"
          />
        ) : (
          <>
            {/* Active Projects Section */}
            {activeGalleries.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Aktive Projekte ({activeGalleries.length})
                  </h3>
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
            {closedGalleries.length > 0 && (
              <div className="space-y-3 animate-fade-in">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Abgeschlossen ({closedGalleries.length})
                </h3>
                
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

            {/* Delivered Projects Section */}
            {completedGalleries.length > 0 && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  Geliefert ({completedGalleries.length})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedGalleries.map((gallery) => {
                    const buttonConfig = getButtonConfig(
                      gallery.status || 'Delivered',
                      gallery.slug || '',
                      gallery.gallery_id || '',
                      gallery.name || ''
                    );

                    const coverImageUrl = coverPhotos?.[gallery.gallery_id || '']?.signed_url;

                    return (
                      <GalleryHeroCard
                        key={gallery.gallery_id}
                        name={gallery.name || ''}
                        status={gallery.status || 'Delivered'}
                        photosCount={gallery.photos_count || 0}
                        selectedCount={gallery.selected_count || 0}
                        stagingCount={gallery.staging_count || 0}
                        coverImageUrl={coverImageUrl}
                        buttonLabel={buttonConfig.label}
                        buttonIcon={buttonConfig.icon}
                        buttonAction={buttonConfig.action}
                        buttonDisabled={buttonConfig.disabled}
                        buttonVariant={buttonConfig.variant}
                        size="small"
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state for active galleries */}
            {activeGalleries.length === 0 && (
              <EmptyState
                icon={FolderOpen}
                title="Keine aktiven Projekte"
                description="Alle Ihre Galerien sind abgeschlossen."
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CostCalculatorModal
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
      />

      <QuickDownloadsModal
        open={downloadsOpen}
        onOpenChange={setDownloadsOpen}
        deliveredGalleries={completedGalleries}
      />

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
