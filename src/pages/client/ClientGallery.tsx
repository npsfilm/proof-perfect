import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Gallery, Photo } from '@/types/database';
import { PhotoLightbox } from '@/components/client/PhotoLightbox';
import { SelectionFooter } from '@/components/client/SelectionFooter';
import { FinalizeModals } from '@/components/client/FinalizeModals';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogOut, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ClientGallery() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [showFinalizeModals, setShowFinalizeModals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setShowFinalizeModals(true);
  };

  const handleFinalizeSubmit = async (data: {
    feedback: string;
    stagingSelections: { photoId: string; staging: boolean; style?: string }[];
    referenceFile?: File;
  }) => {
    if (!gallery || !user) return;

    setIsSubmitting(true);
    try {
      // 1. Insert feedback
      if (data.feedback.trim()) {
        const { error: feedbackError } = await supabase
          .from('gallery_feedback')
          .insert({
            gallery_id: gallery.id,
            author_user_id: user.id,
            message: data.feedback,
          });
        if (feedbackError) throw feedbackError;
      }

      // 2. Update photos with staging info
      for (const selection of data.stagingSelections) {
        if (selection.staging) {
          const { error: photoError } = await supabase
            .from('photos')
            .update({
              staging_requested: true,
              staging_style: selection.style,
            })
            .eq('id', selection.photoId);
          if (photoError) throw photoError;
        }
      }

      // 3. Upload reference image if provided
      if (data.referenceFile) {
        const fileExt = data.referenceFile.name.split('.').pop();
        const filePath = `${gallery.slug}/staging-ref-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(filePath, data.referenceFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('proofs')
          .getPublicUrl(filePath);

        // Store reference in staging_references table (for first selected photo with staging)
        const firstStagedPhoto = data.stagingSelections.find(s => s.staging);
        if (firstStagedPhoto) {
          const { error: refError } = await supabase
            .from('staging_references')
            .insert({
              photo_id: firstStagedPhoto.photoId,
              uploader_user_id: user.id,
              file_url: publicUrl,
            });
          if (refError) throw refError;
        }
      }

      // 4. Lock gallery and set status to Reviewed
      const { error: galleryError } = await supabase
        .from('galleries')
        .update({
          status: 'Reviewed',
          is_locked: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', gallery.id);

      if (galleryError) throw galleryError;

      // 5. Send webhook notification
      const { error: webhookError } = await supabase.functions.invoke('webhook-review', {
        body: { gallery_id: gallery.id },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }

      queryClient.invalidateQueries({ queryKey: ['client-gallery', slug] });
      queryClient.invalidateQueries({ queryKey: ['gallery-photos', gallery.id] });

      toast({
        title: 'Auswahl finalisiert!',
        description: 'Ihre Auswahl wurde dem Admin übermittelt.',
      });

      setShowFinalizeModals(false);
    } catch (error: any) {
      console.error('Finalization error:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{gallery.name}</h1>
            <p className="text-sm text-muted-foreground">Wählen Sie Ihre Lieblingsfotos</p>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>

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
                    Hat Kommentar
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
            <p className="text-muted-foreground">Noch keine Fotos hochgeladen</p>
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