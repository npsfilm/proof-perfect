import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/calculator/pricing';
import * as Icons from 'lucide-react';

interface UpgradeCardProps {
  name: string;
  description: string;
  priceCents: number;
  iconName?: string;
  isSelected: boolean;
  isPerImage?: boolean;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  onToggle: () => void;
  onQuantityChange?: (quantity: number) => void;
}

export function UpgradeCard({
  name,
  description,
  priceCents,
  iconName,
  isSelected,
  isPerImage,
  quantity = 1,
  minQuantity = 1,
  maxQuantity = 10,
  onToggle,
  onQuantityChange,
}: UpgradeCardProps) {
  // Dynamic icon loading
  const IconComponent = iconName 
    ? (Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>) 
    : null;

  const displayPrice = isPerImage && isSelected ? priceCents * quantity : priceCents;

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border-2 transition-all',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={cn(
            'mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
            isSelected
              ? 'bg-primary border-primary'
              : 'border-muted-foreground/50 hover:border-primary'
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {IconComponent && (
              <IconComponent className="h-4 w-4 text-primary flex-shrink-0" />
            )}
            <h4 className="font-medium text-foreground">{name}</h4>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>

          {/* Quantity selector for per-image upgrades */}
          {isPerImage && isSelected && onQuantityChange && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Anzahl Bilder:</span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onQuantityChange(Math.max(minQuantity, quantity - 1))}
                  disabled={quantity <= minQuantity}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <div className="font-semibold text-primary">
            +{formatPrice(displayPrice)}
          </div>
          {isPerImage && (
            <div className="text-xs text-muted-foreground">pro Bild</div>
          )}
        </div>
      </div>
    </div>
  );
}
