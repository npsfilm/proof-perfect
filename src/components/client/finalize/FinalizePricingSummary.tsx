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
  const hasAnyService = expressDelivery || stagingCount > 0 || blueHourCount > 0;
  
  if (!hasAnyService) return null;

  const expressPrice = expressDelivery ? 99 : 0;
  const stagingPrice = stagingCount * 89;
  const stagingDiscount = Math.floor(stagingCount / 6) * 89;
  const stagingTotal = stagingPrice - stagingDiscount;
  const blueHourPrice = blueHourCount * 49;
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
                <span className="font-medium">+99€</span>
              </div>
            )}
            {stagingCount > 0 && (
              <>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">{stagingCount} × Staging</span>
                  <span className="font-medium">{stagingPrice}€</span>
                </div>
                {stagingDiscount > 0 && (
                  <div className="flex justify-between gap-8 text-green-600">
                    <span>Rabatt (5+1 Gratis)</span>
                    <span>-{stagingDiscount}€</span>
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
        {stagingDiscount > 0 && (
          <p className="text-xs text-center text-green-600 font-medium">
            🎉 Sie sparen {stagingDiscount}€ mit dem 5+1 Rabatt!
          </p>
        )}
      </div>
    </div>
  );
}
