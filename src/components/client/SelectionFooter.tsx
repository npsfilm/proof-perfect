import { Button } from '@/components/ui/button';

interface SelectionFooterProps {
  selectedCount: number;
  targetCount: number;
  onFinalize: () => void;
  disabled?: boolean;
}

export function SelectionFooter({ selectedCount, targetCount, onFinalize, disabled }: SelectionFooterProps) {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-lg font-medium">
              {selectedCount} ausgewählt
            </span>
            <Button 
              onClick={onFinalize}
              size="lg"
              disabled={selectedCount === 0 || disabled}
              className="whitespace-nowrap"
            >
              Auswahl abschließen
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
