import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: number | string;
  badgeVariant?: 'default' | 'secondary' | 'destructive';
  onClick: () => void;
  gradient?: string;
  disabled?: boolean;
}

export function QuickActionCard({
  icon: Icon,
  title,
  description,
  badge,
  badgeVariant = 'secondary',
  onClick,
  gradient = 'from-primary/5 to-primary/10',
  disabled = false,
}: QuickActionCardProps) {
  return (
    <Card
      className={cn(
        'group relative overflow-hidden cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:scale-[1.02] hover:border-primary/30',
        'active:scale-[0.98]',
        disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
      )}
      onClick={disabled ? undefined : onClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Gradient background */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        gradient
      )} />

      <CardContent className="relative p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1.5 sm:space-y-2 md:space-y-3 min-w-0">
            {/* Icon */}
            <div className={cn(
              'inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl',
              'bg-primary/10 text-primary',
              'group-hover:bg-primary group-hover:text-primary-foreground',
              'transition-colors duration-300'
            )}>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            </div>

            {/* Text */}
            <div className="space-y-0.5">
              <h3 className="font-semibold text-xs sm:text-sm md:text-lg text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                {title}
              </h3>
              <p className="hidden sm:block text-xs md:text-sm text-muted-foreground line-clamp-1">
                {description}
              </p>
            </div>
          </div>

          {/* Badge */}
          {badge !== undefined && (
            <Badge 
              variant={badgeVariant}
              className="shrink-0 animate-scale-in"
            >
              {badge}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
