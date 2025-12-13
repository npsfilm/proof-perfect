import { formatPrice, formatPriceWithDecimals, type PriceBreakdown } from '@/lib/calculator/pricing';

interface PriceDisplayProps {
  breakdown: PriceBreakdown;
  showBreakdown?: boolean;
  compact?: boolean;
}

export function PriceDisplay({ breakdown, showBreakdown = true, compact = false }: PriceDisplayProps) {
  if (compact) {
    return (
      <div className="text-right">
        <div className="text-2xl font-bold text-foreground">
          {formatPrice(breakdown.netPriceCents)}
        </div>
        <div className="text-sm text-muted-foreground">
          netto zzgl. MwSt.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showBreakdown && (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Paket</span>
            <span>{formatPrice(breakdown.packagePriceCents)}</span>
          </div>
          {breakdown.travelCostCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Anfahrt (inklusive)</span>
              <span className="text-orange-600">{formatPrice(breakdown.travelCostCents)}</span>
            </div>
          )}
          {breakdown.upgradesCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Upgrades</span>
              <span>{formatPrice(breakdown.upgradesCents)}</span>
            </div>
          )}
          {breakdown.stagingCents > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Virtuelles Staging</span>
              <span>{formatPrice(breakdown.stagingCents)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2" />
        </>
      )}
      
      <div className="flex justify-between">
        <span className="font-medium">Netto</span>
        <span className="text-xl font-bold">{formatPriceWithDecimals(breakdown.netPriceCents)}</span>
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>zzgl. MwSt. (19%)</span>
        <span>{formatPriceWithDecimals(breakdown.vatCents)}</span>
      </div>
      <div className="flex justify-between font-semibold border-t pt-2">
        <span>Gesamt (brutto)</span>
        <span className="text-lg">{formatPriceWithDecimals(breakdown.grossPriceCents)}</span>
      </div>
    </div>
  );
}
