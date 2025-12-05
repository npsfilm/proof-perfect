import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryCompactCardProps {
  name: string;
  status: string;
  photosCount: number;
  selectedCount: number;
  buttonLabel: string;
  buttonIcon: LucideIcon;
  buttonAction: () => void;
  buttonDisabled?: boolean;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  isNew?: boolean;
}

export function GalleryCompactCard({
  name,
  status,
  photosCount,
  selectedCount,
  buttonLabel,
  buttonIcon: ButtonIcon,
  buttonAction,
  buttonDisabled,
  buttonVariant = 'outline',
  isNew = false,
}: GalleryCompactCardProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Planning': return 'Planung';
      case 'Open': return 'Offen';
      case 'Closed': return 'Geschlossen';
      case 'Processing': return 'Bearbeitung';
      case 'Delivered': return 'Geliefert';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-secondary/20 text-secondary-foreground';
      case 'Closed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-200",
      isNew && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )}>
      {/* Gallery Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate mb-2">
          {name}
        </h3>
        <div className="flex items-center gap-3">
          <Badge 
            variant="secondary" 
            className={cn("rounded-full text-xs", getStatusColor(status))}
          >
            {getStatusLabel(status)}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedCount} / {photosCount} Fotos
          </span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={buttonAction}
        disabled={buttonDisabled}
        variant={buttonVariant}
        size="sm"
        className="ml-4 gap-2 flex-shrink-0"
      >
        <ButtonIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{buttonLabel}</span>
      </Button>
    </div>
  );
}
