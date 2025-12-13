import { PhotoPanel } from './PhotoPanel';
import { SplitViewProps } from './types';

export function SplitView({
  photo1,
  photo2,
  signedUrl1,
  signedUrl2,
  photos,
  onNavigate,
  onToggleSelection
}: SplitViewProps) {
  const photo1Index = photos.findIndex(p => p.id === photo1.id);
  const photo2Index = photos.findIndex(p => p.id === photo2.id);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden">
      <PhotoPanel
        photo={photo1}
        signedUrl={signedUrl1}
        photoIndex={photo1Index}
        totalPhotos={photos.length}
        slot={1}
        onNavigate={onNavigate}
        onToggleSelection={onToggleSelection}
      />

      {/* Divider */}
      <div className="w-px lg:w-1 bg-white/20" />

      <PhotoPanel
        photo={photo2}
        signedUrl={signedUrl2}
        photoIndex={photo2Index}
        totalPhotos={photos.length}
        slot={2}
        onNavigate={onNavigate}
        onToggleSelection={onToggleSelection}
      />
    </div>
  );
}
