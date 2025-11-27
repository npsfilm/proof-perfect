import { useState, useEffect } from 'react';
import { Photo } from '@/types/database';

export type Orientation = 'portrait' | 'landscape' | 'square' | 'unknown';

export function usePhotoOrientations(photos: Photo[] | undefined) {
  const [orientations, setOrientations] = useState<Record<string, Orientation>>({});

  const detectOrientation = (photoId: string, width: number, height: number) => {
    const ratio = width / height;
    let orientation: Orientation = 'square';
    
    if (ratio > 1.1) {
      orientation = 'landscape';
    } else if (ratio < 0.9) {
      orientation = 'portrait';
    }
    
    setOrientations(prev => ({ ...prev, [photoId]: orientation }));
  };

  return { orientations, detectOrientation };
}
