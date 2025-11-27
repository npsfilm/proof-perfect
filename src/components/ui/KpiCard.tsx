import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  description?: string;
  className?: string;
}

export function KpiCard({ icon: Icon, label, value, description, className }: KpiCardProps) {
  return (
    <Card className={cn("shadow-neu-flat hover:shadow-neu-flat-sm transition-all duration-200", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString('de-DE')}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
