import { useState, useEffect } from 'react';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { LoadingState } from '@/components/ui/loading-state';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface StagingPhotoGridProps {
  galleryId: string;
  selectedPhotoIds: string[];
  onSelectionChange: (photoIds: string[]) => void;
}

export function StagingPhotoGrid({
  galleryId,
  selectedPhotoIds,
  onSelectionChange,
}: StagingPhotoGridProps) {
  const { data: photos, isLoading } = useGalleryPhotos(galleryId);
  const { signedUrls } = useSignedPhotoUrls(photos || []);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoadedImages(new Set());
  }, [galleryId]);

  if (isLoading) {
    return <LoadingState message="Fotos werden geladen..." />;
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Keine Fotos in dieser Galerie</p>
      </div>
    );
  }

  const handleTogglePhoto = (photoId: string) => {
    if (selectedPhotoIds.includes(photoId)) {
      onSelectionChange(selectedPhotoIds.filter((id) => id !== photoId));
    } else {
      onSelectionChange([...selectedPhotoIds, photoId]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(photos.map((p) => p.id));
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          Alle auswählen
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectNone}
        >
          Keine
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotoIds.includes(photo.id);
          const signedUrl = signedUrls[photo.id];
          const isLoaded = loadedImages.has(photo.id);

          return (
            <div
              key={photo.id}
              className={`relative group cursor-pointer rounded-xl overflow-hidden shadow-neu-flat hover:shadow-neu-float transition-shadow ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleTogglePhoto(photo.id)}
            >
              <div className="aspect-[4/3] bg-muted/30 relative">
                {!isLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
                {signedUrl && (
                  <img
                    src={signedUrl}
                    alt={photo.filename}
                    className={`w-full h-full object-contain transition-opacity ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setLoadedImages(prev => new Set(prev).add(photo.id))}
                    draggable={false}
                  />
                )}

                {/* Photo number */}
                <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  {index + 1}
                </div>

                {/* Checkbox */}
                <div className="absolute top-2 right-2">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => handleTogglePhoto(photo.id)}
                    className="h-6 w-6 bg-background/90 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
