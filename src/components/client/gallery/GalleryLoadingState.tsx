import { Loader2 } from 'lucide-react';
import { GalleryLoadingStateProps } from './types';

export function GalleryLoadingState({ message }: GalleryLoadingStateProps) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && <span className="ml-3 text-muted-foreground">{message}</span>}
    </div>
  );
}
