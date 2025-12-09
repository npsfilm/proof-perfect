import { GallerySelectionStats } from '@/types/database';
import { GalleryCompactCard } from '@/components/client/GalleryCompactCard';
import { GalleryButtonConfig } from './types';

interface ClosedGalleriesSectionProps {
  galleries: GallerySelectionStats[];
  getButtonConfig: (status: string, slug: string, galleryId: string, name: string) => GalleryButtonConfig;
  isNewGallery: (createdAt: string | null) => boolean;
}

export function ClosedGalleriesSection({
  galleries,
  getButtonConfig,
  isNewGallery,
}: ClosedGalleriesSectionProps) {
  if (galleries.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <h3 className="text-lg font-semibold text-muted-foreground">
        Abgeschlossen ({galleries.length})
      </h3>
      
      <div className="space-y-2">
        {galleries.map((gallery) => {
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
  );
}
