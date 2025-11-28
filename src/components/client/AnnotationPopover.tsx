import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface AnnotationPopoverProps {
  position: { x: number; y: number };
  onSave: (comment: string) => void;
  onCancel: () => void;
}

export function AnnotationPopover({ position, onSave, onCancel }: AnnotationPopoverProps) {
  const [comment, setComment] = useState('');

  const handleSave = () => {
    if (comment.trim()) {
      onSave(comment.trim());
      setComment('');
    }
  };

  // Smart positioning: show below if near top of screen
  const showBelow = position.y < 200;
  
  return (
    <div
      className="absolute z-20 bg-background border-2 border-primary rounded-lg shadow-xl p-4 w-80 max-w-[90vw]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: showBelow 
          ? 'translate(-50%, 12px)' 
          : 'translate(-50%, -100%) translateY(-12px)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Kommentar hinzufügen</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        placeholder="Ihre Anmerkung zu diesem Bereich..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="mb-3"
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button 
          size="sm" 
          onClick={handleSave}
          disabled={!comment.trim()}
        >
          Speichern
        </Button>
      </div>
    </div>
  );
}
