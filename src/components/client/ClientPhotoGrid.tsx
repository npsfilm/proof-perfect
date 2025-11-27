import { Photo } from '@/types/database';
import { Loader2 } from 'lucide-react';

interface ClientPhotoGridProps {
  photos?: Photo[];
  isLoading: boolean;
  onPhotoClick: (photoId: string) => void;
}

export function ClientPhotoGrid({ photos, isLoading, onPhotoClick }: ClientPhotoGridProps) {
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
          onClick={() => onPhotoClick(photo.id)}
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
  );
}
