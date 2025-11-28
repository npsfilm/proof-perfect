import { PhotoAnnotation } from '@/types/database';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface AnnotationMarkerProps {
  annotation: PhotoAnnotation;
  number: number;
  isOwner: boolean;
  onDelete: (id: string) => void;
  containerSize: { width: number; height: number };
}

export function AnnotationMarker({
  annotation,
  number,
  isOwner,
  onDelete,
  containerSize,
}: AnnotationMarkerProps) {
  const left = (annotation.x_position / 100) * containerSize.width;
  const top = (annotation.y_position / 100) * containerSize.height;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "absolute w-8 h-8 rounded-full border-2 border-white shadow-lg",
            "flex items-center justify-center text-white font-bold text-sm",
            "bg-primary hover:bg-primary/90 transition-all hover:scale-110",
            "cursor-pointer z-10"
          )}
          style={{
            left: `${left}px`,
            top: `${top}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {number}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80" 
        onClick={(e) => e.stopPropagation()}
        side="top"
        align="start"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm flex-1">{annotation.comment}</p>
            {isOwner && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={() => onDelete(annotation.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {new Date(annotation.created_at).toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
