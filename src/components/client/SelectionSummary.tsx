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
      <div className="px-3 md:px-4 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity min-w-0"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" /> : <ChevronUp className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />}
          <span className="font-medium text-sm md:text-base truncate">Ausgewählt</span>
          <Badge variant="secondary" className="flex-shrink-0">
            {selectedPhotos.length}
          </Badge>
        </button>
        <Button 
          onClick={onFinalize}
          size="default"
          disabled={selectedPhotos.length === 0 || disabled}
          className="whitespace-nowrap text-sm md:text-base px-3 md:px-4"
        >
          <span className="hidden sm:inline">Auswahl abschließen</span>
          <span className="sm:hidden">Abschließen</span>
        </Button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="animate-accordion-down overflow-hidden">
          <ScrollArea className="h-48 md:h-72 px-3 md:px-4 pb-3 md:pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {selectedPhotos.map((photo) => {
                return (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer aspect-[3/2] rounded-md overflow-hidden border-2 border-primary"
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
        </div>
      )}
    </div>
  );
}
