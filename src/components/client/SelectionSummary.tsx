import { useState } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Photo } from '@/types/database';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';

interface SelectionSummaryProps {
  selectedPhotos: Photo[];
  onPhotoClick: (photoId: string) => void;
  onRemoveSelection: (photoId: string) => void;
  onFinalize: () => void;
  disabled?: boolean;
  targetCount: number;
}

export function SelectionSummary({ 
  selectedPhotos, 
  onPhotoClick,
  onRemoveSelection,
  onFinalize,
  disabled,
  targetCount
}: SelectionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { signedUrls } = useSignedPhotoUrls(selectedPhotos);

  if (selectedPhotos.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40 transition-all duration-300">
      {/* Header Bar */}
      <div className="px-4 py-4 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          <span className="font-medium">Ausgewählte Fotos</span>
          <Badge variant="secondary">
            {selectedPhotos.length}
          </Badge>
        </button>
        <Button 
          onClick={onFinalize}
          size="lg"
          disabled={selectedPhotos.length === 0 || disabled}
          className="whitespace-nowrap"
        >
          Auswahl abschließen
        </Button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <ScrollArea className="h-48 px-4 pb-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {selectedPhotos.map((photo) => {
              return (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer aspect-square rounded-md overflow-hidden border-2 border-primary"
                  onClick={() => onPhotoClick(photo.id)}
                >
                  <img
                    src={signedUrls[photo.id] || photo.storage_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveSelection(photo.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
