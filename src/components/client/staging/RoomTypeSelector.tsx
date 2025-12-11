import { ROOM_TYPES, RoomType } from '@/constants/staging';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RoomTypeSelectorProps {
  value: RoomType | null;
  onChange: (value: RoomType) => void;
}

export function RoomTypeSelector({ value, onChange }: RoomTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROOM_TYPES.map((room) => {
        const Icon = room.icon;
        const isSelected = value === room.id;

        return (
          <Tooltip key={room.id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onChange(room.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[70px]',
                  'hover:border-primary/50 hover:bg-accent/50',
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', isSelected && 'text-primary')} />
                <span className="text-[10px] font-medium">{room.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{room.label} einrichten</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
