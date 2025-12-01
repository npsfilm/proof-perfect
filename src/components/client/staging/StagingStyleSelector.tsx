import { STAGING_STYLES } from '@/constants/staging';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

interface StagingStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StagingStyleSelector({ value, onChange }: StagingStyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {STAGING_STYLES.map((style) => {
        const isSelected = value === style;

        return (
          <Card
            key={style}
            className={`cursor-pointer transition-all hover:shadow-neu-float ${
              isSelected
                ? 'ring-2 ring-primary shadow-neu-float'
                : 'shadow-neu-flat'
            }`}
            onClick={() => onChange(style)}
          >
            <div className="p-4 flex flex-col items-center gap-3">
              {isSelected ? (
                <CheckCircle2 className="h-8 w-8 text-primary" />
              ) : (
                <Circle className="h-8 w-8 text-muted-foreground" />
              )}
              <span className={`text-sm font-medium text-center ${
                isSelected ? 'text-primary' : 'text-foreground'
              }`}>
                {style}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
