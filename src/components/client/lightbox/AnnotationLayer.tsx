import { AnnotationMarker } from '../AnnotationMarker';
import { AnnotationPopover } from '../AnnotationPopover';
import { PhotoAnnotation } from '@/types/database';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface AnnotationLayerProps {
  annotations: PhotoAnnotation[];
  pendingAnnotation: { x: number; y: number } | null;
  annotationMode: boolean;
  zoom: number;
  currentUserId: string | null;
  imageContainerSize: { width: number; height: number };
  onSaveAnnotation: (comment: string) => Promise<void>;
  onCancelAnnotation: () => void;
  onDeleteAnnotation: (annotationId: string) => Promise<void>;
}

export function AnnotationLayer({
  annotations,
  pendingAnnotation,
  annotationMode,
  zoom,
  currentUserId,
  imageContainerSize,
  onSaveAnnotation,
  onCancelAnnotation,
  onDeleteAnnotation,
}: AnnotationLayerProps) {
  const { t } = useAnsprache();
  
  return (
    <>
      {/* Annotation Markers - only visible when not zoomed */}
      {zoom === 1 && annotations.map((annotation, index) => (
        <AnnotationMarker
          key={annotation.id}
          annotation={annotation}
          number={index + 1}
          isOwner={annotation.author_user_id === currentUserId}
          onDelete={onDeleteAnnotation}
          containerSize={imageContainerSize}
        />
      ))}

      {/* Pending Annotation Popover */}
      {pendingAnnotation && (
        <AnnotationPopover
          position={pendingAnnotation}
          onSave={onSaveAnnotation}
          onCancel={onCancelAnnotation}
        />
      )}

      {/* Annotation Mode Indicator */}
      {annotationMode && zoom === 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg z-10">
          {t('Klicke auf das Bild, um eine Anmerkung hinzuzufügen', 'Klicken Sie auf das Bild, um eine Anmerkung hinzuzufügen')}
        </div>
      )}
    </>
  );
}
