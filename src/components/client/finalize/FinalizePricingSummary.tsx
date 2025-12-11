import { useAnsprache } from '@/contexts/AnspracheContext';
import { useServices } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';

interface FinalizePricingSummaryProps {
  expressDelivery: boolean;
  stagingCount: number;
  blueHourCount: number;
}

export function FinalizePricingSummary({ 
  expressDelivery, 
  stagingCount, 
  blueHourCount 
}: FinalizePricingSummaryProps) {
  const { t } = useAnsprache();
  const { data: services } = useServices({ showIn: 'finalize' });
  const { data: discounts } = useDiscounts();
  
  const hasAnyService = expressDelivery || stagingCount > 0 || blueHourCount > 0;
  
  if (!hasAnyService) return null;

  // Get prices from database
  const expressService = services?.find(s => 
    s.slug === 'express-delivery' || s.slug === '24h-lieferung'
  );
  const stagingService = services?.find(s => 
    s.slug === 'virtuelles-staging' || s.slug === 'virtual-staging'
  );
  const blueHourService = services?.find(s => 
    s.slug === 'virtuelle-blaue-stunde' || s.slug === 'blue-hour'
  );

  const expressPricePerUnit = expressService ? expressService.price_cents / 100 : 99;
  const stagingPricePerUnit = stagingService ? stagingService.price_cents / 100 : 89;
  const blueHourPricePerUnit = blueHourService ? blueHourService.price_cents / 100 : 49;

  // Get discount info from database
  const stagingDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );
  const buyQuantity = stagingDiscount?.buy_quantity || 5;
  const freeQuantity = stagingDiscount?.free_quantity || 1;
  const discountThreshold = buyQuantity + freeQuantity;

  // Calculate prices
  const expressPrice = expressDelivery ? expressPricePerUnit : 0;
  const stagingPrice = stagingCount * stagingPricePerUnit;
  
  // Calculate discount
  const discountSets = Math.floor(stagingCount / discountThreshold);
  const remainingPhotos = stagingCount % discountThreshold;
  const freePhotos = discountSets * freeQuantity + (remainingPhotos > buyQuantity ? remainingPhotos - buyQuantity : 0);
  const stagingDiscountAmount = freePhotos * stagingPricePerUnit;
  const stagingTotal = stagingPrice - stagingDiscountAmount;
  
  const blueHourPrice = blueHourCount * blueHourPricePerUnit;
  const totalPrice = expressPrice + stagingTotal + blueHourPrice;

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Zusätzliche Kosten:</span>
          <div className="text-right space-y-1">
            {expressDelivery && (
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">24h Lieferung</span>
                <span className="font-medium">+{expressPricePerUnit}€</span>
              </div>
            )}
            {stagingCount > 0 && (
              <>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">{stagingCount} × Staging</span>
                  <span className="font-medium">{stagingPrice}€</span>
                </div>
                {stagingDiscountAmount > 0 && (
                  <div className="flex justify-between gap-8 text-green-600">
                    <span>Rabatt ({buyQuantity}+{freeQuantity} Gratis)</span>
                    <span>-{stagingDiscountAmount}€</span>
                  </div>
                )}
              </>
            )}
            {blueHourCount > 0 && (
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">{blueHourCount} × Blaue Stunde</span>
                <span className="font-medium">{blueHourPrice}€</span>
              </div>
            )}
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Zusatz gesamt:</span>
          <span className="text-2xl font-bold text-primary">{totalPrice}€</span>
        </div>
        {stagingDiscountAmount > 0 && (
          <p className="text-xs text-center text-green-600 font-medium">
            🎉 {t(`Du sparst ${stagingDiscountAmount}€ mit dem ${buyQuantity}+${freeQuantity} Rabatt!`, `Sie sparen ${stagingDiscountAmount}€ mit dem ${buyQuantity}+${freeQuantity} Rabatt!`)}
          </p>
        )}
      </div>
    </div>
  );
}
