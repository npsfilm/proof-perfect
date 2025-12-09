import { DeliveryDownloadSection } from '@/components/client/delivery/DeliveryDownloadSection';
import { AdminPreviewOverlay } from '@/components/client/AdminPreviewOverlay';
import { GalleryHeader } from './GalleryHeader';
import { DeliveredGalleryViewProps } from './types';

export function DeliveredGalleryView({
  gallery,
  photos,
  isSaving,
  lastSaved,
  isAdmin,
}: DeliveredGalleryViewProps) {
  const selectedCount = photos?.filter(p => p.is_selected).length || 0;
  const totalCount = photos?.length || 0;

  return (
    <div className="pb-12">
      <GalleryHeader
        name={gallery.name}
        address={gallery.address || null}
        isSaving={isSaving}
        lastSaved={lastSaved}
      />

      <main className="max-w-6xl mx-auto px-4 lg:px-6 xl:px-8 py-12">
        <DeliveryDownloadSection gallery={gallery} />
      </main>

      {isAdmin && (
        <AdminPreviewOverlay 
          gallery={gallery} 
          selectedCount={selectedCount}
          totalCount={totalCount}
        />
      )}
    </div>
  );
}
