import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/calculator/pricing';

interface PackageCardProps {
  name: string;
  photoCount: number;
  priceCents: number;
  features: string[];
  isSelected: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  travelCostIncluded?: boolean;
}

export function PackageCard({
  name,
  photoCount,
  priceCents,
  features,
  isSelected,
  isPopular,
  onSelect,
  travelCostIncluded = true,
}: PackageCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative p-4 md:p-6 rounded-lg border-2 text-left transition-all w-full',
        'hover:border-primary/50 hover:shadow-md',
        isSelected
          ? 'border-primary bg-primary/5 shadow-md animate-glow-border'
          : 'border-border bg-card'
      )}
    >
      {/* Popular badge */}
      {isPopular && (
        <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
          BELIEBT
        </Badge>
      )}

      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-check-in">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}

      {/* Package name */}
      <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>

      {/* Photo count */}
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-bold text-primary">{photoCount}</span>
        <span className="text-muted-foreground">Bilder</span>
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Price */}
      <div className="mt-auto pt-4 border-t">
        <div className="text-2xl font-bold text-foreground">
          {formatPrice(priceCents)}
        </div>
        {travelCostIncluded && (
          <div className="text-sm text-orange-600 font-medium">
            Inklusive Anfahrt
          </div>
        )}
      </div>
    </button>
  );
}
