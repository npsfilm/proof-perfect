import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PhotoUploader } from '@/components/admin/PhotoUploader';
import { Photo } from '@/types/database';

interface GalleryPhotosSectionProps {
  galleryId: string;
  gallerySlug: string;
  photos?: Photo[];
  onUploadComplete: () => void;
}

export function GalleryPhotosSection({ galleryId, gallerySlug, photos, onUploadComplete }: GalleryPhotosSectionProps) {
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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={photo.storage_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
