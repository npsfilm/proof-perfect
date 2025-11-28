import { useState, useRef } from 'react';

export function useImagePan(zoom: number) {
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const lastPanX = useRef(0);
  const lastPanY = useRef(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const resetPan = () => {
    setPanX(0);
    setPanY(0);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      lastPanX.current = panX;
      lastPanY.current = panY;
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && touchStartX.current && touchStartY.current) {
      const deltaX = e.clientX - touchStartX.current;
      const deltaY = e.clientY - touchStartY.current;
      setPanX(lastPanX.current + deltaX);
      setPanY(lastPanY.current + deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1 && isDragging) {
      const deltaX = e.touches[0].clientX - (touchStartX.current || 0);
      const deltaY = e.touches[0].clientY - (touchStartY.current || 0);
      setPanX(lastPanX.current + deltaX);
      setPanY(lastPanY.current + deltaY);
      e.preventDefault();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      lastPanX.current = panX;
      lastPanY.current = panY;
      if (zoom > 1) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return {
    panX,
    panY,
    isDragging,
    resetPan,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}
