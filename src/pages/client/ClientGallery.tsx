import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gallery, Photo } from '@/types/database';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import { SelectionFooter } from '@/components/client/SelectionFooter';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogOut, Info } from 'lucide-react';

export default function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['client-gallery', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('slug', slug!)
        .single();

      if (error) throw error;
      return data as Gallery;
    },
    enabled: !!slug && !!user,
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['gallery-photos', gallery?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', gallery!.id)
        .order('upload_order', { ascending: true });

      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!gallery?.id,
  });

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
    // TODO: Implement finalization flow
    alert('Finalization coming soon!');
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
          <p className="text-lg text-muted-foreground mb-4">Gallery not found</p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
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
              This gallery has been finalized and is now locked. You can no longer make changes to your selection.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const selectedPhotos = photos?.filter(p => p.is_selected) || [];
  const selectedPhoto = selectedPhotoId ? photos?.find(p => p.id === selectedPhotoId) : null;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{gallery.name}</h1>
            <p className="text-sm text-muted-foreground">Select your favorite photos</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </header>

      {/* Banner */}
      <div className="bg-blue-50 border-b border-blue-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-blue-900 text-center">
            <Info className="inline h-4 w-4 mr-1" />
            <strong>Unedited Proofs only.</strong> Colors and lighting will be corrected in the final version. Please focus on angles and composition.
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <main className="container mx-auto px-4 py-6">
        {photosLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => handlePhotoClick(photo.id)}
                className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                  photo.is_selected 
                    ? 'border-primary shadow-md' 
                    : 'border-transparent hover:border-muted'
                }`}
              >
                <img
                  src={photo.storage_url}
                  alt={photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {photo.is_selected && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1.5">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                )}
                {photo.client_comment && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    Has comment
                  </div>
                )}
                {photo.staging_requested && (
                  <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    Staging
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No photos uploaded yet</p>
          </div>
        )}
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
        />
      )}
    </div>
  );
}
