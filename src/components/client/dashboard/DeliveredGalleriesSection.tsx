import { GallerySelectionStats } from '@/types/database';
import { GalleryHeroCard } from '@/components/client/GalleryHeroCard';
import { GalleryButtonConfig } from './types';

interface DeliveredGalleriesSectionProps {
  galleries: GallerySelectionStats[];
  coverPhotos: Record<string, { signed_url?: string }> | undefined;
  getButtonConfig: (status: string, slug: string, galleryId: string, name: string) => GalleryButtonConfig;
}

export function DeliveredGalleriesSection({
  galleries,
  coverPhotos,
  getButtonConfig,
}: DeliveredGalleriesSectionProps) {
  if (galleries.length === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="text-lg font-semibold text-muted-foreground">
        Geliefert ({galleries.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => {
          const buttonConfig = getButtonConfig(
            gallery.status || 'Delivered',
            gallery.slug || '',
            gallery.gallery_id || '',
            gallery.name || ''
          );

          const coverImageUrl = coverPhotos?.[gallery.gallery_id || '']?.signed_url;

          return (
            <GalleryHeroCard
              key={gallery.gallery_id}
              name={gallery.name || ''}
              status={gallery.status || 'Delivered'}
              photosCount={gallery.photos_count || 0}
              selectedCount={gallery.selected_count || 0}
              stagingCount={gallery.staging_count || 0}
              coverImageUrl={coverImageUrl}
              buttonLabel={buttonConfig.label}
              buttonIcon={buttonConfig.icon}
              buttonAction={buttonConfig.action}
              buttonDisabled={buttonConfig.disabled}
              buttonVariant={buttonConfig.variant}
              size="small"
            />
          );
        })}
      </div>
    </div>
  );
}
