import { STAGING_STYLE_OPTIONS, StagingStyleOption } from '@/constants/staging';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StyleGalleryProps {
  value: StagingStyleOption | null;
  onChange: (value: StagingStyleOption) => void;
}

export function StyleGallery({ value, onChange }: StyleGalleryProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {STAGING_STYLE_OPTIONS.map((style) => {
        const isSelected = value === style.id;

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.id)}
            className={cn(
              'relative flex flex-col items-center rounded-lg overflow-hidden border-2 transition-all',
              'hover:border-primary/50 hover:shadow-md',
              isSelected
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
            )}
          >
            {/* Style preview placeholder */}
            <div className={cn('w-full aspect-square', style.color, 'flex items-center justify-center')}>
              <span className="text-xs text-muted-foreground/60 font-medium">
                {style.label.charAt(0)}
              </span>
            </div>
            
            {/* Label */}
            <div className={cn(
              'w-full py-1.5 px-1 text-center bg-background',
              isSelected && 'bg-primary/5'
            )}>
              <span className={cn(
                'text-[10px] font-medium',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {style.label}
              </span>
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
