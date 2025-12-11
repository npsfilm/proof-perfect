import { useStagingStyles } from '@/hooks/useStagingStyles';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StyleGalleryProps {
  value: string | null;
  onChange: (value: string) => void;
}

export function StyleGallery({ value, onChange }: StyleGalleryProps) {
  const { data: styles, isLoading } = useStagingStyles();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {styles?.map((style) => {
        const isSelected = value === style.slug;
        const colorClass = style.color_class || 'bg-muted';

        return (
          <button
            key={style.id}
            type="button"
            onClick={() => onChange(style.slug)}
            className={cn(
              'relative flex flex-col items-center rounded-lg overflow-hidden border-2 transition-all',
              'hover:border-primary/50 hover:shadow-md',
              isSelected
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border'
            )}
          >
            {/* Style preview - use thumbnail or color placeholder */}
            <div className={cn('w-full aspect-square flex items-center justify-center overflow-hidden', !style.thumbnail_url && colorClass)}>
              {style.thumbnail_url ? (
                <img 
                  src={style.thumbnail_url} 
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-muted-foreground/60 font-medium">
                  {style.name.charAt(0)}
                </span>
              )}
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
                {style.name}
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
