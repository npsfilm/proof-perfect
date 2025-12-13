import { useRef, useCallback } from 'react';

interface TouchGesturesConfig {
  zoom: number;
  isFullscreen: boolean;
  currentIndex: number;
  totalPhotos: number;
  isDragging: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
  onClose: () => void;
  panHandlers: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  zoomHandlers: {
    handlePinchStart: (touches: React.TouchList) => void;
    handlePinchMove: (touches: React.TouchList) => boolean;
    handlePinchEnd: () => void;
  };
}

export function useTouchGestures({
  zoom,
  isFullscreen,
  currentIndex,
  totalPhotos,
  isDragging,
  onNavigate,
  onClose,
  panHandlers,
  zoomHandlers,
}: TouchGesturesConfig) {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      zoomHandlers.handlePinchStart(e.touches);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      panHandlers.onTouchStart(e);
    }
  }, [zoomHandlers, panHandlers]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const isPinching = zoomHandlers.handlePinchMove(e.touches);
    if (isPinching) {
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Handle pan if zoomed, otherwise track for swipe
      if (zoom > 1 && isDragging) {
        panHandlers.onTouchMove(e);
      }
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    }
  }, [zoom, isDragging, zoomHandlers, panHandlers]);

  const handleTouchEnd = useCallback(() => {
    zoomHandlers.handlePinchEnd();
    panHandlers.onTouchEnd();

    // Only handle swipe if not zoomed
    if (zoom <= 1 && touchStartX.current && touchEndX.current && touchStartY.current && touchEndY.current) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 50;

      // Vertical swipe down to close (only if in fullscreen mode on mobile)
      if (Math.abs(diffY) > Math.abs(diffX) && diffY < -minSwipeDistance && isFullscreen) {
        onClose();
      }
      // Horizontal swipe for navigation
      else if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0 && currentIndex < totalPhotos - 1) {
          onNavigate('next');
        } else if (diffX < 0 && currentIndex > 0) {
          onNavigate('prev');
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  }, [zoom, isFullscreen, currentIndex, totalPhotos, onNavigate, onClose, zoomHandlers, panHandlers]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
