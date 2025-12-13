import { useCallback, RefObject } from 'react';
import { PendingAnnotation, ImageSize } from '../types';

interface AnnotationHandlerOptions {
  annotationMode: boolean;
  zoom: number;
  isDragging: boolean;
  setPendingAnnotation: (annotation: PendingAnnotation | null) => void;
}

interface AddAnnotationMutation {
  mutateAsync: (data: { x_position: number; y_position: number; comment: string }) => Promise<void>;
}

export function useAnnotationHandlers(
  imageRef: RefObject<HTMLImageElement | null>,
  addAnnotation: AddAnnotationMutation,
  options: AnnotationHandlerOptions
) {
  const { annotationMode, zoom, isDragging, setPendingAnnotation } = options;

  // Handle image click for adding annotations
  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!annotationMode || zoom > 1 || isDragging) return;
    
    e.stopPropagation();
    
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setPendingAnnotation({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [annotationMode, zoom, isDragging, imageRef, setPendingAnnotation]);

  // Save annotation with calculated percentage position
  const handleSaveAnnotation = useCallback(async (commentText: string, pendingAnnotation: PendingAnnotation | null) => {
    if (!pendingAnnotation || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (pendingAnnotation.x / rect.width) * 100;
    const y = (pendingAnnotation.y / rect.height) * 100;
    
    await addAnnotation.mutateAsync({
      x_position: Number(x.toFixed(2)),
      y_position: Number(y.toFixed(2)),
      comment: commentText,
    });
    
    setPendingAnnotation(null);
  }, [imageRef, addAnnotation, setPendingAnnotation]);

  // Cancel pending annotation
  const handleCancelAnnotation = useCallback(() => {
    setPendingAnnotation(null);
  }, [setPendingAnnotation]);

  return {
    handleImageClick,
    handleSaveAnnotation,
    handleCancelAnnotation,
  };
}
