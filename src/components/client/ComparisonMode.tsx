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

  const photo1Index = photos.findIndex(p => p.id === photo1.id);
  const photo2Index = photos.findIndex(p => p.id === photo2.id);
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
            className="max-h-[55vh] max-w-full object-contain rounded-lg"
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
            className="max-h-[55vh] max-w-full object-contain rounded-lg"
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

      {/* Instructions */}
      <div className="p-3 bg-black/50 text-center text-white/50 text-xs">
        ESC zum Schließen • ← → zum Navigieren • Leertaste zum Auswählen
      </div>
    </div>
  );
}
