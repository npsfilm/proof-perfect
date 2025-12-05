import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Check, ArrowRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { PACKAGES, ADDONS, STAGING_DISCOUNT } from '@/constants/pricing';

interface CostCalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CostCalculatorModal({ open, onOpenChange }: CostCalculatorModalProps) {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string>(PACKAGES[1].id);
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [stagingCount, setStagingCount] = useState(1);
  const [blueHourCount, setBlueHourCount] = useState(1);

  const selectedPkg = PACKAGES.find(p => p.id === selectedPackage)!;

  const totalPrice = useMemo(() => {
    let total = selectedPkg.price;

    ADDONS.forEach(addon => {
      if (addons[addon.id]) {
        if (addon.id === 'staging') {
          // Apply 5+1 discount
          const paidItems = stagingCount >= STAGING_DISCOUNT.threshold 
            ? stagingCount - STAGING_DISCOUNT.freeItems 
            : stagingCount;
          total += paidItems * addon.price;
        } else if (addon.id === 'blue_hour') {
          total += blueHourCount * addon.price;
        } else {
          total += addon.price;
        }
      }
    });

    return total;
  }, [selectedPkg, addons, stagingCount, blueHourCount]);

  const handleBook = () => {
    onOpenChange(false);
    navigate('/buchung');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            Kostenrechner
          </DialogTitle>
          <DialogDescription>
            Berechnen Sie die Kosten für Ihr Shooting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Package Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Paket wählen</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PACKAGES.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md',
                    selectedPackage === pkg.id
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="font-semibold text-foreground">{pkg.name}</div>
                    <div className="text-2xl font-bold text-primary mt-1">{pkg.price}€</div>
                    <div className="text-xs text-muted-foreground mt-1">{pkg.photos} Fotos</div>
                    {selectedPackage === pkg.id && (
                      <div className="mt-2 flex justify-center">
                        <Check className="h-4 w-4 text-primary animate-scale-in" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add-ons */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Zusatzleistungen</Label>
            
            {ADDONS.map((addon) => (
              <div key={addon.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      id={addon.id}
                      checked={addons[addon.id] || false}
                      onCheckedChange={(checked) => 
                        setAddons(prev => ({ ...prev, [addon.id]: checked }))
                      }
                    />
                    <div>
                      <Label htmlFor={addon.id} className="cursor-pointer font-medium">
                        {addon.name}
                        {addon.id === 'staging' && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            {STAGING_DISCOUNT.description}
                          </Badge>
                        )}
                      </Label>
                      <p className="text-xs text-muted-foreground">{addon.description}</p>
                    </div>
                  </div>
                  <div className="text-right font-semibold">
                    {addon.price}€
                    {'perPhoto' in addon && addon.perPhoto && <span className="text-xs text-muted-foreground">/Stk.</span>}
                  </div>
                </div>

                {/* Quantity sliders for per-photo addons */}
                {addon.id === 'staging' && addons[addon.id] && (
                  <div className="ml-10 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span>Anzahl Räume</span>
                      <span className="font-medium">{stagingCount}</span>
                    </div>
                    <Slider
                      value={[stagingCount]}
                      onValueChange={([v]) => setStagingCount(v)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    {stagingCount >= STAGING_DISCOUNT.threshold && (
                      <p className="text-xs text-secondary font-medium animate-fade-in">
                        🎉 1 Raum gratis! Sie sparen 89€
                      </p>
                    )}
                  </div>
                )}

                {addon.id === 'blue_hour' && addons[addon.id] && (
                  <div className="ml-10 space-y-2 animate-fade-in">
                    <div className="flex justify-between text-sm">
                      <span>Anzahl Bilder</span>
                      <span className="font-medium">{blueHourCount}</span>
                    </div>
                    <Slider
                      value={[blueHourCount]}
                      onValueChange={([v]) => setBlueHourCount(v)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="bg-muted/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Geschätzter Gesamtpreis</div>
                <div className="text-3xl font-bold text-primary">{totalPrice}€</div>
              </div>
              <Button size="lg" onClick={handleBook} className="gap-2">
                Jetzt buchen
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              * Endpreis kann je nach Objektgröße und Anforderungen variieren
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
