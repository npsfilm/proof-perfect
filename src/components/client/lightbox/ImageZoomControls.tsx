import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isMobile?: boolean;
}

export function ImageZoomControls({ 
  zoom, 
  onZoomIn, 
  onZoomOut, 
  onResetZoom,
  isMobile = false 
}: ImageZoomControlsProps) {
  if (isMobile) {
    return (
      <div className="lg:hidden absolute bottom-24 right-4 z-10 flex flex-col gap-2 bg-black/60 rounded-lg p-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomIn}
          className="text-white hover:text-white hover:bg-white/20"
          title="Vergrößern"
          disabled={zoom >= 5}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onZoomOut}
          className="text-white hover:text-white hover:bg-white/20"
          title="Verkleinern"
          disabled={zoom <= 1}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Desktop - only show reset when zoomed
  if (zoom <= 1) return null;

  return (
    <div className="absolute top-20 right-4 z-10 flex flex-col gap-2 bg-black/60 rounded-lg p-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={onResetZoom}
        className="text-white hover:text-white hover:bg-white/20"
        title="Zoom zurücksetzen"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
