import { useMemo, useEffect } from 'react';
import { Photo } from '@/types/database';

export function useLightboxNavigation(
  photos: Photo[],
  currentPhotoId: string,
  signedUrls: Record<string, string>
) {
  // Calculate current index
  const currentIndex = useMemo(
    () => photos.findIndex(p => p.id === currentPhotoId),
    [photos, currentPhotoId]
  );

  // Navigation availability
  const canGoNext = currentIndex < photos.length - 1;
  const canGoPrev = currentIndex > 0;

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    const preloadIndices: number[] = [];
    
    // Preload next 2 images
    if (currentIndex + 1 < photos.length) preloadIndices.push(currentIndex + 1);
    if (currentIndex + 2 < photos.length) preloadIndices.push(currentIndex + 2);
    
    // Preload previous 2 images
    if (currentIndex - 1 >= 0) preloadIndices.push(currentIndex - 1);
    if (currentIndex - 2 >= 0) preloadIndices.push(currentIndex - 2);
    
    // Preload images by creating Image elements
    preloadIndices.forEach(index => {
      const photoToPreload = photos[index];
      const url = signedUrls[photoToPreload.id] || photoToPreload.storage_url;
      const img = new Image();
      img.src = url;
    });
  }, [currentPhotoId, photos, signedUrls, currentIndex]);

  return {
    currentIndex,
    canGoNext,
    canGoPrev,
    totalPhotos: photos.length,
  };
}
