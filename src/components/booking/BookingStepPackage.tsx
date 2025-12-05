import { Check, Image, Clock, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBooking } from '@/contexts/BookingContext';
import { PACKAGES, UPGRADES, PackageOption, UpgradeOption } from '@/constants/booking';
import { cn } from '@/lib/utils';

export function BookingStepPackage() {
  const { currentProperty, setPackage, toggleUpgrade, nextStep, prevStep, getTotalPrice, getTotalDuration } = useBooking();
  const serviceType = currentProperty.serviceType;

  if (!serviceType) return null;

  const packages = PACKAGES[serviceType as keyof typeof PACKAGES] || [];

  return (
    <div className="flex flex-col items-center min-h-[400px] px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Paket & Extras wählen
        </h2>
        <p className="text-muted-foreground">
          Wählen Sie Ihr Paket und optionale Zusatzleistungen.
        </p>
      </div>

      {/* Packages */}
      <div className="w-full max-w-3xl mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Pakete
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => {
            const isSelected = currentProperty.package?.id === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => setPackage(pkg as PackageOption)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold">{pkg.name}</h4>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Image className="w-4 h-4" />
                    <span>{pkg.photos} Bilder</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration} Min.</span>
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-primary">
                    <Euro className="w-4 h-4" />
                    <span>{pkg.price} €</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrades */}
      <div className="w-full max-w-3xl mb-8">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Extras (optional)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {UPGRADES.map((upgrade) => {
            const isSelected = currentProperty.upgrades.some(u => u.id === upgrade.id);
            return (
              <button
                key={upgrade.id}
                onClick={() => toggleUpgrade(upgrade as UpgradeOption)}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all',
                  isSelected
                    ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/20'
                    : 'border-border bg-card hover:border-secondary/50'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{upgrade.name}</h4>
                  <Checkbox checked={isSelected} className="pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground mb-2">{upgrade.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">+{upgrade.duration} Min.</span>
                  <span className="font-semibold text-secondary">+{upgrade.price} €</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {currentProperty.package && (
        <div className="w-full max-w-3xl p-4 bg-muted/50 rounded-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Gesamtdauer</p>
              <p className="font-semibold">{getTotalDuration()} Minuten</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Gesamtpreis</p>
              <p className="text-2xl font-bold text-primary">{getTotalPrice()} €</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
          Zurück
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={nextStep}
          disabled={!currentProperty.package}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
