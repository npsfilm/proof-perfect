import { Clock, Home, Sunset, Check, Sparkles, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlueHourInfoCard } from '../BlueHourInfoCard';
import { cn } from '@/lib/utils';
import { useServices, Service } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';
import { Skeleton } from '@/components/ui/skeleton';

interface FinalizeStepServicesProps {
  selectedServices: {
    expressDelivery: boolean;
    virtualStaging: boolean;
    blueHour: boolean;
  };
  onToggleService: (service: 'expressDelivery' | 'virtualStaging' | 'blueHour') => void;
  isBlueHourInfoExpanded: boolean;
  onToggleBlueHourInfo: (expanded: boolean) => void;
  isMobile: boolean;
}

// Map service slugs to state keys
const SERVICE_SLUG_MAP: Record<string, keyof FinalizeStepServicesProps['selectedServices']> = {
  'express-delivery': 'expressDelivery',
  '24h-lieferung': 'expressDelivery',
  'virtual-staging': 'virtualStaging',
  'virtuelles-staging': 'virtualStaging',
  'blue-hour': 'blueHour',
  'virtuelle-blaue-stunde': 'blueHour',
};

// Get icon component from name
function getIconComponent(iconName: string | null): React.ComponentType<{ className?: string }> {
  if (!iconName) return Clock;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || Clock;
}

export function FinalizeStepServices({
  selectedServices,
  onToggleService,
  isBlueHourInfoExpanded,
  onToggleBlueHourInfo,
  isMobile,
}: FinalizeStepServicesProps) {
  const { data: services, isLoading } = useServices({ showIn: 'finalize' });
  const { data: discounts } = useDiscounts();

  // Find discount for staging service
  const stagingDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );

  if (isLoading) {
    return (
      <div className="py-6">
        <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
          {[1, 2, 3].map(i => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 relative">
      <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
        {services?.map((service) => {
          const stateKey = SERVICE_SLUG_MAP[service.slug];
          if (!stateKey) return null;
          
          const isSelected = selectedServices[stateKey];
          const Icon = getIconComponent(service.icon_name);
          const priceInEuros = service.price_cents / 100;
          const isPerImage = service.price_type === 'per_image';
          const isPopular = service.is_popular;
          const isBlueHourService = stateKey === 'blueHour';
          const isStagingService = stateKey === 'virtualStaging';

          return (
            <Card 
              key={service.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-sm",
                isSelected && "ring-2 ring-primary shadow-md",
                isPopular && "relative"
              )}
              onClick={() => onToggleService(stateKey)}
            >
              {isPopular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> BELIEBT
                  </span>
                </div>
              )}
              <CardContent className={cn("p-6 space-y-4 relative", isPopular && "pt-8")}>
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "p-3 rounded-full transition-all duration-300",
                    isSelected 
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                      : "bg-muted"
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  {isSelected && (
                    <div className={cn(
                      "absolute right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg",
                      isPopular ? "top-8" : "top-4"
                    )}>
                      <Check className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-xl">{service.name}</h3>
                  <p className="text-3xl font-bold text-primary">
                    +{priceInEuros}€
                    {isPerImage && <span className="text-base font-normal">/Bild</span>}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  
                  {/* Staging discount badge */}
                  {isStagingService && stagingDiscount && (
                    <div className="bg-primary/10 px-3 py-2 rounded-xl text-center">
                      <p className="text-xs font-bold text-primary">
                        {stagingDiscount.buy_quantity} kaufen, {stagingDiscount.free_quantity} gratis!
                      </p>
                    </div>
                  )}

                  {/* Blue Hour examples button */}
                  {isBlueHourService && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleBlueHourInfo(!isBlueHourInfoExpanded);
                        }}
                      >
                        <Info className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Beispiele ansehen
                        </span>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* BlueHourInfoCard overlay - covers entire services step */}
      <BlueHourInfoCard
        isExpanded={isBlueHourInfoExpanded}
        onToggle={() => onToggleBlueHourInfo(false)}
      />
    </div>
  );
}
