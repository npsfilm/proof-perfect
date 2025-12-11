import { useStagingStyles } from '@/hooks/useStagingStyles';
import { cn } from '@/lib/utils';
import { Check, ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface StagingStyleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function StagingStyleSelector({ value, onChange }: StagingStyleSelectorProps) {
  const { data: styles, isLoading } = useStagingStyles();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="aspect-[4/3] rounded-lg" />
        ))}
      </div>
    );
  }

  // Filter to only active styles
  const activeStyles = styles?.filter(s => s.is_active !== false) || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {activeStyles.map((style) => {
        const isSelected = value === style.slug || value === style.name;

        return (
          <button
            key={style.id}
            type="button"
            className={cn(
              "relative rounded-lg overflow-hidden border-2 transition-all",
              "hover:border-primary/50 hover:shadow-md",
              isSelected
                ? "ring-2 ring-primary border-primary shadow-lg"
                : "border-border"
            )}
            onClick={() => onChange(style.slug)}
          >
            {style.thumbnail_url ? (
              <img
                src={style.thumbnail_url}
                alt={style.name}
                className="w-full aspect-[4/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            
            <div className={cn(
              "py-2 px-1 text-center bg-background",
              isSelected && "bg-primary/5"
            )}>
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {style.name}
              </span>
            </div>

            {isSelected && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <Check className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
