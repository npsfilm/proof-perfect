import { useRef, useState, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Photo } from '@/types/database';
import { Loader2 } from 'lucide-react';
import { usePhotoSelection } from '@/hooks/usePhotoSelection';
import { Orientation } from '@/hooks/usePhotoOrientations';
import { PhotoCard } from './PhotoCard';

interface VirtualizedPhotoGridProps {
  photos?: Photo[];
  isLoading: boolean;
  onPhotoClick: (photoId: string) => void;
  galleryId?: string;
  signedUrls: Record<string, string>;
  comparisonPhotos?: string[];
  isComparisonMode?: boolean;
  photoOrientations?: Record<string, Orientation>;
  allowedOrientation?: Orientation | null;
  onOrientationDetected?: (photoId: string, width: number, height: number) => void;
}

export function VirtualizedPhotoGrid({ 
  photos, 
  isLoading, 
  onPhotoClick, 
  galleryId,
  signedUrls,
  comparisonPhotos = [],
  isComparisonMode = false,
  photoOrientations = {},
  allowedOrientation = null,
  onOrientationDetected
}: VirtualizedPhotoGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const { toggleSelection } = usePhotoSelection(galleryId);

  // Calculate responsive column count
  const columnCount = useMemo(() => {
    if (containerWidth === 0) return 1; // Default before measurement
    if (containerWidth < 640) return 1;      // mobile
    if (containerWidth < 768) return 2;      // sm
    if (containerWidth < 1024) return 3;     // md
    if (containerWidth < 1280) return 4;     // lg
    return 5;                                 // xl+
  }, [containerWidth]);

  // Calculate item dimensions
  const gap = 16; // 4 * 4px = 16px gap
  const itemWidth = useMemo(() => {
    if (containerWidth === 0) return 300; // Default
    return (containerWidth - (gap * (columnCount - 1))) / columnCount;
  }, [containerWidth, columnCount]);
  
  const itemHeight = useMemo(() => {
    return (itemWidth * 3/4) + 56; // 4:3 aspect + 56px footer
  }, [itemWidth]);

  // Total rows needed
  const rowCount = useMemo(() => {
    if (!photos || photos.length === 0) return 0;
    return Math.ceil(photos.length / columnCount);
  }, [photos, columnCount]);

  // Setup virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight + gap,
    overscan: 3, // Render 3 extra rows above/below viewport
  });

  // ResizeObserver for responsive behavior
  useEffect(() => {
    if (!parentRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    
    observer.observe(parentRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleCheckClick = (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    toggleSelection.mutate({ photoId: photo.id, currentState: photo.is_selected });
  };

  const handleImageLoad = (photoId: string) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    onOrientationDetected?.(photoId, img.naturalWidth, img.naturalHeight);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Noch keine Fotos hochgeladen</p>
      </div>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-[calc(100vh-280px)] overflow-auto"
      style={{ width: '100%' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          // Calculate which photos belong to this row
          const startIndex = virtualRow.index * columnCount;
          const rowPhotos = photos.slice(startIndex, startIndex + columnCount);
          
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${itemHeight}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex gap-4"
            >
              {rowPhotos.map((photo, colIndex) => {
                const globalIndex = startIndex + colIndex;
                const comparisonIndex = comparisonPhotos.indexOf(photo.id);
                const orientation = photoOrientations[photo.id];
                
                return (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={globalIndex}
                    width={itemWidth}
                    signedUrl={signedUrls[photo.id] || photo.storage_url}
                    isComparisonMode={isComparisonMode}
                    comparisonIndex={comparisonIndex}
                    orientation={orientation}
                    allowedOrientation={allowedOrientation}
                    onClick={() => onPhotoClick(photo.id)}
                    onCheckClick={handleCheckClick}
                    onImageLoad={handleImageLoad(photo.id)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
