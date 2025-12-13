import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Photo } from '@/types/database';
import { usePhotoAnnotations } from '@/hooks/usePhotoAnnotations';

// Lightbox hooks
import { useImageZoom } from './lightbox/useImageZoom';
import { useImagePan } from './lightbox/useImagePan';
import {
  useLightboxState,
  useLightboxNavigation,
  useTouchGestures,
  usePhotoMutation,
  useAnnotationHandlers,
  useKeyboardHandlers,
} from './lightbox/hooks';

// Lightbox components
import {
  LightboxTopBar,
  LightboxImage,
  LightboxDesktopControls,
  LightboxMobileButton,
  LightboxCloseButton,
} from './lightbox/components';
import { ImageZoomControls } from './lightbox/ImageZoomControls';
import { LightboxNavigation } from './lightbox/LightboxNavigation';
import { KeyboardShortcuts } from './lightbox/KeyboardShortcuts';
import { FabricAnnotationCanvas } from './lightbox/FabricAnnotationCanvas';
import { PhotoBottomSheet } from './PhotoBottomSheet';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  galleryId: string;
  signedUrls: Record<string, string>;
}

export function PhotoLightbox({ photo, photos, onClose, onNavigate, galleryId, signedUrls }: PhotoLightboxProps) {
  const signedUrl = signedUrls[photo.id] || photo.storage_url;
  const imageRef = useRef<HTMLImageElement>(null);

  // Custom hooks for state management
  const { state, actions } = useLightboxState(photo);
  const navigation = useLightboxNavigation(photos, photo.id, signedUrls);
  const { toggleSelection, saveComment, updateStaging, updateStagingStyle } = usePhotoMutation(photo.id, galleryId);
  const { markerAnnotations, drawingAnnotation, addAnnotation, deleteAnnotation, saveDrawingAnnotation } = usePhotoAnnotations(photo.id);

  // Zoom and pan hooks
  const {
    zoom,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom,
    handleWheel,
    handlePinchStart,
    handlePinchMove,
    handlePinchEnd,
  } = useImageZoom();

  const {
    panX,
    panY,
    isDragging,
    resetPan,
    handlers: panHandlers,
  } = useImagePan(zoom);

  // Touch gestures hook
  const touchGestures = useTouchGestures({
    zoom,
    isFullscreen: state.isFullscreen,
    currentIndex: navigation.currentIndex,
    totalPhotos: navigation.totalPhotos,
    isDragging,
    onNavigate,
    onClose,
    panHandlers,
    zoomHandlers: { handlePinchStart, handlePinchMove, handlePinchEnd },
  });

  // Annotation handlers
  const annotationHandlers = useAnnotationHandlers(imageRef, addAnnotation, {
    annotationMode: state.annotationMode,
    zoom,
    isDragging,
    setPendingAnnotation: actions.setPendingAnnotation,
  });

  // Keyboard handlers
  const { handleKeyDown } = useKeyboardHandlers({
    currentIndex: navigation.currentIndex,
    totalPhotos: navigation.totalPhotos,
    onClose,
    onNavigate,
    onToggleSelection: () => toggleSelection(photo.is_selected),
    onToggleKeyboardHints: () => actions.setShowKeyboardHints(!state.showKeyboardHints),
  });

  // Reset zoom and pan when photo changes
  useEffect(() => {
    handleResetZoom();
    resetPan();
  }, [photo.id, handleResetZoom, resetPan]);

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoom === 1) {
      resetPan();
    }
  }, [zoom, resetPan]);

  // Update image container size
  useEffect(() => {
    const updateSize = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        actions.setImageContainerSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [photo.id, zoom, actions]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      actions.setImageContainerSize({ width: rect.width, height: rect.height });
    }
  }, [actions]);

  // Handle save annotation with pending annotation
  const handleSaveAnnotation = useCallback(async (comment: string) => {
    await annotationHandlers.handleSaveAnnotation(comment, state.pendingAnnotation);
  }, [annotationHandlers, state.pendingAnnotation]);

  // Handle delete annotation
  const handleDeleteAnnotation = useCallback(async (annotationId: string) => {
    await deleteAnnotation.mutateAsync(annotationId);
  }, [deleteAnnotation]);

  // Handle comment blur
  const handleCommentBlur = useCallback(() => {
    saveComment(state.comment, photo.client_comment);
  }, [saveComment, state.comment, photo.client_comment]);

  // Handle staging toggle
  const handleStagingToggle = useCallback((checked: boolean) => {
    actions.setStagingRequested(checked);
    updateStaging(checked, state.stagingStyle);
  }, [actions, updateStaging, state.stagingStyle]);

  // Handle staging style change
  const handleStagingStyleChange = useCallback((style: string) => {
    actions.setStagingStyle(style);
    updateStagingStyle(style, state.stagingRequested);
  }, [actions, updateStagingStyle, state.stagingRequested]);

  // Handle reset zoom with pan
  const handleResetZoomWithPan = useCallback(() => {
    handleResetZoom();
    resetPan();
  }, [handleResetZoom, resetPan]);

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black z-50 flex items-center justify-center",
        state.isFullscreen ? "bg-black" : "bg-black/90"
      )}
      onClick={onClose}
      onKeyDown={handleKeyDown as any}
      onTouchStart={touchGestures.handleTouchStart}
      onTouchMove={touchGestures.handleTouchMove}
      onTouchEnd={touchGestures.handleTouchEnd}
      tabIndex={0}
    >
      {/* Mobile Top Bar */}
      <LightboxTopBar
        isFullscreen={state.isFullscreen}
        onToggleFullscreen={actions.toggleFullscreen}
        onClose={onClose}
      />

      {/* Desktop Close Button */}
      <LightboxCloseButton onClose={onClose} />

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        show={state.showKeyboardHints}
        onToggle={() => actions.setShowKeyboardHints(!state.showKeyboardHints)}
      />

      {/* Navigation */}
      <LightboxNavigation
        currentIndex={navigation.currentIndex}
        totalPhotos={navigation.totalPhotos}
        isFullscreen={state.isFullscreen}
        onNavigate={onNavigate}
      />

      {/* Zoom Controls - Desktop & Mobile */}
      <ImageZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoomWithPan}
      />
      <ImageZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoomWithPan}
        isMobile
      />

      {/* Mobile Bottom Action Button */}
      <LightboxMobileButton onClick={() => actions.setShowBottomSheet(true)} />

      {/* Content */}
      <div 
        className={cn(
          "w-full h-full flex flex-col lg:flex-row gap-4 lg:p-8",
          state.isFullscreen ? "p-0" : "p-4 pt-16 pb-24 lg:pt-8 lg:pb-8"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <LightboxImage
          photo={photo}
          signedUrl={signedUrl}
          zoom={zoom}
          panX={panX}
          panY={panY}
          isDragging={isDragging}
          isFullscreen={state.isFullscreen}
          annotationMode={state.annotationMode}
          imageRef={imageRef}
          drawingAnnotation={drawingAnnotation}
          markerAnnotations={markerAnnotations}
          pendingAnnotation={state.pendingAnnotation}
          currentUserId={state.currentUserId}
          imageContainerSize={state.imageContainerSize}
          showDrawingCanvas={state.showDrawingCanvas}
          onImageClick={annotationHandlers.handleImageClick}
          onWheel={handleWheel}
          onImageLoad={handleImageLoad}
          onSaveAnnotation={handleSaveAnnotation}
          onCancelAnnotation={annotationHandlers.handleCancelAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          panHandlers={panHandlers}
        />

        {/* Desktop Controls */}
        <LightboxDesktopControls
          photo={photo}
          currentIndex={navigation.currentIndex}
          totalPhotos={navigation.totalPhotos}
          comment={state.comment}
          stagingRequested={state.stagingRequested}
          stagingStyle={state.stagingStyle}
          annotationMode={state.annotationMode}
          drawingAnnotation={drawingAnnotation}
          markerAnnotations={markerAnnotations}
          imageRef={imageRef}
          onToggleSelection={() => toggleSelection(photo.is_selected)}
          onCommentChange={actions.setComment}
          onCommentBlur={handleCommentBlur}
          onStagingToggle={handleStagingToggle}
          onStagingStyleChange={handleStagingStyleChange}
          onAnnotationModeToggle={actions.toggleAnnotationMode}
          onOpenDrawingCanvas={() => actions.setShowDrawingCanvas(true)}
          onSetImageContainerSize={actions.setImageContainerSize}
        />
      </div>

      {/* Mobile Bottom Sheet */}
      <PhotoBottomSheet
        isOpen={state.showBottomSheet}
        onOpenChange={actions.setShowBottomSheet}
        isSelected={photo.is_selected}
        comment={state.comment}
        stagingRequested={state.stagingRequested}
        stagingStyle={state.stagingStyle}
        currentIndex={navigation.currentIndex}
        totalPhotos={navigation.totalPhotos}
        filename={photo.filename}
        onToggleSelection={() => toggleSelection(photo.is_selected)}
        onCommentChange={actions.setComment}
        onCommentBlur={handleCommentBlur}
        onStagingToggle={handleStagingToggle}
        onStagingStyleChange={handleStagingStyleChange}
        annotationMode={state.annotationMode}
        onAnnotationModeToggle={actions.toggleAnnotationMode}
        annotations={markerAnnotations}
        currentUserId={state.currentUserId}
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      {/* Fabric.js Drawing Canvas */}
      {state.showDrawingCanvas && (
        <FabricAnnotationCanvas
          imageUrl={signedUrl}
          imageSize={state.imageContainerSize.width > 0 ? state.imageContainerSize : { width: 800, height: 600 }}
          existingDrawing={drawingAnnotation?.drawing_data}
          onSave={async (drawingData) => {
            await saveDrawingAnnotation.mutateAsync({ drawing_data: drawingData });
            actions.setShowDrawingCanvas(false);
          }}
          onCancel={() => actions.setShowDrawingCanvas(false)}
        />
      )}
    </div>
  );
}
