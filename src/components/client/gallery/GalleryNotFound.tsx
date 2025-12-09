import { Button } from '@/components/ui/button';
import { GalleryNotFoundProps } from './types';

export function GalleryNotFound({ onNavigate }: GalleryNotFoundProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg text-muted-foreground mb-4">Galerie nicht gefunden</p>
        <Button onClick={onNavigate}>Zum Dashboard</Button>
      </div>
    </div>
  );
}
