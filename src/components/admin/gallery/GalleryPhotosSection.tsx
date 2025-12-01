import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhotoUploader } from '@/components/admin/PhotoUploader';
import { PhotoGrid } from '@/components/admin/gallery/PhotoGrid';
import { PhotoBatchActions } from '@/components/admin/gallery/PhotoBatchActions';
import { useBatchPhotoOperations } from '@/hooks/useBatchPhotoOperations';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { Photo } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface GalleryPhotosSectionProps {
  galleryId: string;
  gallerySlug: string;
  photos?: Photo[];
  onUploadComplete: () => void;
}

export function GalleryPhotosSection({ galleryId, gallerySlug, photos, onUploadComplete }: GalleryPhotosSectionProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const { deletePhotos, reorderPhotos } = useBatchPhotoOperations(galleryId);
  const { signedUrls } = useSignedPhotoUrls(photos);
  const { toast } = useToast();

  const handlePhotoToggle = (photoId: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoId)) {
      newSelection.delete(photoId);
    } else {
      newSelection.add(photoId);
    }
    setSelectedPhotos(newSelection);
  };

  const handleSelectAll = () => {
    if (!photos) return;
    setSelectedPhotos(new Set(photos.map(p => p.id)));
  };

  const handleClearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const handleDelete = async () => {
    if (selectedPhotos.size === 0) return;
    await deletePhotos.mutateAsync({
      photoIds: Array.from(selectedPhotos),
      gallerySlug,
    });
    setSelectedPhotos(new Set());
  };

  const handleDownload = () => {
    if (!photos || selectedPhotos.size === 0) return;

    const selectedPhotoData = photos.filter(p => selectedPhotos.has(p.id));
    const filenames = selectedPhotoData.map(p => p.filename).join(' ');

    navigator.clipboard.writeText(filenames);
    toast({
      title: 'Dateinamen kopiert',
      description: `${selectedPhotos.size} Dateinamen in die Zwischenablage kopiert.`,
    });
  };

  const handleReorder = (photoId: string, newIndex: number) => {
    if (!photos) return;

    // Calculate new order values for affected photos
    const updates = photos.map((photo, index) => {
      if (photo.id === photoId) {
        return { photoId: photo.id, newOrder: newIndex + 1 };
      }
      return { photoId: photo.id, newOrder: index + 1 };
    });

    reorderPhotos.mutate(updates);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Fotos hochladen</CardTitle>
          <CardDescription>Fotos per Drag & Drop ablegen oder klicken zum Durchsuchen</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            galleryId={galleryId}
            gallerySlug={gallerySlug}
            onUploadComplete={onUploadComplete}
          />
        </CardContent>
      </Card>

      {photos && photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos ({photos.length})</CardTitle>
            <CardDescription>
              Klicke und ziehe Fotos zum Neuanordnen. Wähle mehrere aus für Batch-Aktionen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhotoGrid
              photos={photos}
              signedUrls={signedUrls}
              selectedPhotos={selectedPhotos}
              onPhotoToggle={handlePhotoToggle}
              onSelectAll={handleSelectAll}
              onClearSelection={handleClearSelection}
              onReorder={handleReorder}
            />
          </CardContent>
        </Card>
      )}

      <PhotoBatchActions
        selectedCount={selectedPhotos.size}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onClearSelection={handleClearSelection}
        isDeleting={deletePhotos.isPending}
      />
    </>
  );
}
