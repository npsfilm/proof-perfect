import { X, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/database';

interface ComparisonModeProps {
  photo1: Photo;
  photo2: Photo;
  onClose: () => void;
  onSwap: () => void;
}

export function ComparisonMode({ photo1, photo2, onClose, onSwap }: ComparisonModeProps) {
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

      {/* Split View */}
      <div className="flex-1 flex flex-col lg:flex-row gap-1">
        {/* Photo 1 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-4">
          <img
            src={photo1.storage_url}
            alt={photo1.filename}
            className="max-w-full max-h-full object-contain"
          />
          <div className="mt-2 text-white/70 text-sm">
            {photo1.filename}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px lg:w-1 bg-white/20" />

        {/* Photo 2 */}
        <div className="flex-1 flex flex-col items-center justify-center bg-black p-4">
          <img
            src={photo2.storage_url}
            alt={photo2.filename}
            className="max-w-full max-h-full object-contain"
          />
          <div className="mt-2 text-white/70 text-sm">
            {photo2.filename}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-black/50 text-center text-white/50 text-xs">
        Drücken Sie ESC zum Schließen • Klicken Sie "Tauschen" um die Seiten zu wechseln
      </div>
    </div>
  );
}
