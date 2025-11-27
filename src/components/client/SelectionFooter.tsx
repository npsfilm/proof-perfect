import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface SelectionFooterProps {
  selectedCount: number;
  targetCount: number;
  onFinalize: () => void;
  disabled?: boolean;
}

export function SelectionFooter({ selectedCount, targetCount, onFinalize, disabled }: SelectionFooterProps) {
  const remaining = targetCount - selectedCount;
  const isOver = selectedCount > targetCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <div>
              <p className="font-semibold">
                Selected: {selectedCount} / {targetCount}
              </p>
              {remaining > 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have {remaining} {remaining === 1 ? 'photo' : 'photos'} left in your package
                </p>
              ) : isOver ? (
                <p className="text-sm text-orange-600 font-medium">
                  You've selected more than your package. Upgrade now for better pricing!
                </p>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  Package complete! You can still adjust your selection.
                </p>
              )}
            </div>
          </div>
          <Button 
            onClick={onFinalize}
            size="lg"
            disabled={selectedCount === 0 || disabled}
          >
            Finalize Selection
          </Button>
        </div>
      </div>
    </div>
  );
}
