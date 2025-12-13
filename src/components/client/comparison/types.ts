import { Photo } from '@/types/database';

export interface ComparisonModeProps {
  photo1: Photo;
  photo2: Photo;
  photos: Photo[];
  onClose: () => void;
  onSwap: () => void;
  onNavigate: (slot: 1 | 2, direction: 'prev' | 'next') => void;
  onToggleSelection: (photoId: string) => void;
}

export interface PhotoPanelProps {
  photo: Photo;
  signedUrl: string | undefined;
  photoIndex: number;
  totalPhotos: number;
  slot: 1 | 2;
  onNavigate: (slot: 1 | 2, direction: 'prev' | 'next') => void;
  onToggleSelection: (photoId: string) => void;
}

export interface ComparisonHeaderProps {
  viewMode: 'split' | 'slider';
  onViewModeChange: (mode: 'split' | 'slider') => void;
  onSwap: () => void;
  onClose: () => void;
}

export interface SliderViewProps {
  photo1: Photo;
  photo2: Photo;
  signedUrl1: string | undefined;
  signedUrl2: string | undefined;
  photo1Index: number;
  photo2Index: number;
  totalPhotos: number;
  onToggleSelection: (photoId: string) => void;
}

export interface SplitViewProps {
  photo1: Photo;
  photo2: Photo;
  signedUrl1: string | undefined;
  signedUrl2: string | undefined;
  photos: Photo[];
  onNavigate: (slot: 1 | 2, direction: 'prev' | 'next') => void;
  onToggleSelection: (photoId: string) => void;
}
