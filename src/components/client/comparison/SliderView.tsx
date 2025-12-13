import { ArrowLeftRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SliderViewProps } from './types';
import { useSliderDrag } from './hooks/useSliderDrag';
import watermarkLogo from '@/assets/immoonpoint-watermark.webp';

export function SliderView({
  photo1,
  photo2,
  signedUrl1,
  signedUrl2,
  photo1Index,
  photo2Index,
  totalPhotos,
  onToggleSelection
}: SliderViewProps) {
  const { sliderPosition, containerRef, startDragging } = useSliderDrag();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <div 
        ref={containerRef}
        className="relative max-w-5xl w-full max-h-[70vh] overflow-hidden rounded-lg cursor-ew-resize"
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      >
        {/* Bottom layer - Photo 2 (always full visible) */}
        <img
          src={signedUrl2 || photo2.storage_url}
          alt={photo2.filename}
          className="w-full h-auto max-h-[70vh] object-contain select-none"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        
        {/* Top layer - Photo 1 (clipped using clip-path) */}
        <img
          src={signedUrl1 || photo1.storage_url}
          alt={photo1.filename}
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{ 
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`
          }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        
        {/* Watermark */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <img 
            src={watermarkLogo} 
            alt="" 
            className="h-20 w-auto opacity-70 select-none"
            draggable={false}
          />
        </div>
        
        {/* Draggable Divider */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
            <ArrowLeftRight className="h-5 w-5 text-gray-600" />
          </div>
        </div>
        
        {/* Photo Labels */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {photo1.filename}
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
          {photo2.filename}
        </div>
      </div>

      {/* Selection controls */}
      <div className="flex justify-center gap-8 mt-6">
        <div className="text-center">
          <div className="text-white/70 text-sm mb-2">
            Foto {photo1Index + 1} von {totalPhotos}
          </div>
          <Button
            variant={photo1.is_selected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSelection(photo1.id)}
            className="bg-white/10 hover:bg-white/20"
          >
            {photo1.is_selected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Ausgewählt
              </>
            ) : (
              'Auswählen'
            )}
          </Button>
        </div>
        <div className="text-center">
          <div className="text-white/70 text-sm mb-2">
            Foto {photo2Index + 1} von {totalPhotos}
          </div>
          <Button
            variant={photo2.is_selected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleSelection(photo2.id)}
            className="bg-white/10 hover:bg-white/20"
          >
            {photo2.is_selected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Ausgewählt
              </>
            ) : (
              'Auswählen'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
