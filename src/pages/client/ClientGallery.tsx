import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGalleryBySlug } from '@/hooks/useGallery';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useGalleryFinalization } from '@/hooks/useGalleryFinalization';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import { FinalizeModals } from '@/components/client/FinalizeModals';
import { ClientGalleryHeader } from '@/components/client/ClientGalleryHeader';
import { VirtualizedPhotoGrid } from '@/components/client/VirtualizedPhotoGrid';
import { GalleryFilterBar, PhotoFilter } from '@/components/client/GalleryFilterBar';
import { ComparisonMode } from '@/components/client/ComparisonMode';
import { WelcomeModal } from '@/components/client/WelcomeModal';
import { SelectionSummary } from '@/components/client/SelectionSummary';
import { SaveStatusIndicator } from '@/components/client/SaveStatusIndicator';
import { AdminPreviewOverlay } from '@/components/client/AdminPreviewOverlay';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';
import { usePhotoOrientations } from '@/hooks/usePhotoOrientations';
import { useComparisonMode } from '@/hooks/useComparisonMode';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

export default function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, role, signOut, loading: authLoading } = useAuth();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showFinalizeModals, setShowFinalizeModals] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all');
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: gallery, isLoading: galleryLoading } = useGalleryBySlug(slug, !!user);
  const { data: photos, isLoading: photosLoading } = useGalleryPhotos(gallery?.id);
  const { signedUrls, isLoading: urlsLoading } = useSignedPhotoUrls(photos);
  const { finalizeGallery, isSubmitting } = useGalleryFinalization(gallery, user?.id, slug);
  const { toggleSelection, isSaving, lastSaved } = usePhotoSelection(gallery?.id);
  const { orientations, detectOrientation } = usePhotoOrientations(photos);

  // Use comparison mode hook
  const {
    isComparisonMode,
    comparisonPhotos,
    firstComparisonOrientation,
    showComparisonOverlay,
    handlePhotoClick: handleComparisonPhotoClick,
    handleComparisonToggle,
    handleStartComparison,
    handleComparisonNavigate,
    handleComparisonSwap,
    handleCloseComparison,
    handleToggleSelectionInComparison,
  } = useComparisonMode({
    photos,
    orientations,
    onToggleSelection: (photoId, currentState) => {
      toggleSelection.mutate({ photoId, currentState });
    },
  });

  // Filter photos based on active filter - MUST be before early returns
  const filteredPhotos = useMemo(() => {
    if (!photos) return undefined;
    switch (photoFilter) {
      case 'selected':
        return photos.filter(p => p.is_selected);
      case 'unselected':
        return photos.filter(p => !p.is_selected);
      default:
        return photos;
    }
  }, [photos, photoFilter]);

  // Calculate filter counts - MUST be before early returns
  const selectedPhotos = photos?.filter(p => p.is_selected) || [];
  const filterCounts = useMemo(() => ({
    all: photos?.length || 0,
    selected: selectedPhotos.length,
    unselected: (photos?.length || 0) - selectedPhotos.length,
  }), [photos, selectedPhotos]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Check if welcome modal should be shown
  useEffect(() => {
    if (gallery && slug) {
      const storageKey = `proofing_welcome_shown_${slug}`;
      const hasSeenWelcome = localStorage.getItem(storageKey);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [gallery, slug]);

  const handleWelcomeComplete = () => {
    if (slug) {
      localStorage.setItem(`proofing_welcome_shown_${slug}`, 'true');
    }
  };

  const handleShowHelp = () => {
    setShowWelcome(true);
  };

  // Keyboard navigation hook
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!photos || !selectedPhotoId) return;
    
    const currentIndex = photos.findIndex(p => p.id === selectedPhotoId);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedPhotoId(photos[currentIndex - 1].id);
    } else if (direction === 'next' && currentIndex < photos.length - 1) {
      setSelectedPhotoId(photos[currentIndex + 1].id);
    }
  };

  useKeyboardNavigation({
    photos,
    selectedPhotoId,
    onSetSelectedPhotoId: setSelectedPhotoId,
    onNavigate: handleNavigate,
  });

  const handlePhotoClick = (photoId: string) => {
    handleComparisonPhotoClick(photoId, setSelectedPhotoId);
  };

  const handleRemoveSelection = (photoId: string) => {
    toggleSelection.mutate({ photoId, currentState: true });
  };

  const handleFinalize = () => {
    setShowFinalizeModals(true);
  };

  const handleFinalizeSubmit = async (data: {
    feedback: string;
    services: {
      expressDelivery: boolean;
      virtualStaging: boolean;
      blueHour: boolean;
    };
    stagingSelections: { photoId: string; staging: boolean; style?: string }[];
    blueHourSelections: string[];
    referenceFile?: File;
    stagingComment?: string;
  }) => {
    const success = await finalizeGallery(data);
    if (success) {
      setShowFinalizeModals(false);
    }
  };

  if (authLoading || galleryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Galerie nicht gefunden</p>
          <Button onClick={() => navigate('/')}>Zum Dashboard</Button>
        </div>
      </div>
    );
  }

  if (gallery.is_locked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Diese Galerie wurde finalisiert und ist nun gesperrt. Sie können keine Änderungen mehr an Ihrer Auswahl vornehmen.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate('/')}>Zum Dashboard</Button>
        </div>
      </div>
    );
  }

  const selectedPhoto = selectedPhotoId ? photos?.find(p => p.id === selectedPhotoId) : null;
  const comparisonPhoto1 = comparisonPhotos[0] ? photos?.find(p => p.id === comparisonPhotos[0]) : null;
  const comparisonPhoto2 = comparisonPhotos[1] ? photos?.find(p => p.id === comparisonPhotos[1]) : null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <ClientGalleryHeader 
        galleryName={gallery.name} 
        onSignOut={signOut}
        onShowHelp={handleShowHelp}
      >
        <SaveStatusIndicator isSaving={isSaving} lastSaved={lastSaved} />
      </ClientGalleryHeader>

      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-blue-900 text-center">
            <Info className="inline h-4 w-4 mr-1" />
            <strong>Nur unbearbeitete Proofs.</strong> Farben und Beleuchtung werden in der finalen Version korrigiert. Bitte konzentrieren Sie sich auf Winkel und Komposition.
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <main className="max-w-[1920px] w-full mx-auto px-4 lg:px-6 xl:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <GalleryFilterBar
            activeFilter={photoFilter}
            onFilterChange={setPhotoFilter}
            counts={filterCounts}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleComparisonToggle}
            className={isComparisonMode ? 'border-primary text-primary' : ''}
          >
            {isComparisonMode 
              ? `Vergleichsmodus (${comparisonPhotos.length}/2)` 
              : 'Fotos vergleichen'}
          </Button>
        </div>

        {/* Comparison Mode Instructions */}
        {isComparisonMode && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 shadow-neu-flat-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-neu-flat-sm">
                  {comparisonPhotos.length}/2
                </div>
                <div>
                  <p className="font-semibold text-primary">Vergleichsmodus aktiv</p>
                  <p className="text-sm text-muted-foreground">
                    {comparisonPhotos.length === 0 
                      ? 'Wählen Sie das erste Foto zum Vergleichen' 
                      : comparisonPhotos.length === 1
                      ? `Wählen Sie ein weiteres ${
                          firstComparisonOrientation === 'portrait' 
                            ? 'Hochformat' 
                            : firstComparisonOrientation === 'landscape' 
                            ? 'Querformat' 
                            : 'quadratisches'
                        }-Foto`
                      : 'Bereit zum Vergleichen!'}
                  </p>
                  {firstComparisonOrientation && comparisonPhotos.length === 1 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Nur Fotos mit gleichem Format können verglichen werden
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {comparisonPhotos.length === 2 && (
                  <Button onClick={handleStartComparison}>
                    Bilder vergleichen
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleComparisonToggle}>
                  Abbrechen
                </Button>
              </div>
            </div>
          </div>
        )}
      <VirtualizedPhotoGrid
        photos={filteredPhotos}
        isLoading={photosLoading || urlsLoading}
        onPhotoClick={handlePhotoClick}
        galleryId={gallery.id}
        signedUrls={signedUrls}
        comparisonPhotos={comparisonPhotos}
        isComparisonMode={isComparisonMode}
        photoOrientations={orientations}
        allowedOrientation={firstComparisonOrientation}
        onOrientationDetected={detectOrientation}
      />
      </main>

      {/* Lightbox */}
      {selectedPhoto && photos && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos}
          onClose={() => setSelectedPhotoId(null)}
          onNavigate={handleNavigate}
          galleryId={gallery.id}
          signedUrls={signedUrls}
        />
      )}

      {/* Comparison Mode */}
      {showComparisonOverlay && comparisonPhoto1 && comparisonPhoto2 && filteredPhotos && (
        <ComparisonMode
          photo1={comparisonPhoto1}
          photo2={comparisonPhoto2}
          photos={filteredPhotos}
          onClose={handleCloseComparison}
          onSwap={handleComparisonSwap}
          onNavigate={(slot, direction) => handleComparisonNavigate(slot, direction, filteredPhotos)}
          onToggleSelection={handleToggleSelectionInComparison}
        />
      )}

      {/* Selection Summary */}
      {photos && photos.length > 0 && (
        <SelectionSummary
          selectedPhotos={selectedPhotos}
          onPhotoClick={handlePhotoClick}
          onRemoveSelection={handleRemoveSelection}
          onFinalize={handleFinalize}
          disabled={gallery.is_locked || isSubmitting}
          targetCount={gallery.package_target_count}
        />
      )}

      {/* Finalization Modals */}
      <FinalizeModals
        isOpen={showFinalizeModals}
        onClose={() => setShowFinalizeModals(false)}
        selectedPhotos={selectedPhotos}
        onFinalize={handleFinalizeSubmit}
      />

      {/* Welcome Modal */}
      <WelcomeModal
        open={showWelcome}
        onOpenChange={setShowWelcome}
        galleryName={gallery.name}
        targetCount={gallery.package_target_count}
        onComplete={handleWelcomeComplete}
      />

      {/* Admin Preview Overlay - Only visible to admins */}
      {role === 'admin' && (
        <AdminPreviewOverlay 
          gallery={gallery}
          selectedCount={selectedPhotos.length}
          totalCount={photos?.length || 0}
        />
      )}
    </div>
  );
}