import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { SelectionCelebration } from './SelectionCelebration';
import { useState, useEffect } from 'react';

interface SelectionFooterProps {
  selectedCount: number;
  targetCount: number;
  onFinalize: () => void;
  disabled?: boolean;
}

export function SelectionFooter({ selectedCount, targetCount, onFinalize, disabled }: SelectionFooterProps) {
  const remaining = targetCount - selectedCount;
  const isOver = selectedCount > targetCount;
  const isComplete = selectedCount === targetCount;
  
  const [showCelebration, setShowCelebration] = useState(false);
  const [previousCount, setPreviousCount] = useState(selectedCount);

  useEffect(() => {
    // Show celebration when reaching target for the first time
    if (selectedCount === targetCount && previousCount < targetCount) {
      setShowCelebration(true);
    }
    setPreviousCount(selectedCount);
  }, [selectedCount, targetCount, previousCount]);

  return (
    <>
      <SelectionCelebration show={showCelebration} />
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <div>
              <p className="font-semibold">
                Ausgewählt: {selectedCount} / {targetCount}
              </p>
              {remaining > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sie haben noch {remaining} {remaining === 1 ? 'Foto' : 'Fotos'} in Ihrem Paket
                </p>
              ) : isOver ? (
                <p className="text-sm text-orange-600 font-medium">
                  Sie haben mehr als Ihr Paket ausgewählt. Upgraden Sie jetzt für bessere Preise!
                </p>
              ) : isComplete ? (
                <p className="text-sm text-green-600 font-medium">
                  🎉 Paket vollständig! Sie können Ihre Auswahl noch anpassen.
                </p>
              ) : null}
            </div>
          </div>
          <Button 
            onClick={onFinalize}
            size="lg"
            disabled={selectedCount === 0 || disabled}
          >
            Auswahl abschließen
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
