import { useState, useEffect, useRef } from 'react';
import { X, ArrowLeftRight, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/database';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrls';

interface ComparisonModeProps {
  photo1: Photo;
  photo2: Photo;
  photos: Photo[];
  onClose: () => void;
  onSwap: () => void;
  onNavigate: (slot: 1 | 2, direction: 'prev' | 'next') => void;
  onToggleSelection: (photoId: string) => void;
}

export function ComparisonMode({ 
  photo1, 
  photo2, 
  photos, 
  onClose, 
  onSwap, 
  onNavigate,
  onToggleSelection 
}: ComparisonModeProps) {
  const { signedUrl: signedUrl1 } = useSignedPhotoUrl(photo1);
  const { signedUrl: signedUrl2 } = useSignedPhotoUrl(photo2);
  const [viewMode, setViewMode] = useState<'split' | 'slider'>('split');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const photo1Index = photos.findIndex(p => p.id === photo1.id);
  const photo2Index = photos.findIndex(p => p.id === photo2.id);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
      const position = ((clientX - rect.left) / rect.width) * 100;
      
      setSliderPosition(Math.max(5, Math.min(95, position)));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Immediately update position on click/touch
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const position = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(5, Math.min(95, position)));
  };
  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white text-lg font-medium">Fotovergleich</h2>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
            <button 
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                viewMode === 'split' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
              }`}
            >
              Nebeneinander
            </button>
            <button 
              onClick={() => setViewMode('slider')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                viewMode === 'slider' ? 'bg-white text-black' : 'text-white hover:bg-white/20'
              }`}
            >
              Überblendung
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSwap}
            className="text-white hover:text-white hover:bg-white/20"
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Tauschen
          </Button>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'slider' ? (
        // Slider Overlay Mode
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
            
            {/* Top layer - Photo 1 (clipped using clip-path - NO RESIZING) */}
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

          {/* Selection controls for slider mode */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-white/70 text-sm mb-2">
                Foto {photo1Index + 1} von {photos.length}
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
                Foto {photo2Index + 1} von {photos.length}
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
      ) : (
        // Split View Mode
        <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden">
        {/* Photo 1 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 relative">
          {/* Navigation */}
          <button
            onClick={() => onNavigate(1, 'prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            disabled={photo1Index === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => onNavigate(1, 'next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            disabled={photo1Index === photos.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={signedUrl1 || photo1.storage_url}
            alt={photo1.filename}
            className="max-h-[55vh] max-w-full object-contain rounded-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />

          {/* Info */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-white/50 text-xs">
              Foto {photo1Index + 1} von {photos.length}
            </div>
            <div className="text-white/70 text-sm">
              {photo1.filename}
            </div>
            <Button
              variant={photo1.is_selected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleSelection(photo1.id)}
              className="mt-2"
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
        </div>

        {/* Divider */}
        <div className="w-px lg:w-1 bg-white/20" />

        {/* Photo 2 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 relative">
          {/* Navigation */}
          <button
            onClick={() => onNavigate(2, 'prev')}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            disabled={photo2Index === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={() => onNavigate(2, 'next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            disabled={photo2Index === photos.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image */}
          <img
            src={signedUrl2 || photo2.storage_url}
            alt={photo2.filename}
            className="max-h-[55vh] max-w-full object-contain rounded-lg select-none"
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />

          {/* Info */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-white/50 text-xs">
              Foto {photo2Index + 1} von {photos.length}
            </div>
            <div className="text-white/70 text-sm">
              {photo2.filename}
            </div>
            <Button
              variant={photo2.is_selected ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleSelection(photo2.id)}
              className="mt-2"
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
      )}

      {/* Instructions */}
      <div className="p-3 bg-black/50 text-center text-white/50 text-xs">
        {viewMode === 'slider' 
          ? 'Ziehen Sie den Schieberegler, um die Fotos zu vergleichen • ESC zum Schließen'
          : 'ESC zum Schließen • ← → zum Navigieren'}
      </div>
    </div>
  );
}
