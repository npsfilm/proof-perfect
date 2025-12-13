import { cn } from '@/lib/utils';
import { LightboxImageProps } from '../types';
import { DrawingOverlay } from '../DrawingOverlay';
import { AnnotationLayer } from '../AnnotationLayer';
import watermarkLogo from '@/assets/immoonpoint-watermark.webp';

export function LightboxImage({
  photo,
  signedUrl,
  zoom,
  panX,
  panY,
  isDragging,
  isFullscreen,
  annotationMode,
  imageRef,
  drawingAnnotation,
  markerAnnotations,
  pendingAnnotation,
  currentUserId,
  imageContainerSize,
  showDrawingCanvas,
  onImageClick,
  onWheel,
  onImageLoad,
  onSaveAnnotation,
  onCancelAnnotation,
  onDeleteAnnotation,
  panHandlers,
}: LightboxImageProps) {
  return (
    <div 
      className="flex-1 flex items-center justify-center relative"
      onWheel={onWheel}
      {...panHandlers}
      onClick={onImageClick}
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
          onLoad={onImageLoad}
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

        {/* Drawing Overlay - show saved drawing when not editing */}
        {drawingAnnotation?.drawing_data && !showDrawingCanvas && (
          <DrawingOverlay
            drawingData={drawingAnnotation.drawing_data}
            containerWidth={imageContainerSize.width}
            containerHeight={imageContainerSize.height}
          />
        )}

        {/* Annotation Layer */}
        <AnnotationLayer
          annotations={markerAnnotations}
          pendingAnnotation={pendingAnnotation}
          annotationMode={annotationMode}
          zoom={zoom}
          currentUserId={currentUserId}
          imageContainerSize={imageContainerSize}
          onSaveAnnotation={onSaveAnnotation}
          onCancelAnnotation={onCancelAnnotation}
          onDeleteAnnotation={onDeleteAnnotation}
        />
      </div>
    </div>
  );
}
