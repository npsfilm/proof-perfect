import { useState, useEffect, useCallback } from 'react';
import { Photo } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { PendingAnnotation, ImageSize, LightboxState, LightboxActions } from '../types';

export function useLightboxState(photo: Photo) {
  // UI visibility state
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  
  // Annotation state
  const [annotationMode, setAnnotationMode] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<PendingAnnotation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageContainerSize, setImageContainerSize] = useState<ImageSize>({ width: 0, height: 0 });
  
  // Form state synced with photo
  const [comment, setComment] = useState(photo.client_comment || '');
  const [stagingRequested, setStagingRequested] = useState(photo.staging_requested);
  const [stagingStyle, setStagingStyle] = useState(photo.staging_style || 'Modern');

  // Sync form state when photo changes
  useEffect(() => {
    setComment(photo.client_comment || '');
    setStagingRequested(photo.staging_requested);
    setStagingStyle(photo.staging_style || 'Modern');
  }, [photo.id, photo.client_comment, photo.staging_requested, photo.staging_style]);

  // Reset modes when photo changes
  useEffect(() => {
    setAnnotationMode(false);
    setPendingAnnotation(null);
    setShowDrawingCanvas(false);
  }, [photo.id]);

  // Get current user ID on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Toggle functions
  const toggleAnnotationMode = useCallback(() => {
    setAnnotationMode(prev => !prev);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Compose state object
  const state: LightboxState = {
    showKeyboardHints,
    showBottomSheet,
    isFullscreen,
    showDrawingCanvas,
    annotationMode,
    pendingAnnotation,
    comment,
    stagingRequested,
    stagingStyle,
    imageContainerSize,
    currentUserId,
  };

  // Compose actions object
  const actions: LightboxActions = {
    setShowKeyboardHints,
    setShowBottomSheet,
    setIsFullscreen,
    setShowDrawingCanvas,
    setAnnotationMode,
    setPendingAnnotation,
    setComment,
    setStagingRequested,
    setStagingStyle,
    setImageContainerSize,
    toggleAnnotationMode,
    toggleFullscreen,
  };

  return { state, actions };
}
