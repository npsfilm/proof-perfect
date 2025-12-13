import { useEffect, useCallback } from 'react';

interface KeyboardHandlersConfig {
  currentIndex: number;
  totalPhotos: number;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToggleSelection: () => void;
  onToggleKeyboardHints: () => void;
}

export function useKeyboardHandlers({
  currentIndex,
  totalPhotos,
  onClose,
  onNavigate,
  onToggleSelection,
  onToggleKeyboardHints,
}: KeyboardHandlersConfig) {
  // Toggle keyboard hints with '?' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        onToggleKeyboardHints();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onToggleKeyboardHints]);

  // Create keydown handler for the lightbox container
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate('prev');
    if (e.key === 'ArrowRight' && currentIndex < totalPhotos - 1) onNavigate('next');
    if (e.key === ' ') {
      e.preventDefault();
      onToggleSelection();
    }
  }, [currentIndex, totalPhotos, onClose, onNavigate, onToggleSelection]);

  return { handleKeyDown };
}
