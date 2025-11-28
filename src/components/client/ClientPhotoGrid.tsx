import { Photo } from '@/types/database';
import { Loader2, Check, RectangleVertical, RectangleHorizontal, Square } from 'lucide-react';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Orientation } from '@/hooks/usePhotoOrientations';

interface ClientPhotoGridProps {
  photos?: Photo[];
  isLoading: boolean;
  onPhotoClick: (photoId: string) => void;
  galleryId?: string;
  comparisonPhotos?: string[];
  isComparisonMode?: boolean;
  photoOrientations?: Record<string, Orientation>;
  allowedOrientation?: Orientation | null;
  onOrientationDetected?: (photoId: string, width: number, height: number) => void;
}

export function ClientPhotoGrid({ 
  photos, 
  isLoading, 
  onPhotoClick, 
  galleryId, 
  comparisonPhotos = [],
  isComparisonMode = false,
  photoOrientations = {},
  allowedOrientation = null,
  onOrientationDetected
}: ClientPhotoGridProps) {
  const { toggleSelection } = usePhotoSelection(galleryId);
  const { signedUrls, isLoading: urlsLoading } = useSignedPhotoUrls(photos);

  const handleCheckClick = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleSelection.mutate({ photoId: photo.id, currentState: photo.is_selected });
  };

  if (isLoading || urlsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Noch keine Fotos hochgeladen</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {photos.map((photo, index) => {
        const comparisonIndex = comparisonPhotos.indexOf(photo.id);
        const isInComparison = comparisonIndex !== -1;
        const orientation = photoOrientations[photo.id];
        const isDisabled = isComparisonMode && allowedOrientation && orientation && orientation !== allowedOrientation;
        
        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
          const img = e.currentTarget;
          onOrientationDetected?.(photo.id, img.naturalWidth, img.naturalHeight);
        };
        
        return (
          <div
            key={photo.id}
            className={`bg-card rounded-lg overflow-hidden shadow-neu-flat transition-all ${
              photo.is_selected 
                ? 'ring-2 ring-primary shadow-lg' 
                : isInComparison
                ? 'ring-2 ring-blue-500 shadow-lg'
                : 'hover:shadow-neu-float'
            } ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
          >
            {/* Image Container */}
            <div 
              className="relative bg-muted/30 cursor-pointer overflow-hidden h-64"
              onClick={() => !isDisabled && onPhotoClick(photo.id)}
            >
              <img
                src={signedUrls[photo.id] || photo.storage_url}
                alt={photo.filename}
                className="w-full h-full object-contain hover:scale-105 transition-transform"
                onLoad={handleImageLoad}
              />
              
              {/* Comparison Badge */}
              {isInComparison && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {comparisonIndex + 1}
                </div>
              )}
              
              {/* Orientation Badge - Only show in comparison mode */}
              {isComparisonMode && orientation && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  {orientation === 'portrait' ? (
                    <><RectangleVertical className="h-3 w-3" /> Hochformat</>
                  ) : orientation === 'landscape' ? (
                    <><RectangleHorizontal className="h-3 w-3" /> Querformat</>
                  ) : (
                    <><Square className="h-3 w-3" /> Quadratisch</>
                  )}
                </div>
              )}
              
              {/* Other Badges */}
              {!isComparisonMode && photo.client_comment && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Kommentar
                </div>
              )}
              {photo.staging_requested && (
                <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Staging
                </div>
              )}
            </div>

            {/* Footer with Photo Number and Checkmark */}
            <div className="flex items-center justify-between p-3 bg-card">
              <span className="text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <Button
                size="sm"
                variant={photo.is_selected ? 'default' : 'outline'}
                onClick={(e) => handleCheckClick(e, photo)}
                className="h-8 w-8 p-0 rounded-full"
                aria-label={photo.is_selected ? 'Deselektieren' : 'Auswählen'}
              >
                <Check className={`h-4 w-4 ${photo.is_selected ? '' : 'opacity-50'}`} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
