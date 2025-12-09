import { SaveStatusIndicator } from '@/components/client/SaveStatusIndicator';
import { GalleryHeaderProps } from './types';

export function GalleryHeader({
  name,
  address,
  isSaving,
  lastSaved,
}: GalleryHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 lg:px-6 xl:px-8 py-4 border-b border-border">
      <div>
        <h2 className="text-xl font-semibold">{name}</h2>
        {address && <p className="text-sm text-muted-foreground">{address}</p>}
      </div>
      <SaveStatusIndicator isSaving={isSaving} lastSaved={lastSaved} />
    </div>
  );
}
