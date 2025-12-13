import { Check, MessageSquarePlus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StagingControls } from '../StagingControls';
import { LightboxDesktopControlsProps } from '../types';
import { useAnsprache } from '@/contexts/AnspracheContext';

export function LightboxDesktopControls({
  photo,
  currentIndex,
  totalPhotos,
  comment,
  stagingRequested,
  stagingStyle,
  annotationMode,
  drawingAnnotation,
  markerAnnotations,
  imageRef,
  onToggleSelection,
  onCommentChange,
  onCommentBlur,
  onStagingToggle,
  onStagingStyleChange,
  onAnnotationModeToggle,
  onOpenDrawingCanvas,
  onSetImageContainerSize,
}: LightboxDesktopControlsProps) {
  const { t } = useAnsprache();

  const handleOpenDrawingCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure we have image dimensions before opening canvas
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      onSetImageContainerSize({ width: rect.width, height: rect.height });
    }
    onOpenDrawingCanvas();
  };

  return (
    <div className="hidden lg:block w-80 bg-background rounded-lg p-6 space-y-6 overflow-y-auto">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Foto {currentIndex + 1} von {totalPhotos}
        </p>
        <p className="text-xs text-muted-foreground">{photo.filename}</p>
      </div>

      {/* Select button */}
      <Button
        onClick={onToggleSelection}
        variant={photo.is_selected ? 'default' : 'outline'}
        className="w-full"
        size="lg"
      >
        <Check className="h-5 w-5 mr-2" />
        {photo.is_selected ? 'Ausgewählt' : 'Foto auswählen'}
      </Button>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Kommentar (optional)</Label>
        <Textarea
          id="comment"
          placeholder={t('Notizen oder Feedback zu diesem Foto hinzufügen...', 'Notizen oder Feedback zu diesem Foto hinzufügen...')}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          onBlur={onCommentBlur}
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
          onClick={handleOpenDrawingCanvas}
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
            onAnnotationModeToggle();
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
        onStagingToggle={onStagingToggle}
        onStagingStyleChange={onStagingStyleChange}
      />
    </div>
  );
}
