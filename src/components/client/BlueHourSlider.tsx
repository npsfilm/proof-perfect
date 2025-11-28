import { useState, useRef } from "react";

export const BlueHourSlider = () => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="mt-3 w-full">
      <div
        ref={containerRef}
        className="relative h-20 overflow-hidden rounded-xl cursor-ew-resize select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
      >
        {/* Before - Daylight gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-200 via-blue-100 to-amber-50" />
        
        {/* After - Blue hour gradient with clip-path */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-orange-600"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        />

        {/* Vorher Label */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-700 uppercase tracking-wide pointer-events-none">
          Vorher
        </div>

        {/* Nachher Label */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-white uppercase tracking-wide pointer-events-none">
          Nachher
        </div>

        {/* Draggable divider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto cursor-ew-resize">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
              <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Ziehen Sie den Regler, um den Effekt zu sehen
      </p>
    </div>
  );
};
