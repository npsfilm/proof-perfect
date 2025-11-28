import { useState, useEffect, useRef } from 'react';
import { X, Check, ChevronLeft, ChevronRight, Keyboard, Menu, ZoomIn, ZoomOut, Maximize2, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoBottomSheet } from './PhotoBottomSheet';
import { AnnotationMarker } from './AnnotationMarker';
import { AnnotationPopover } from './AnnotationPopover';
import { Photo } from '@/types/database';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrls';
import { usePhotoAnnotations } from '@/hooks/usePhotoAnnotations';

interface PhotoLightboxProps {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  galleryId: string;
}

export function PhotoLightbox({ photo, photos, onClose, onNavigate, galleryId }: PhotoLightboxProps) {
  const { signedUrl, isLoading: urlLoading } = useSignedPhotoUrl(photo);
  const [comment, setComment] = useState(photo.client_comment || '');
  const [stagingRequested, setStagingRequested] = useState(photo.staging_requested);
  const [stagingStyle, setStagingStyle] = useState(photo.staging_style || 'Modern');
  const [showKeyboardHints, setShowKeyboardHints] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Annotation state
  const [annotationMode, setAnnotationMode] = useState(false);
  const [pendingAnnotation, setPendingAnnotation] = useState<{ x: number; y: number } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [imageContainerSize, setImageContainerSize] = useState({ width: 0, height: 0 });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { annotations, addAnnotation, deleteAnnotation } = usePhotoAnnotations(photo.id);
  const imageRef = useRef<HTMLImageElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const initialPinchDistance = useRef<number | null>(null);
  const lastPanX = useRef(0);
  const lastPanY = useRef(0);

  const currentIndex = photos.findIndex(p => p.id === photo.id);

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
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
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
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setAnnotationMode(false);
    setPendingAnnotation(null);
  }, [photo.id]);

  // Pinch-to-zoom handling
  const getPinchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Swipe gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch gesture
      initialPinchDistance.current = getPinchDistance(e.touches);
      e.preventDefault();
    } else if (e.touches.length === 1) {
      // Single touch for swipe or pan
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      lastPanX.current = panX;
      lastPanY.current = panY;
      if (zoom > 1) {
        setIsDragging(true);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistance.current) {
      // Pinch zoom
      const currentDistance = getPinchDistance(e.touches);
      const scale = currentDistance / initialPinchDistance.current;
      const newZoom = Math.min(Math.max(zoom * scale, 1), 5);
      setZoom(newZoom);
      initialPinchDistance.current = currentDistance;
      e.preventDefault();
    } else if (e.touches.length === 1 && zoom > 1 && isDragging) {
      // Pan when zoomed
      const deltaX = e.touches[0].clientX - (touchStartX.current || 0);
      const deltaY = e.touches[0].clientY - (touchStartY.current || 0);
      setPanX(lastPanX.current + deltaX);
      setPanY(lastPanY.current + deltaY);
      e.preventDefault();
    } else {
      touchEndX.current = e.touches[0].clientX;
      touchEndY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistance.current = null;
    setIsDragging(false);

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

  // Wheel zoom for desktop
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      const newZoom = Math.min(Math.max(zoom + delta, 1), 5);
      setZoom(newZoom);
      if (newZoom === 1) {
        setPanX(0);
        setPanY(0);
      }
    }
  };

  // Mouse drag for panning when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      lastPanX.current = panX;
      lastPanY.current = panY;
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1 && touchStartX.current && touchStartY.current) {
      const deltaX = e.clientX - touchStartX.current;
      const deltaY = e.clientY - touchStartY.current;
      setPanX(lastPanX.current + deltaX);
      setPanY(lastPanY.current + deltaY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.5, 1);
    setZoom(newZoom);
    if (newZoom === 1) {
      setPanX(0);
      setPanY(0);
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
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
    onError: (error: any) => {
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

      {/* Keyboard Hints Toggle (Desktop only) */}
      <button
        onClick={() => setShowKeyboardHints(!showKeyboardHints)}
        className="hidden lg:block absolute top-4 left-4 text-white/60 hover:text-white z-10"
        title="Tastaturkürzel anzeigen"
      >
        <Keyboard className="h-6 w-6" />
      </button>

      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardHints && (
        <div className="absolute top-16 left-4 bg-black/80 text-white rounded-lg p-4 z-10 backdrop-blur-sm">
          <h3 className="font-medium mb-3 text-sm">Tastaturkürzel</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">←</kbd>
              <span>Vorheriges Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">→</kbd>
              <span>Nächstes Foto</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">Leertaste</kbd>
              <span>Foto auswählen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">ESC</kbd>
              <span>Schließen</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">?</kbd>
              <span>Diese Hilfe ein/ausblenden</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-white/20 rounded">Strg + Scroll</kbd>
              <span>Zoomen</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation (Desktop only, mobile uses swipe) */}
      {!isFullscreen && currentIndex > 0 && (
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
      
      {!isFullscreen && currentIndex < photos.length - 1 && (
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

      {/* Annotation Mode Toggle (Desktop & Mobile) */}
      <div className="absolute top-20 lg:left-4 right-4 lg:right-auto z-10 flex flex-col gap-2">
        <Button
          size="icon"
          variant={annotationMode ? 'default' : 'secondary'}
          onClick={(e) => {
            e.stopPropagation();
            setAnnotationMode(!annotationMode);
          }}
          className={cn(
            annotationMode && "bg-primary text-primary-foreground"
          )}
          title={annotationMode ? "Anmerkungs-Modus deaktivieren" : "Anmerkungs-Modus aktivieren"}
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>

      {/* Zoom Controls */}
      {zoom > 1 && (
        <div className="absolute top-20 right-4 z-10 flex flex-col gap-2 bg-black/60 rounded-lg p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleResetZoom}
            className="text-white hover:text-white hover:bg-white/20"
            title="Zoom zurücksetzen"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="lg:hidden absolute bottom-24 right-4 z-10 flex flex-col gap-2 bg-black/60 rounded-lg p-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomIn}
          className="text-white hover:text-white hover:bg-white/20"
          title="Vergrößern"
          disabled={zoom >= 5}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleZoomOut}
          className="text-white hover:text-white hover:bg-white/20"
          title="Verkleinern"
          disabled={zoom <= 1}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
      </div>

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
          ref={imageContainerRef}
          className="flex-1 flex items-center justify-center relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleImageClick}
          style={{ 
            cursor: annotationMode && zoom === 1 ? 'crosshair' : zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' 
          }}
        >
          <img
            ref={imageRef}
            src={signedUrl || photo.storage_url}
            alt={photo.filename}
            className={cn(
              "object-contain transition-transform",
              isFullscreen ? "w-full h-full" : "max-w-full max-h-full"
            )}
            style={{
              transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
              transformOrigin: 'center center',
            }}
          />

          {/* Annotation Markers */}
          {zoom === 1 && annotations.map((annotation, index) => (
            <AnnotationMarker
              key={annotation.id}
              annotation={annotation}
              number={index + 1}
              isOwner={annotation.author_user_id === currentUserId}
              onDelete={handleDeleteAnnotation}
              containerSize={imageContainerSize}
            />
          ))}

          {/* Pending Annotation Popover */}
          {pendingAnnotation && (
            <AnnotationPopover
              position={pendingAnnotation}
              onSave={handleSaveAnnotation}
              onCancel={handleCancelAnnotation}
            />
          )}

          {/* Annotation Mode Indicator */}
          {annotationMode && zoom === 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10">
              Klicken Sie auf das Bild, um eine Anmerkung hinzuzufügen
            </div>
          )}
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
              placeholder="Notizen oder Feedback zu diesem Foto hinzufügen..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onBlur={handleCommentBlur}
              rows={4}
            />
          </div>

          {/* Annotations List */}
          {annotations.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base">Anmerkungen ({annotations.length})</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {annotations.map((annotation, index) => (
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
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="staging" className="text-base">Virtuelles Staging</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Möbel digital hinzufügen
                </p>
              </div>
              <Switch
                id="staging"
                checked={stagingRequested}
                onCheckedChange={handleStagingToggle}
              />
            </div>

            {stagingRequested && (
              <div className="space-y-2">
                <Label htmlFor="staging-style">Stil</Label>
                <Select value={stagingStyle} onValueChange={handleStagingStyleChange}>
                  <SelectTrigger id="staging-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Modern">Modern</SelectItem>
                    <SelectItem value="Scandinavian">Skandinavisch</SelectItem>
                    <SelectItem value="Industrial">Industriell</SelectItem>
                    <SelectItem value="Minimalist">Minimalistisch</SelectItem>
                    <SelectItem value="Traditional">Traditionell</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
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
        annotations={annotations}
        currentUserId={currentUserId}
        onDeleteAnnotation={handleDeleteAnnotation}
      />
    </div>
  );
}