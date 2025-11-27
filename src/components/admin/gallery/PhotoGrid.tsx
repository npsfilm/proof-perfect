import { useState } from 'react';
import { Photo } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoGridProps {
  photos: Photo[];
  selectedPhotos: Set<string>;
  onPhotoToggle: (photoId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onReorder?: (photoId: string, newIndex: number) => void;
}

export function PhotoGrid({
  photos,
  selectedPhotos,
  onPhotoToggle,
  onSelectAll,
  onClearSelection,
  onReorder,
}: PhotoGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const allSelected = photos.length > 0 && selectedPhotos.size === photos.length;
  const someSelected = selectedPhotos.size > 0 && selectedPhotos.size < photos.length;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (onReorder) {
      const draggedPhoto = photos[draggedIndex];
      onReorder(draggedPhoto.id, dropIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {/* Header with select all */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all-photos"
            checked={allSelected ? true : someSelected ? 'indeterminate' : false}
            onCheckedChange={() => {
              if (allSelected || someSelected) {
                onClearSelection();
              } else {
                onSelectAll();
              }
            }}
          />
          <label
            htmlFor="select-all-photos"
            className="text-sm font-medium cursor-pointer"
          >
            {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
          </label>
        </div>

        {selectedPhotos.size > 0 && (
          <Badge variant="secondary">
            {selectedPhotos.size} von {photos.length} ausgewählt
          </Badge>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => {
          const isSelected = selectedPhotos.has(photo.id);
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={photo.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                'group relative aspect-square rounded-lg overflow-hidden border border-border transition-all cursor-move',
                isSelected && 'ring-2 ring-primary ring-offset-2',
                isDragging && 'opacity-50',
                isDragOver && 'ring-2 ring-accent'
              )}
            >
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                  <GripVertical className="h-4 w-4 text-foreground" />
                </div>
              </div>

              {/* Selection Checkbox */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-background/80 backdrop-blur-sm rounded p-1">
                  <Checkbox
                    id={`photo-${photo.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onPhotoToggle(photo.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Photo Image */}
              <img
                src={photo.storage_url}
                alt={photo.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Filename Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">{photo.filename}</p>
              </div>

              {/* Selection indicators */}
              {photo.is_selected && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Ausgewählt
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
