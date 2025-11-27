import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
}: PhotoBottomSheetProps) {
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
          {/* Select button */}
          <Button
            onClick={onToggleSelection}
            variant={isSelected ? 'default' : 'outline'}
            className="w-full"
            size="lg"
          >
            <Heart 
              className={`h-5 w-5 mr-2 ${isSelected ? 'fill-current' : ''}`} 
            />
            {isSelected ? 'Ausgewählt' : 'Foto auswählen'}
          </Button>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment-mobile">Kommentar (optional)</Label>
            <Textarea
              id="comment-mobile"
              placeholder="Notizen oder Feedback zu diesem Foto hinzufügen..."
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
