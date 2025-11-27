import { Button } from '@/components/ui/button';
import { SelectionCelebration } from './SelectionCelebration';
import { SelectionProgress } from './SelectionProgress';
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1 w-full">
              <SelectionProgress 
                selectedCount={selectedCount}
                targetCount={targetCount}
              />
            </div>
            <Button 
              onClick={onFinalize}
              size="lg"
              disabled={selectedCount === 0 || disabled}
              className="w-full lg:w-auto"
            >
              Auswahl abschließen
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
