import { useState } from 'react';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Photo } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface SelectionSummaryProps {
  selectedPhotos: Photo[];
  onPhotoClick: (photoId: string) => void;
  onRemoveSelection: (photoId: string) => void;
}

export function SelectionSummary({ 
  selectedPhotos, 
  onPhotoClick,
  onRemoveSelection 
}: SelectionSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedPhotos.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-0 right-0 bg-card border-t border-border shadow-lg z-30 transition-all duration-300">
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
          <span className="font-medium">Ausgewählte Fotos</span>
          <Badge variant="secondary" className="ml-2">
            {selectedPhotos.length}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">
          {isExpanded ? 'Schließen' : 'Vorschau anzeigen'}
        </span>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <ScrollArea className="h-48 px-4 pb-4">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {selectedPhotos.map((photo) => {
              const imageUrl = supabase.storage
                .from('proofs')
                .getPublicUrl(photo.storage_url, {
                  transform: {
                    width: 150,
                    height: 150,
                    resize: 'cover',
                  },
                }).data.publicUrl;

              return (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer aspect-square rounded-md overflow-hidden border-2 border-primary"
                  onClick={() => onPhotoClick(photo.id)}
                >
                  <img
                    src={imageUrl}
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
