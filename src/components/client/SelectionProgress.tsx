import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle } from 'lucide-react';

interface SelectionProgressProps {
  selectedCount: number;
  targetCount: number;
}

const MILESTONES = [
  { key: 'start', label: 'Start', percentage: 0 },
  { key: 'first', label: 'Erstes Foto', percentage: 1 },
  { key: 'halfway', label: 'Halbzeit', percentage: 50 },
  { key: 'complete', label: 'Fertig', percentage: 100 },
];

export function SelectionProgress({ selectedCount, targetCount }: SelectionProgressProps) {
  const percentage = Math.min((selectedCount / targetCount) * 100, 100);
  const isOver = selectedCount > targetCount;
  const isComplete = selectedCount === targetCount;

  // Determine color based on progress
  const getProgressColor = () => {
    if (isOver) return 'bg-orange-500';
    if (isComplete) return 'bg-green-500';
    return 'bg-primary';
  };

  // Get dynamic status message
  const getStatusMessage = () => {
    if (isOver) {
      return `+${selectedCount - targetCount} über Paket`;
    }
    if (isComplete) {
      return 'Paket vollständig!';
    }
    if (percentage >= 75) {
      return 'Fast geschafft!';
    }
    if (percentage >= 50) {
      return 'Über die Hälfte!';
    }
    if (percentage >= 25) {
      return 'Guter Fortschritt!';
    }
    if (selectedCount > 0) {
      return 'Weiter so!';
    }
    return 'Beginnen Sie mit der Auswahl';
  };

  const getMilestonePosition = (milestonePercentage: number) => {
    if (milestonePercentage === 0) return 0;
    if (milestonePercentage === 100) return 100;
    return (milestonePercentage / 100) * 100;
  };

  const isMilestoneReached = (milestonePercentage: number) => {
    if (milestonePercentage === 1) {
      return selectedCount >= 1;
    }
    return percentage >= milestonePercentage;
  };

  return (
    <div className="space-y-3">
      {/* Progress bar with milestones */}
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-3 bg-muted"
        />
        
        {/* Custom indicator color overlay */}
        <div 
          className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />

        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center justify-between px-[2px]">
          {MILESTONES.map((milestone) => {
            const reached = isMilestoneReached(milestone.percentage);
            const position = getMilestonePosition(milestone.percentage);
            
            return (
              <div
                key={milestone.key}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${position}%` }}
              >
                <div className={`
                  h-6 w-6 rounded-full border-2 bg-background flex items-center justify-center
                  transition-all duration-300
                  ${reached 
                    ? 'border-primary scale-110' 
                    : 'border-muted-foreground/30 scale-100'
                  }
                `}>
                  {reached ? (
                    <CheckCircle className="h-4 w-4 text-primary fill-primary" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/30" />
                  )}
                </div>
                <span className={`
                  text-xs mt-1 whitespace-nowrap transition-colors
                  ${reached ? 'text-foreground font-medium' : 'text-muted-foreground'}
                `}>
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats and status */}
      <div className="flex items-center justify-between pt-6">
        <div>
          <p className="text-2xl font-bold">
            {selectedCount} <span className="text-muted-foreground text-base font-normal">/ {targetCount}</span>
          </p>
          <p className={`text-sm transition-colors ${
            isOver ? 'text-orange-600 font-medium' : 
            isComplete ? 'text-green-600 font-medium' : 
            'text-muted-foreground'
          }`}>
            {getStatusMessage()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {Math.round(percentage)}%
          </p>
          <p className="text-xs text-muted-foreground">
            Fortschritt
          </p>
        </div>
      </div>
    </div>
  );
}
