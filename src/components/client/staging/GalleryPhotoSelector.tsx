import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Photo } from '@/types/database';

interface GalleryPhotoSelectorProps {
  photos: Photo[] | undefined;
  signedUrls: Record<string, string>;
  selectedPhotoIds: string[];
  currentPhotoIndex: number;
  onToggleSelection: (photoId: string) => void;
  onCurrentIndexChange: (index: number) => void;
}

export function GalleryPhotoSelector({
  photos,
  signedUrls,
  selectedPhotoIds,
  currentPhotoIndex,
  onToggleSelection,
  onCurrentIndexChange,
}: GalleryPhotoSelectorProps) {
  // Current selected photo for preview
  const currentPhoto = photos?.find(p => p.id === selectedPhotoIds[currentPhotoIndex]);
  const currentPhotoUrl = currentPhoto ? signedUrls[currentPhoto.id] : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Fotos auswählen</CardTitle>
          <span className="text-sm text-muted-foreground">
            {selectedPhotoIds.length} ausgewählt
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Preview */}
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt="Ausgewähltes Foto"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Foto auswählen</p>
            </div>
          )}
          
          {/* Navigation */}
          {selectedPhotoIds.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => onCurrentIndexChange(Math.max(0, currentPhotoIndex - 1))}
                disabled={currentPhotoIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                onClick={() => onCurrentIndexChange(Math.min(selectedPhotoIds.length - 1, currentPhotoIndex + 1))}
                disabled={currentPhotoIndex === selectedPhotoIds.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs">
                {currentPhotoIndex + 1} / {selectedPhotoIds.length}
              </div>
            </>
          )}
        </div>

        {/* Photo Thumbnails Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
          {photos?.map((photo) => {
            const url = signedUrls[photo.id];
            const isSelected = selectedPhotoIds.includes(photo.id);
            
            return (
              <button
                key={photo.id}
                type="button"
                onClick={() => onToggleSelection(photo.id)}
                className={cn(
                  'relative aspect-square rounded-md overflow-hidden border-2 transition-all',
                  isSelected 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-primary/30'
                )}
              >
                {url ? (
                  <img
                    src={url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted" />
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                      {selectedPhotoIds.indexOf(photo.id) + 1}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
