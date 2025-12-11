import { Card, CardContent } from '@/components/ui/card';
import { Euro } from 'lucide-react';
import { useAnsprache } from '@/contexts/AnspracheContext';
import { useDiscounts } from '@/hooks/useDiscounts';

interface StagingPricingSummaryProps {
  photoCount: number;
  basePrice: number;
  totalPrice: number;
}

export function StagingPricingSummary({
  photoCount,
  basePrice,
  totalPrice,
}: StagingPricingSummaryProps) {
  const { t } = useAnsprache();
  const { data: discounts } = useDiscounts();

  // Get discount info from database
  const stagingDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );
  const buyQuantity = stagingDiscount?.buy_quantity || 5;
  const freeQuantity = stagingDiscount?.free_quantity || 1;
  const discountThreshold = buyQuantity + freeQuantity;

  // Calculate free photos based on discount
  const discountSets = Math.floor(photoCount / discountThreshold);
  const remainingPhotos = photoCount % discountThreshold;
  const freePhotos = discountSets * freeQuantity + (remainingPhotos > buyQuantity ? remainingPhotos - buyQuantity : 0);
  const hasBulkDiscount = freePhotos > 0;
  const savings = freePhotos * basePrice;

  return (
    <Card className="shadow-sm bg-primary/5">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Euro className="h-5 w-5 text-primary" />
            <span>Preisübersicht</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {photoCount} × Virtuelles Staging @ {basePrice}€
              </span>
              <span className="font-medium">
                {photoCount * basePrice}€
              </span>
            </div>

            {hasBulkDiscount && (
              <div className="flex justify-between text-primary">
                <span>
                  {buyQuantity}+{freeQuantity} Rabatt ({freePhotos} {freePhotos === 1 ? 'Foto' : 'Fotos'} gratis)
                </span>
                <span className="font-medium">
                  -{savings}€
                </span>
              </div>
            )}

            <div className="h-px bg-border my-2" />

            <div className="flex justify-between text-base font-bold">
              <span>Gesamt:</span>
              <span className="text-primary">{totalPrice}€</span>
            </div>
          </div>

          {hasBulkDiscount && (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              🎉 {t(`Du sparst ${savings}€ mit dem ${buyQuantity}+${freeQuantity} Angebot!`, `Sie sparen ${savings}€ mit dem ${buyQuantity}+${freeQuantity} Angebot!`)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
