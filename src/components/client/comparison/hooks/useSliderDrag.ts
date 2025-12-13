import { useState, useRef, useEffect, useCallback, RefObject } from 'react';

interface UseSliderDragOptions {
  initialPosition?: number;
  minPosition?: number;
  maxPosition?: number;
}

interface UseSliderDragReturn {
  sliderPosition: number;
  isDragging: boolean;
  containerRef: RefObject<HTMLDivElement>;
  startDragging: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function useSliderDrag(options: UseSliderDragOptions = {}): UseSliderDragReturn {
  const { 
    initialPosition = 50, 
    minPosition = 5, 
    maxPosition = 95 
  } = options;
  
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(minPosition, Math.min(maxPosition, position)));
  }, [minPosition, maxPosition]);

  const startDragging = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
  }, [handleMove]);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      handleMove(clientX);
    };

    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  return { sliderPosition, isDragging, containerRef, startDragging };
}
