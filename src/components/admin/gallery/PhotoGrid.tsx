import { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Photo } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { SortablePhotoItem } from './SortablePhotoItem';
import { useState } from 'react';

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allSelected = photos.length > 0 && selectedPhotos.size === photos.length;
  const someSelected = selectedPhotos.size > 0 && selectedPhotos.size < photos.length;

  // Memoize photo IDs for SortableContext
  const photoIds = useMemo(() => photos.map((photo) => photo.id), [photos]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = photos.findIndex((photo) => photo.id === active.id);
      const newIndex = photos.findIndex((photo) => photo.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Call the reorder callback with the photo id and new index
        onReorder(active.id as string, newIndex);
      }
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find the active photo for the drag overlay
  const activePhoto = useMemo(
    () => photos.find((photo) => photo.id === activeId),
    [activeId, photos]
  );

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

      {/* Photo Grid with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={photoIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo) => (
              <SortablePhotoItem
                key={photo.id}
                photo={photo}
                isSelected={selectedPhotos.has(photo.id)}
                onToggle={onPhotoToggle}
              />
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay - Shows a ghost of the dragged item */}
        <DragOverlay>
          {activePhoto ? (
            <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary shadow-2xl opacity-90 rotate-3 scale-105">
              <img
                src={activePhoto.storage_url}
                alt={activePhoto.filename}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
