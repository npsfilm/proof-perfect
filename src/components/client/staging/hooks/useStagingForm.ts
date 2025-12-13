import { useState, useCallback } from 'react';

interface UseStagingFormReturn {
  // Gallery & Photo State
  selectedGalleryId: string;
  setSelectedGalleryId: (id: string) => void;
  selectedPhotoIds: string[];
  togglePhotoSelection: (id: string) => void;
  clearSelection: () => void;
  currentPhotoIndex: number;
  setCurrentPhotoIndex: (index: number) => void;
  
  // Configuration State
  roomType: string | null;
  setRoomType: (type: string | null) => void;
  stagingStyle: string | null;
  setStagingStyle: (style: string | null) => void;
  removeFurniture: boolean;
  setRemoveFurniture: (value: boolean) => void;
  addFurniture: boolean;
  setAddFurniture: (value: boolean) => void;
  enhancePhoto: boolean;
  setEnhancePhoto: (value: boolean) => void;
  
  // Reference & Notes
  notes: string;
  setNotes: (value: string) => void;
  referenceUrls: string[];
  setReferenceUrls: (urls: string[]) => void;
  
  // Upload state
  uploading: boolean;
  setUploading: (value: boolean) => void;
  
  // Actions
  resetForm: () => void;
}

export function useStagingForm(): UseStagingFormReturn {
  // Gallery & Photo State
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Configuration State
  const [roomType, setRoomType] = useState<string | null>(null);
  const [stagingStyle, setStagingStyle] = useState<string | null>(null);
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [addFurniture, setAddFurniture] = useState(true);
  const [enhancePhoto, setEnhancePhoto] = useState(true);
  
  // Reference & Notes
  const [notes, setNotes] = useState('');
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const togglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPhotoIds([]);
    setCurrentPhotoIndex(0);
  }, []);

  const resetForm = useCallback(() => {
    setSelectedPhotoIds([]);
    setCurrentPhotoIndex(0);
    setRoomType(null);
    setStagingStyle(null);
    setRemoveFurniture(false);
    setAddFurniture(true);
    setEnhancePhoto(true);
    setNotes('');
    setReferenceUrls([]);
  }, []);

  return {
    selectedGalleryId,
    setSelectedGalleryId,
    selectedPhotoIds,
    togglePhotoSelection,
    clearSelection,
    currentPhotoIndex,
    setCurrentPhotoIndex,
    roomType,
    setRoomType,
    stagingStyle,
    setStagingStyle,
    removeFurniture,
    setRemoveFurniture,
    addFurniture,
    setAddFurniture,
    enhancePhoto,
    setEnhancePhoto,
    notes,
    setNotes,
    referenceUrls,
    setReferenceUrls,
    uploading,
    setUploading,
    resetForm,
  };
}
