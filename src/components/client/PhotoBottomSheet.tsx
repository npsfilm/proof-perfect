import { Check, MessageSquarePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PhotoAnnotation } from '@/types/database';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface PhotoBottomSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSelected: boolean;
  comment: string;
  stagingRequested: boolean;
  stagingStyle: string;
  currentIndex: number;
  totalPhotos: number;
  filename: string;
  onToggleSelection: () => void;
  onCommentChange: (value: string) => void;
  onCommentBlur: () => void;
  onStagingToggle: (checked: boolean) => void;
  onStagingStyleChange: (style: string) => void;
  annotationMode: boolean;
  onAnnotationModeToggle: () => void;
  annotations: PhotoAnnotation[];
  currentUserId: string | null;
  onDeleteAnnotation: (id: string) => void;
}

export function PhotoBottomSheet({
  isOpen,
  onOpenChange,
  isSelected,
  comment,
  stagingRequested,
  stagingStyle,
  currentIndex,
  totalPhotos,
  filename,
  onToggleSelection,
  onCommentChange,
  onCommentBlur,
  onStagingToggle,
  onStagingStyleChange,
  annotationMode,
  onAnnotationModeToggle,
  annotations,
  currentUserId,
  onDeleteAnnotation,
}: PhotoBottomSheetProps) {
  const { t } = useAnsprache();
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-left">
            Foto {currentIndex + 1} von {totalPhotos}
          </SheetTitle>
          <p className="text-xs text-muted-foreground text-left">{filename}</p>
        </SheetHeader>

        <div className="mt-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)] pb-6">
          {/* Annotation Mode Toggle */}
          <Button
            onClick={onAnnotationModeToggle}
            variant={annotationMode ? 'default' : 'outline'}
            className="w-full"
            size="lg"
          >
            <MessageSquarePlus className="h-5 w-5 mr-2" />
            {annotationMode ? 'Anmerkungs-Modus aktiv' : 'Anmerkungen hinzufügen'}
          </Button>

          {/* Select button */}
          <Button
            onClick={onToggleSelection}
            variant={isSelected ? 'default' : 'outline'}
            className="w-full"
            size="lg"
          >
            <Check 
              className="h-5 w-5 mr-2" 
            />
            {isSelected ? 'Ausgewählt' : 'Foto auswählen'}
          </Button>

          {/* Annotations List */}
          {annotations.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base">Anmerkungen ({annotations.length})</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {annotations.map((annotation, index) => (
                  <div key={annotation.id} className="text-sm p-3 bg-muted rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-primary shrink-0">{index + 1}.</span>
                      <p className="flex-1 break-words">{annotation.comment}</p>
                      {annotation.author_user_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => onDeleteAnnotation(annotation.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {new Date(annotation.created_at).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment-mobile">Kommentar (optional)</Label>
            <Textarea
              id="comment-mobile"
              placeholder={t('Notizen oder Feedback zu diesem Foto hinzufügen...', 'Notizen oder Feedback zu diesem Foto hinzufügen...')}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              onBlur={onCommentBlur}
              rows={4}
            />
          </div>

          {/* Virtual Staging */}
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="staging-mobile" className="text-base">Virtuelles Staging</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Möbel digital hinzufügen
                </p>
              </div>
              <Switch
                id="staging-mobile"
                checked={stagingRequested}
                onCheckedChange={onStagingToggle}
              />
            </div>

            {stagingRequested && (
              <div className="space-y-2">
                <Label htmlFor="staging-style-mobile">Stil</Label>
                <Select value={stagingStyle} onValueChange={onStagingStyleChange}>
                  <SelectTrigger id="staging-style-mobile">
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
      </SheetContent>
    </Sheet>
  );
}
