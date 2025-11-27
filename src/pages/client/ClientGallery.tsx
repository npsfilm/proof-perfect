import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGalleryBySlug } from '@/hooks/useGallery';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useGalleryFinalization } from '@/hooks/useGalleryFinalization';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import { SelectionFooter } from '@/components/client/SelectionFooter';
import { FinalizeModals } from '@/components/client/FinalizeModals';
import { ClientGalleryHeader } from '@/components/client/ClientGalleryHeader';
import { ClientPhotoGrid } from '@/components/client/ClientPhotoGrid';
import { GalleryFilterBar, PhotoFilter } from '@/components/client/GalleryFilterBar';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Info } from 'lucide-react';

export default function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showFinalizeModals, setShowFinalizeModals] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<PhotoFilter>('all');

  const { data: gallery, isLoading: galleryLoading } = useGalleryBySlug(slug, !!user);
  const { data: photos, isLoading: photosLoading } = useGalleryPhotos(gallery?.id);
  const { finalizeGallery, isSubmitting } = useGalleryFinalization(gallery, user?.id, slug);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handlePhotoClick = (photoId: string) => {
    setSelectedPhotoId(photoId);
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

  const handleFinalize = () => {
    setShowFinalizeModals(true);
  };

  const handleFinalizeSubmit = async (data: {
    feedback: string;
    stagingSelections: { photoId: string; staging: boolean; style?: string }[];
    referenceFile?: File;
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

  const selectedPhotos = photos?.filter(p => p.is_selected) || [];
  const selectedPhoto = selectedPhotoId ? photos?.find(p => p.id === selectedPhotoId) : null;

  // Filter photos based on active filter
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

  const filterCounts = useMemo(() => ({
    all: photos?.length || 0,
    selected: selectedPhotos.length,
    unselected: (photos?.length || 0) - selectedPhotos.length,
  }), [photos, selectedPhotos]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ClientGalleryHeader galleryName={gallery.name} onSignOut={signOut} />

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
      <main className="container mx-auto px-4 py-6">
        <GalleryFilterBar
          activeFilter={photoFilter}
          onFilterChange={setPhotoFilter}
          counts={filterCounts}
        />
        <ClientPhotoGrid
          photos={filteredPhotos}
          isLoading={photosLoading}
          onPhotoClick={handlePhotoClick}
          galleryId={gallery.id}
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
        />
      )}

      {/* Footer */}
      {photos && photos.length > 0 && (
        <SelectionFooter
          selectedCount={selectedPhotos.length}
          targetCount={gallery.package_target_count}
          onFinalize={handleFinalize}
          disabled={gallery.is_locked || isSubmitting}
        />
      )}

      {/* Finalization Modals */}
      <FinalizeModals
        isOpen={showFinalizeModals}
        onClose={() => setShowFinalizeModals(false)}
        selectedPhotos={selectedPhotos}
        onFinalize={handleFinalizeSubmit}
      />
    </div>
  );
}