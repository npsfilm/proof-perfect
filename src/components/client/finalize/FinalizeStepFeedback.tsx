import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Photo } from '@/types/database';
import { cn } from '@/lib/utils';

interface FinalizeStepFeedbackProps {
  selectedPhotos: Photo[];
  signedUrls: Record<string, string>;
  photoNumberMap: Record<string, number>;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  isMobile: boolean;
}

export function FinalizeStepFeedback({
  selectedPhotos,
  signedUrls,
  photoNumberMap,
  feedback,
  onFeedbackChange,
  isMobile,
}: FinalizeStepFeedbackProps) {
  return (
    <div className="py-6 space-y-8">
      {/* Selected Photos Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-semibold">Ausgewählte Fotos</Label>
          <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
            {selectedPhotos.length} Fotos
          </span>
        </div>
        <div className={cn(
          "grid gap-3 max-h-72 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-2xl",
          isMobile ? "grid-cols-2" : "grid-cols-4"
        )}>
          {selectedPhotos.map((photo) => (
            <div 
              key={photo.id} 
              className="relative aspect-square rounded-xl overflow-hidden shadow-neu-flat-sm hover:scale-105 transition-transform group"
            >
              <img
                src={signedUrls[photo.id] || photo.storage_url}
                alt={photo.filename}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Textarea */}
      <div className="space-y-3">
        <Label htmlFor="feedback" className="text-base font-semibold">
          Ihr Feedback <span className="text-muted-foreground font-normal">(Optional)</span>
        </Label>
        <Textarea
          id="feedback"
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Ihr Feedback hilft uns, zukünftige Shootings zu verbessern..."
          rows={4}
          className="resize-none shadow-neu-pressed rounded-2xl"
        />
      </div>
    </div>
  );
}
