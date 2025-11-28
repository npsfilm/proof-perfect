import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxNavigationProps {
  currentIndex: number;
  totalPhotos: number;
  isFullscreen: boolean;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function LightboxNavigation({
  currentIndex,
  totalPhotos,
  isFullscreen,
  onNavigate,
}: LightboxNavigationProps) {
  // Don't show navigation in fullscreen mode or on mobile
  if (isFullscreen) return null;

  return (
    <>
      {/* Previous button */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="hidden lg:block absolute left-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronLeft className="h-12 w-12" />
        </button>
      )}
      
      {/* Next button */}
      {currentIndex < totalPhotos - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="hidden lg:block absolute right-4 text-white hover:text-gray-300 z-10"
        >
          <ChevronRight className="h-12 w-12" />
        </button>
      )}
    </>
  );
}
