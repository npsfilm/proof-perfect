import { Card, CardContent } from '@/components/ui/card';
import { Euro } from 'lucide-react';

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
  const hasBulkDiscount = photoCount >= 6;
  const freePhotos = Math.floor(photoCount / 6);

  return (
    <Card className="shadow-neu-flat bg-primary/5">
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
                  5+1 Rabatt ({freePhotos} {freePhotos === 1 ? 'Foto' : 'Fotos'} gratis)
                </span>
                <span className="font-medium">
                  -{freePhotos * basePrice}€
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
              🎉 Sie sparen {freePhotos * basePrice}€ mit dem 5+1 Angebot!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
