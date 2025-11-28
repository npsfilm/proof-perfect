import { useState } from 'react';
import { Photo } from '@/types/database';
import { Orientation } from './usePhotoOrientations';

interface UseComparisonModeProps {
  photos?: Photo[];
  orientations: Record<string, Orientation>;
  onToggleSelection: (photoId: string, currentState: boolean) => void;
}

export function useComparisonMode({ photos, orientations, onToggleSelection }: UseComparisonModeProps) {
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonPhotos, setComparisonPhotos] = useState<string[]>([]);
  const [firstComparisonOrientation, setFirstComparisonOrientation] = useState<Orientation | null>(null);
  const [showComparisonOverlay, setShowComparisonOverlay] = useState(false);

  const handlePhotoClick = (photoId: string, onNormalClick: (photoId: string) => void) => {
    // If in comparison mode, add to comparison
    if (isComparisonMode && comparisonPhotos.length < 2) {
      if (!comparisonPhotos.includes(photoId)) {
        const orientation = orientations[photoId];
        
        // First photo selection - set the orientation filter
        if (comparisonPhotos.length === 0) {
          setFirstComparisonOrientation(orientation);
          setComparisonPhotos([photoId]);
        } 
        // Second photo - only allow if same orientation
        else if (orientation === firstComparisonOrientation) {
          setComparisonPhotos([...comparisonPhotos, photoId]);
          // DON'T auto-open comparison - wait for button click
        }
      }
    } else {
      onNormalClick(photoId);
    }
  };

  const handleComparisonToggle = () => {
    if (isComparisonMode) {
      // Exit comparison mode
      setIsComparisonMode(false);
      setComparisonPhotos([]);
      setFirstComparisonOrientation(null);
      setShowComparisonOverlay(false);
    } else {
      // Enter comparison mode
      setIsComparisonMode(true);
      setComparisonPhotos([]);
      setFirstComparisonOrientation(null);
      setShowComparisonOverlay(false);
    }
  };

  const handleStartComparison = () => {
    if (comparisonPhotos.length === 2) {
      setShowComparisonOverlay(true);
    }
  };

  const handleComparisonNavigate = (slot: 1 | 2, direction: 'prev' | 'next', filteredPhotos?: Photo[]) => {
    if (!filteredPhotos) return;
    
    const currentPhotoId = comparisonPhotos[slot - 1];
    const currentIndex = filteredPhotos.findIndex(p => p.id === currentPhotoId);
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(filteredPhotos.length - 1, currentIndex + 1);
    }
    
    const newPhotoId = filteredPhotos[newIndex].id;
    setComparisonPhotos(prev => 
      slot === 1 ? [newPhotoId, prev[1]] : [prev[0], newPhotoId]
    );
  };

  const handleComparisonSwap = () => {
    setComparisonPhotos([comparisonPhotos[1], comparisonPhotos[0]]);
  };

  const handleCloseComparison = () => {
    setShowComparisonOverlay(false);
    setComparisonPhotos([]);
    setFirstComparisonOrientation(null);
    setIsComparisonMode(false);
  };

  const handleToggleSelectionInComparison = (photoId: string) => {
    const photo = photos?.find(p => p.id === photoId);
    if (photo) {
      onToggleSelection(photoId, photo.is_selected);
    }
  };

  return {
    isComparisonMode,
    comparisonPhotos,
    firstComparisonOrientation,
    showComparisonOverlay,
    handlePhotoClick,
    handleComparisonToggle,
    handleStartComparison,
    handleComparisonNavigate,
    handleComparisonSwap,
    handleCloseComparison,
    handleToggleSelectionInComparison,
  };
}
