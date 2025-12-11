import { useRoomTypes } from '@/hooks/useRoomTypes';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { Sofa } from 'lucide-react';

interface RoomTypeSelectorProps {
  value: string | null;
  onChange: (value: string) => void;
}

// Get icon component from name
function getIconComponent(iconName: string | null): React.ComponentType<{ className?: string }> {
  if (!iconName) return Sofa;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Sofa;
}

export function RoomTypeSelector({ value, onChange }: RoomTypeSelectorProps) {
  const { data: roomTypes, isLoading } = useRoomTypes();

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-[70px] w-[70px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {roomTypes?.map((room) => {
        const Icon = getIconComponent(room.icon_name);
        const isSelected = value === room.slug;

        return (
          <Tooltip key={room.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onChange(room.slug)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[70px]',
                  'hover:border-primary/50 hover:bg-accent/50',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected && 'text-primary')} />
                <span className="text-[10px] font-medium">{room.name}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{room.name} einrichten</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
