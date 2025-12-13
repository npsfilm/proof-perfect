import { Photo, PhotoAnnotation } from '@/types/database';

// Pending annotation state when user clicks to add marker
export interface PendingAnnotation {
  x: number;
  y: number;
}

// Image container dimensions for annotation positioning
export interface ImageSize {
  width: number;
  height: number;
}

// Centralized lightbox UI state
export interface LightboxState {
  // UI visibility
  showKeyboardHints: boolean;
  showBottomSheet: boolean;
  isFullscreen: boolean;
  showDrawingCanvas: boolean;
  
  // Annotation mode
  annotationMode: boolean;
  pendingAnnotation: PendingAnnotation | null;
  
  // Form state synced with photo
  comment: string;
  stagingRequested: boolean;
  stagingStyle: string;
  
  // Computed/derived
  imageContainerSize: ImageSize;
  currentUserId: string | null;
}

// Actions to modify lightbox state
export interface LightboxActions {
  setShowKeyboardHints: (show: boolean) => void;
  setShowBottomSheet: (show: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setShowDrawingCanvas: (show: boolean) => void;
  setAnnotationMode: (mode: boolean) => void;
  setPendingAnnotation: (annotation: PendingAnnotation | null) => void;
  setComment: (comment: string) => void;
  setStagingRequested: (requested: boolean) => void;
  setStagingStyle: (style: string) => void;
  setImageContainerSize: (size: ImageSize) => void;
  toggleAnnotationMode: () => void;
  toggleFullscreen: () => void;
}

// Props for PhotoLightbox component
export interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  galleryId: string;
  signedUrls: Record<string, string>;
}

// Props for LightboxImage component
export interface LightboxImageProps {
  photo: Photo;
  signedUrl: string;
  zoom: number;
  panX: number;
  panY: number;
  isDragging: boolean;
  isFullscreen: boolean;
  annotationMode: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  drawingAnnotation: PhotoAnnotation | undefined;
  markerAnnotations: PhotoAnnotation[];
  pendingAnnotation: PendingAnnotation | null;
  currentUserId: string | null;
  imageContainerSize: ImageSize;
  showDrawingCanvas: boolean;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onWheel: (e: React.WheelEvent) => void;
  onImageLoad: () => void;
  onSaveAnnotation: (comment: string) => Promise<void>;
  onCancelAnnotation: () => void;
  onDeleteAnnotation: (id: string) => Promise<void>;
  panHandlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
}

// Props for LightboxDesktopControls component
export interface LightboxDesktopControlsProps {
  photo: Photo;
  currentIndex: number;
  totalPhotos: number;
  comment: string;
  stagingRequested: boolean;
  stagingStyle: string;
  annotationMode: boolean;
  drawingAnnotation: PhotoAnnotation | undefined;
  markerAnnotations: PhotoAnnotation[];
  imageRef: React.RefObject<HTMLImageElement>;
  onToggleSelection: () => void;
  onCommentChange: (comment: string) => void;
  onCommentBlur: () => void;
  onStagingToggle: (checked: boolean) => void;
  onStagingStyleChange: (style: string) => void;
  onAnnotationModeToggle: () => void;
  onOpenDrawingCanvas: () => void;
  onSetImageContainerSize: (size: ImageSize) => void;
}

// Props for LightboxTopBar component
export interface LightboxTopBarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose: () => void;
}
