import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Photo } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortablePhotoItemProps {
  photo: Photo;
  isSelected: boolean;
  onToggle: (photoId: string) => void;
}

export function SortablePhotoItem({ photo, isSelected, onToggle }: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative aspect-square rounded-lg overflow-hidden border border-border transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        isDragging && 'opacity-50 z-50'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-background/90 backdrop-blur-sm rounded p-1.5 shadow-neu-flat-sm">
          <GripVertical className="h-4 w-4 text-foreground" />
        </div>
      </div>

      {/* Selection Checkbox */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-background/90 backdrop-blur-sm rounded p-1.5 shadow-neu-flat-sm">
          <Checkbox
            id={`photo-${photo.id}`}
            checked={isSelected}
            onCheckedChange={() => onToggle(photo.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Photo Image */}
      <img
        src={photo.storage_url}
        alt={photo.filename}
        className="w-full h-full object-cover select-none"
        loading="lazy"
        draggable={false}
      />

      {/* Filename Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-xs text-white truncate font-medium">{photo.filename}</p>
      </div>

      {/* Selection Badge */}
      {photo.is_selected && (
        <div className="absolute bottom-2 left-2 z-10">
          <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
            Ausgewählt
          </Badge>
        </div>
      )}
    </div>
  );
}
