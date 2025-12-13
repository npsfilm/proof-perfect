import { useState } from 'react';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrls';
import { useAnsprache } from '@/contexts/AnspracheContext';
import { ComparisonModeProps } from './types';
import { ComparisonHeader } from './ComparisonHeader';
import { SliderView } from './SliderView';
import { SplitView } from './SplitView';

export function ComparisonMode({ 
  photo1, 
  photo2, 
  photos, 
  onClose, 
  onSwap, 
  onNavigate,
  onToggleSelection 
}: ComparisonModeProps) {
  const { t } = useAnsprache();
  const { signedUrl: signedUrl1 } = useSignedPhotoUrl(photo1);
  const { signedUrl: signedUrl2 } = useSignedPhotoUrl(photo2);
  const [viewMode, setViewMode] = useState<'split' | 'slider'>('split');

  const photo1Index = photos.findIndex(p => p.id === photo1.id);
  const photo2Index = photos.findIndex(p => p.id === photo2.id);

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={0}
    >
      <ComparisonHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSwap={onSwap}
        onClose={onClose}
      />

      {viewMode === 'slider' ? (
        <SliderView
          photo1={photo1}
          photo2={photo2}
          signedUrl1={signedUrl1}
          signedUrl2={signedUrl2}
          photo1Index={photo1Index}
          photo2Index={photo2Index}
          totalPhotos={photos.length}
          onToggleSelection={onToggleSelection}
        />
      ) : (
        <SplitView
          photo1={photo1}
          photo2={photo2}
          signedUrl1={signedUrl1}
          signedUrl2={signedUrl2}
          photos={photos}
          onNavigate={onNavigate}
          onToggleSelection={onToggleSelection}
        />
      )}

      {/* Instructions */}
      <div className="p-3 bg-black/50 text-center text-white/50 text-xs">
        {viewMode === 'slider' 
          ? t('Ziehe den Schieberegler, um die Fotos zu vergleichen • ESC zum Schließen', 'Ziehen Sie den Schieberegler, um die Fotos zu vergleichen • ESC zum Schließen')
          : 'ESC zum Schließen • ← → zum Navigieren'}
      </div>
    </div>
  );
}
