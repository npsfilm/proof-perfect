import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";

interface BlueHourSliderProps {
  beforeImage?: string;
  afterImage?: string;
  title?: string;
}

export const BlueHourSlider = ({ beforeImage, afterImage, title }: BlueHourSliderProps) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  // Global mouse/touch move and up handlers for smooth dragging outside container
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      handleMove(e.clientX);
    };

    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove);
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [handleMove]);

  return (
    <Card className="w-full p-3 bg-card">
      {title && (
        <p className="text-sm font-medium text-foreground mb-2">{title}</p>
      )}
      <div
        ref={containerRef}
        className="relative aspect-[3/2] overflow-hidden rounded-xl cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Before - Daylight image or gradient */}
        {beforeImage ? (
          <img 
            src={beforeImage} 
            alt="Vorher" 
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-amber-50" />
        )}
        
        {/* After - Blue hour image or gradient with clip-path */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          {afterImage ? (
            <img 
              src={afterImage} 
              alt="Nachher" 
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-orange-600" />
          )}
        </div>

        {/* Draggable divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-5 bg-muted-foreground/50 rounded-full" />
              <div className="w-0.5 h-5 bg-muted-foreground/50 rounded-full" />
            </div>
          </div>
        </div>

        {/* Labels at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-3 pb-3 pointer-events-none">
          <span className="px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-semibold text-foreground uppercase tracking-wide">
            Vorher
          </span>
          <span className="px-3 py-1 bg-primary/80 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-foreground uppercase tracking-wide">
            Nachher
          </span>
        </div>
      </div>
    </Card>
  );
};
