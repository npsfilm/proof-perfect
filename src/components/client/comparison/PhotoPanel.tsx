import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PhotoPanelProps } from './types';
import watermarkLogo from '@/assets/immoonpoint-watermark.webp';

export function PhotoPanel({
  photo,
  signedUrl,
  photoIndex,
  totalPhotos,
  slot,
  onNavigate,
  onToggleSelection
}: PhotoPanelProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 relative">
      {/* Navigation */}
      <button
        onClick={() => onNavigate(slot, 'prev')}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        disabled={photoIndex === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => onNavigate(slot, 'next')}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        disabled={photoIndex === totalPhotos - 1}
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Image */}
      <div className="relative">
        <img
          src={signedUrl || photo.storage_url}
          alt={photo.filename}
          className="max-h-[55vh] max-w-full object-contain rounded-lg select-none"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        
        {/* Watermark */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <img 
            src={watermarkLogo} 
            alt="" 
            className="h-16 w-auto opacity-70 select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="text-white/50 text-xs">
          Foto {photoIndex + 1} von {totalPhotos}
        </div>
        <div className="text-white/70 text-sm">
          {photo.filename}
        </div>
        <Button
          variant={photo.is_selected ? "default" : "outline"}
          size="sm"
          onClick={() => onToggleSelection(photo.id)}
          className="mt-2"
        >
          {photo.is_selected ? (
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
  );
}
