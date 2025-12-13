import { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGalleryBySlug } from '@/hooks/useGallery';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useGalleryFinalization } from '@/hooks/useGalleryFinalization';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import { FinalizeModals } from '@/components/client/FinalizeModals';
import { VirtualizedPhotoGrid } from '@/components/client/VirtualizedPhotoGrid';
import { GalleryFilterBar, PhotoFilter } from '@/components/client/GalleryFilterBar';
import { ComparisonMode } from '@/components/client/ComparisonMode';
import { WelcomeModal } from '@/components/client/WelcomeModal';
import { SelectionSummary } from '@/components/client/SelectionSummary';
import { AdminPreviewOverlay } from '@/components/client/AdminPreviewOverlay';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';
import { usePhotoOrientations } from '@/hooks/usePhotoOrientations';
import { useComparisonMode } from '@/hooks/useComparisonMode';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { useEventTracking } from '@/hooks/useEventTracking';
import { useGalleryAnnotations } from '@/hooks/useGalleryAnnotations';
import { Button } from '@/components/ui/button';
import {
  GalleryHeader,
  GalleryProofsBanner,
  ComparisonModeInstructions,
  GalleryLoadingState,
  GalleryNotFound,
  GalleryLocked,
  DeliveredGalleryView,
} from '@/components/client/gallery';

export default function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
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
  const { trackGalleryView, trackPhotoClick, trackSelectionToggle, trackFinalizationStarted } = useEventTracking();
  const galleryViewTracked = useRef(false);
  
  // Fetch drawing annotations for all photos
  const photoIds = photos?.map(p => p.id);
  const { data: photoDrawings } = useGalleryAnnotations(photoIds);

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

  const selectedPhotos = photos?.filter(p => p.is_selected) || [];
  const filterCounts = useMemo(() => ({
    all: photos?.length || 0,
    selected: selectedPhotos.length,
    unselected: (photos?.length || 0) - selectedPhotos.length,
  }), [photos, selectedPhotos]);

  useEffect(() => {
    if (gallery && gallery.show_onboarding) {
      const storageKey = 'proofing_welcome_shown';
      const hasSeenWelcome = localStorage.getItem(storageKey);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
      }
    }
  }, [gallery]);

  // Track gallery view once
  useEffect(() => {
    if (gallery && photos && !galleryViewTracked.current) {
      trackGalleryView(gallery.id, photos.length);
      galleryViewTracked.current = true;
    }
  }, [gallery, photos, trackGalleryView]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('proofing_welcome_shown', 'true');
  };

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
    if (gallery) {
      trackPhotoClick(gallery.id, photoId, isComparisonMode ? 'comparison_add' : 'lightbox_open');
    }
    handleComparisonPhotoClick(photoId, setSelectedPhotoId);
  };

  const handleRemoveSelection = (photoId: string) => {
    toggleSelection.mutate({ photoId, currentState: true });
  };

  const handleFinalize = () => {
    if (gallery) {
      trackFinalizationStarted(gallery.id, selectedPhotos.length);
    }
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

  // Loading state
  if (authLoading || galleryLoading) {
    return <GalleryLoadingState />;
  }

  // Not found state
  if (!gallery) {
    return <GalleryNotFound onNavigate={() => navigate('/')} />;
  }

  // Delivered state
  if (gallery.status === 'Delivered') {
    return (
      <DeliveredGalleryView
        gallery={gallery}
        photos={photos}
        isSaving={isSaving}
        lastSaved={lastSaved}
        isAdmin={role === 'admin'}
      />
    );
  }

  // Locked state
  if (gallery.is_locked) {
    return <GalleryLocked onNavigate={() => navigate('/')} />;
  }

  const selectedPhoto = selectedPhotoId ? photos?.find(p => p.id === selectedPhotoId) : null;
  const comparisonPhoto1 = comparisonPhotos[0] ? photos?.find(p => p.id === comparisonPhotos[0]) : null;
  const comparisonPhoto2 = comparisonPhotos[1] ? photos?.find(p => p.id === comparisonPhotos[1]) : null;

  return (
    <div className="pb-32">
      <GalleryHeader
        name={gallery.name}
        address={gallery.address || null}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <GalleryProofsBanner />

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

        {isComparisonMode && (
          <ComparisonModeInstructions
            comparisonPhotos={comparisonPhotos}
            firstComparisonOrientation={firstComparisonOrientation}
            onStartComparison={handleStartComparison}
            onCancel={handleComparisonToggle}
          />
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
          photoDrawings={photoDrawings}
        />
      </main>

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

      <FinalizeModals
        isOpen={showFinalizeModals}
        onClose={() => setShowFinalizeModals(false)}
        selectedPhotos={selectedPhotos}
        onFinalize={handleFinalizeSubmit}
      />

      <WelcomeModal
        open={showWelcome}
        onOpenChange={setShowWelcome}
        galleryName={gallery.name}
        onComplete={handleWelcomeComplete}
      />

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
