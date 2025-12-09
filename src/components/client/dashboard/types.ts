import { LucideIcon } from 'lucide-react';
import { GallerySelectionStats } from '@/types/database';

export interface GalleryButtonConfig {
  label: string;
  icon: LucideIcon;
  disabled: boolean;
  variant?: 'outline' | 'default';
  action: () => void;
}

export interface GallerySections {
  activeGalleries: GallerySelectionStats[];
  closedGalleries: GallerySelectionStats[];
  completedGalleries: GallerySelectionStats[];
}

export interface ReopenModalState {
  galleryId: string | null;
  galleryName: string;
}

export interface DashboardModalsState {
  calculatorOpen: boolean;
  downloadsOpen: boolean;
  reopenModal: ReopenModalState;
}
