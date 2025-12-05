import { Camera, Plane, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBooking } from '@/contexts/BookingContext';
import { SERVICES, ServiceType } from '@/constants/booking';
import { cn } from '@/lib/utils';

const iconMap = {
  Camera,
  Plane,
  Package,
};

export function BookingStepService() {
  const { currentProperty, setServiceType, nextStep, prevStep } = useBooking();

  const handleSelect = (serviceId: ServiceType) => {
    setServiceType(serviceId);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
      <div className="text-center mb-8">
        <Camera className="w-16 h-16 mx-auto text-primary mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Shooting Art wählen
        </h2>
        <p className="text-muted-foreground">
          Welche Art von Aufnahmen benötigen Sie?
        </p>
      </div>

      <div className="grid gap-4 w-full max-w-2xl">
        {SERVICES.map((service) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap];
          const isSelected = currentProperty.serviceType === service.id;

          return (
            <button
              key={service.id}
              onClick={() => handleSelect(service.id as ServiceType)}
              className={cn(
                'relative p-6 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{service.name}</h3>
                    {'badge' in service && service.badge && (
                      <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                        {service.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">
                    {service.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ca. {service.baseDuration} Min. Basisdauer
                  </p>
                </div>
                {isSelected && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={prevStep}>
          Zurück
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={nextStep}
          disabled={!currentProperty.serviceType}
        >
          Weiter
        </Button>
      </div>
    </div>
  );
}
