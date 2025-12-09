import { Photo, Gallery } from '@/types/database';

export type Orientation = 'portrait' | 'landscape' | 'square' | 'unknown' | null;

export interface GalleryHeaderProps {
  name: string;
  address: string | null;
  isSaving: boolean;
  lastSaved: Date | null;
}

export interface ComparisonModeInstructionsProps {
  comparisonPhotos: string[];
  firstComparisonOrientation: Orientation;
  onStartComparison: () => void;
  onCancel: () => void;
}

export interface GalleryLoadingStateProps {
  message?: string;
}

export interface GalleryNotFoundProps {
  onNavigate: () => void;
}

export interface GalleryLockedProps {
  onNavigate: () => void;
}

export interface DeliveredGalleryViewProps {
  gallery: Gallery;
  photos: Photo[] | undefined;
  isSaving: boolean;
  lastSaved: Date | null;
  isAdmin: boolean;
}
