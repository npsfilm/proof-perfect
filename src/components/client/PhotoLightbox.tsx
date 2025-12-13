import { useState, useEffect, useRef } from 'react';
import { X, Check, Menu, MessageSquarePlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhotoBottomSheet } from './PhotoBottomSheet';
import { Photo } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { usePhotoAnnotations } from '@/hooks/usePhotoAnnotations';
import { ImageZoomControls } from './lightbox/ImageZoomControls';
import { useImageZoom } from './lightbox/useImageZoom';
import { useImagePan } from './lightbox/useImagePan';
import { AnnotationLayer } from './lightbox/AnnotationLayer';
import { LightboxNavigation } from './lightbox/LightboxNavigation';
import { StagingControls } from './lightbox/StagingControls';
import { KeyboardShortcuts } from './lightbox/KeyboardShortcuts';
import { FabricAnnotationCanvas } from './lightbox/FabricAnnotationCanvas';
import watermarkLogo from '@/assets/immoonpoint-watermark.webp';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  galleryId: string;
  signedUrls: Record<string, string>;
}

export function PhotoLightbox({ photo, photos, onClose, onNavigate, galleryId, signedUrls }: PhotoLightboxProps) {
  const { t } = useAnsprache();
  const signedUrl = signedUrls[photo.id] || photo.storage_url;
  const [comment, setComment] = useState(photo.client_comment || '');
  const [stagingRequested, setStagingRequested] = useState(photo.staging_requested);
  const [stagingStyle, setStagingStyle] = useState(photo.staging_style || 'Modern');
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Annotation state
  const [annotationMode, setAnnotationMode] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });
  const [showDrawingCanvas, setShowDrawingCanvas] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { markerAnnotations, drawingAnnotation, addAnnotation, deleteAnnotation, saveDrawingAnnotation } = usePhotoAnnotations(photo.id);
  const imageRef = useRef<HTMLImageElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  const currentIndex = photos.findIndex(p => p.id === photo.id);

  // Use custom hooks for zoom and pan
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

  // Reset pan when zoom resets to 1
  useEffect(() => {
    if (zoom === 1) {
      resetPan();
    }
  }, [zoom, resetPan]);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  // Update image container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        setImageContainerSize({ width: rect.width, height: rect.height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [photo.id, zoom]);

  // Handle image click for annotations
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!annotationMode || zoom > 1 || isDragging) return;
    
    e.stopPropagation();
    
    const rect = imageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setPendingAnnotation({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleSaveAnnotation = async (commentText: string) => {
    if (!pendingAnnotation || !imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = (pendingAnnotation.x / rect.width) * 100;
    const y = (pendingAnnotation.y / rect.height) * 100;
    
    await addAnnotation.mutateAsync({
      x_position: Number(x.toFixed(2)),
      y_position: Number(y.toFixed(2)),
      comment: commentText,
    });
    
    setPendingAnnotation(null);
  };

  const handleCancelAnnotation = () => {
    setPendingAnnotation(null);
  };

  const handleDeleteAnnotation = async (annotationId: string) => {
    await deleteAnnotation.mutateAsync(annotationId);
  };

  // Reset zoom and annotation mode when photo changes
  useEffect(() => {
    handleResetZoom();
    resetPan();
    setAnnotationMode(false);
    setPendingAnnotation(null);
    setShowDrawingCanvas(false);
  }, [photo.id]);

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const preloadIndices: number[] = [];
    
    // Preload next 2 images
    if (currentIndex + 1 < photos.length) preloadIndices.push(currentIndex + 1);
    if (currentIndex + 2 < photos.length) preloadIndices.push(currentIndex + 2);
    
    // Preload previous 2 images
    if (currentIndex - 1 >= 0) preloadIndices.push(currentIndex - 1);
    if (currentIndex - 2 >= 0) preloadIndices.push(currentIndex - 2);
    
    // Preload images
    preloadIndices.forEach(index => {
      const photoToPreload = photos[index];
      const url = signedUrls[photoToPreload.id] || photoToPreload.storage_url;
      const img = new Image();
      img.src = url;
    });
  }, [photo.id, photos, signedUrls]);

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      handlePinchStart(e.touches);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      panHandlers.onTouchStart(e);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const isPinching = handlePinchMove(e.touches);
    if (isPinching) {
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Handle pan if zoomed, otherwise track for swipe
      if (zoom > 1 && isDragging) {
        panHandlers.onTouchMove(e);
      }
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    handlePinchEnd();
    panHandlers.onTouchEnd();

    // Only handle swipe if not zoomed
    if (zoom <= 1 && touchStartX.current && touchEndX.current && touchStartY.current && touchEndY.current) {
      const diffX = touchStartX.current - touchEndX.current;
      const diffY = touchStartY.current - touchEndY.current;
      const minSwipeDistance = 50;

      // Vertical swipe down to close (only if in fullscreen mode on mobile)
      if (Math.abs(diffY) > Math.abs(diffX) && diffY < -minSwipeDistance && isFullscreen) {
        onClose();
      }
      // Horizontal swipe for navigation
      else if (Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0 && currentIndex < photos.length - 1) {
          onNavigate('next');
        } else if (diffX < 0 && currentIndex > 0) {
          onNavigate('prev');
        }
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
    touchStartY.current = null;
    touchEndY.current = null;
  };

  // Toggle keyboard hints with '?' key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '?') {
        setShowKeyboardHints(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const updatePhoto = useMutation({
    mutationFn: async (updates: Partial<Photo>) => {
      const { error } = await supabase
        .from('photos')
        .update(updates)
        .eq('id', photo.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', galleryId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleSelection = () => {
    updatePhoto.mutate({ is_selected: !photo.is_selected });
  };

  const handleCommentBlur = () => {
    if (comment !== photo.client_comment) {
      updatePhoto.mutate({ client_comment: comment || null });
    }
  };

  const handleStagingToggle = (checked: boolean) => {
    setStagingRequested(checked);
    updatePhoto.mutate({ 
      staging_requested: checked,
      staging_style: checked ? stagingStyle : null,
    });
  };

  const handleStagingStyleChange = (style: string) => {
    setStagingStyle(style);
    if (stagingRequested) {
      updatePhoto.mutate({ staging_style: style });
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate('prev');
    if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNavigate('next');
    if (e.key === ' ') {
      e.preventDefault();
      toggleSelection();
    }
  };

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black z-50 flex items-center justify-center",
        isFullscreen ? "bg-black" : "bg-black/90"
      )}
      onClick={onClose}
      onKeyDown={handleKeyDown as any}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
    >
      {/* Mobile Top Bar */}
      <div className="lg:hidden absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent z-10 p-4 flex items-center justify-between">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-white/80 hover:text-white text-sm"
        >
          {isFullscreen ? 'Normal' : 'Vollbild'}
        </button>
        <button
          onClick={onClose}
          className="text-white hover:text-white/80"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop Close button */}
      <button
        onClick={onClose}
        className="hidden lg:block absolute top-4 right-4 text-white hover:text-gray-300 z-10"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts 
        show={showKeyboardHints}
        onToggle={() => setShowKeyboardHints(!showKeyboardHints)}
      />

      {/* Navigation */}
      <LightboxNavigation
        currentIndex={currentIndex}
        totalPhotos={photos.length}
        isFullscreen={isFullscreen}
        onNavigate={onNavigate}
      />


      {/* Zoom Controls */}
      <ImageZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => {
          handleResetZoom();
          resetPan();
        }}
      />
      <ImageZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={() => {
          handleResetZoom();
          resetPan();
        }}
        isMobile
      />

      {/* Mobile Bottom Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowBottomSheet(true);
        }}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-20 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <Menu className="h-5 w-5" />
        <span>Aktionen</span>
      </button>

      {/* Content */}
      <div 
        className={cn(
          "w-full h-full flex flex-col lg:flex-row gap-4 lg:p-8",
          isFullscreen ? "p-0" : "p-4 pt-16 pb-24 lg:pt-8 lg:pb-8"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div 
          className="flex-1 flex items-center justify-center relative"
          onWheel={handleWheel}
          {...panHandlers}
          onClick={handleImageClick}
          style={{ 
            cursor: annotationMode && zoom === 1 ? 'crosshair' : zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' 
          }}
        >
          <div className="relative">
            <img
              ref={imageRef}
              src={signedUrl}
              alt={photo.filename}
              className={cn(
                "object-contain transition-transform select-none",
                isFullscreen ? "w-full h-full" : "max-w-full max-h-full"
              )}
              style={{
                transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
                transformOrigin: 'center center',
              }}
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
            />
            
            {/* Watermark */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                transform: `translateX(-50%) scale(${zoom})`,
                transformOrigin: 'center bottom',
              }}
            >
              <img 
                src={watermarkLogo} 
                alt="" 
                className="h-24 w-auto opacity-70 select-none"
                draggable={false}
              />
            </div>

            {/* Annotation Layer */}
            <AnnotationLayer
              annotations={markerAnnotations}
              pendingAnnotation={pendingAnnotation}
              annotationMode={annotationMode}
              zoom={zoom}
              currentUserId={currentUserId}
              imageContainerSize={imageContainerSize}
              onSaveAnnotation={handleSaveAnnotation}
              onCancelAnnotation={handleCancelAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
            />
          </div>
        </div>

        {/* Controls (Desktop only) */}
        <div className="hidden lg:block w-80 bg-background rounded-lg p-6 space-y-6 overflow-y-auto">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Foto {currentIndex + 1} von {photos.length}
            </p>
            <p className="text-xs text-muted-foreground">{photo.filename}</p>
          </div>

          {/* Select button */}
          <Button
            onClick={toggleSelection}
            variant={photo.is_selected ? 'default' : 'outline'}
            className="w-full"
            size="lg"
          >
            <Check 
              className="h-5 w-5 mr-2" 
            />
            {photo.is_selected ? 'Ausgewählt' : 'Foto auswählen'}
          </Button>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Kommentar (optional)</Label>
            <Textarea
              id="comment"
              placeholder={t('Notizen oder Feedback zu diesem Foto hinzufügen...', 'Notizen oder Feedback zu diesem Foto hinzufügen...')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              rows={4}
            />
          </div>

          {/* Annotation Mode Toggle */}
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label className="text-base">Anmerkungen</Label>
              <p className="text-xs text-muted-foreground">
                {t('Markiere Stellen im Bild für Änderungswünsche', 'Markieren Sie Stellen im Bild für Änderungswünsche')}
              </p>
            </div>
            
            {/* Drawing Canvas Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowDrawingCanvas(true);
              }}
              variant={drawingAnnotation ? 'secondary' : 'outline'}
              className="w-full"
              size="lg"
            >
              <Pencil className="h-5 w-5 mr-2" />
              {drawingAnnotation ? 'Zeichnung bearbeiten' : 'Auf Bild zeichnen'}
            </Button>
            
            {/* Point Annotation Mode */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setAnnotationMode(!annotationMode);
              }}
              variant={annotationMode ? 'default' : 'outline'}
              className="w-full"
              size="lg"
            >
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              {annotationMode ? 'Punkt-Modus aktiv' : 'Punkt-Anmerkung setzen'}
            </Button>
          </div>

          {/* Annotations List */}
          {markerAnnotations.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base">Punkt-Anmerkungen ({markerAnnotations.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {markerAnnotations.map((annotation, index) => (
                  <div key={annotation.id} className="text-sm p-2 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-primary">{index + 1}.</span>
                      <p className="flex-1">{annotation.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Virtual Staging */}
          <StagingControls
            stagingRequested={stagingRequested}
            stagingStyle={stagingStyle}
            onStagingToggle={handleStagingToggle}
            onStagingStyleChange={handleStagingStyleChange}
          />
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <PhotoBottomSheet
        isOpen={showBottomSheet}
        onOpenChange={setShowBottomSheet}
        isSelected={photo.is_selected}
        comment={comment}
        stagingRequested={stagingRequested}
        stagingStyle={stagingStyle}
        currentIndex={currentIndex}
        totalPhotos={photos.length}
        filename={photo.filename}
        onToggleSelection={toggleSelection}
        onCommentChange={setComment}
        onCommentBlur={handleCommentBlur}
        onStagingToggle={handleStagingToggle}
        onStagingStyleChange={handleStagingStyleChange}
        annotationMode={annotationMode}
        onAnnotationModeToggle={() => setAnnotationMode(!annotationMode)}
        annotations={markerAnnotations}
        currentUserId={currentUserId}
        onDeleteAnnotation={handleDeleteAnnotation}
      />

      {/* Fabric.js Drawing Canvas */}
      {showDrawingCanvas && (
        <FabricAnnotationCanvas
          imageUrl={signedUrl}
          imageSize={imageContainerSize.width > 0 ? imageContainerSize : { width: 800, height: 600 }}
          existingDrawing={drawingAnnotation?.drawing_data}
          onSave={async (drawingData) => {
            await saveDrawingAnnotation.mutateAsync({ drawing_data: drawingData });
            setShowDrawingCanvas(false);
          }}
          onCancel={() => setShowDrawingCanvas(false)}
        />
      )}
    </div>
  );
}
