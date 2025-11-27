import { Photo } from '@/types/database';
import { Loader2, Heart } from 'lucide-react';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';

interface ClientPhotoGridProps {
  photos?: Photo[];
  isLoading: boolean;
  onPhotoClick: (photoId: string) => void;
  galleryId?: string;
}

export function ClientPhotoGrid({ photos, isLoading, onPhotoClick, galleryId }: ClientPhotoGridProps) {
  const { toggleSelection } = usePhotoSelection(galleryId);

  const handleHeartClick = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleSelection.mutate({ photoId: photo.id, currentState: photo.is_selected });
  };

  if (isLoading) {
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className={`relative aspect-square rounded-lg overflow-hidden group border-2 transition-all ${
            photo.is_selected 
              ? 'border-primary shadow-md' 
              : 'border-transparent hover:border-muted'
          }`}
        >
          <img
            src={photo.storage_url}
            alt={photo.filename}
            className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform"
            onClick={() => onPhotoClick(photo.id)}
          />
          
          {/* Heart icon - always visible on hover or when selected */}
          <button
            onClick={(e) => handleHeartClick(e, photo)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
              photo.is_selected
                ? 'bg-primary text-primary-foreground'
                : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
            }`}
            aria-label={photo.is_selected ? 'Deselektieren' : 'Auswählen'}
          >
            <Heart
              className={`h-4 w-4 ${photo.is_selected ? 'fill-current' : ''}`}
            />
          </button>

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
  );
}
