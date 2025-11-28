import { useEffect } from 'react';
import { Photo } from '@/types/database';

interface UseKeyboardNavigationProps {
  photos?: Photo[];
  selectedPhotoId: string | null;
  onSetSelectedPhotoId: (photoId: string | null) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}

export function useKeyboardNavigation({
  photos,
  selectedPhotoId,
  onSetSelectedPhotoId,
  onNavigate,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!photos || photos.length === 0) return;
      
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (selectedPhotoId) {
          onNavigate('prev');
        } else {
          // Navigate to last photo if no photo selected
          onSetSelectedPhotoId(photos[photos.length - 1].id);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedPhotoId) {
          onNavigate('next');
        } else {
          // Navigate to first photo if no photo selected
          onSetSelectedPhotoId(photos[0].id);
        }
      } else if (e.key === 'Escape' && selectedPhotoId) {
        e.preventDefault();
        onSetSelectedPhotoId(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [photos, selectedPhotoId, onSetSelectedPhotoId, onNavigate]);
}
