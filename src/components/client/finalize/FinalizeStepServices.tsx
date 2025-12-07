import { Clock, Home, Sunset, Check, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BlueHourInfoCard } from '../BlueHourInfoCard';
import { cn } from '@/lib/utils';

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

export function FinalizeStepServices({
  selectedServices,
  onToggleService,
  isBlueHourInfoExpanded,
  onToggleBlueHourInfo,
  isMobile,
}: FinalizeStepServicesProps) {
  return (
    <div className="py-6 relative">
      <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
        {/* 24h Lieferung */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat",
            selectedServices.expressDelivery && "ring-2 ring-primary shadow-neu-float"
          )}
          onClick={() => onToggleService('expressDelivery')}
        >
          <CardContent className="p-6 space-y-4 relative">
            <div className="flex items-start justify-between">
              <div className={cn(
                "p-3 rounded-full transition-all duration-300",
                selectedServices.expressDelivery 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                  : "bg-muted shadow-neu-pressed"
              )}>
                <Clock className="h-6 w-6" />
              </div>
              {selectedServices.expressDelivery && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl">24h Lieferung</h3>
              <p className="text-3xl font-bold text-primary">+99€</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Express-Lieferung innerhalb von 24 Stunden
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Virtuelles Staging */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat relative",
            selectedServices.virtualStaging && "ring-2 ring-primary shadow-neu-float"
          )}
          onClick={() => onToggleService('virtualStaging')}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> BELIEBT
            </span>
          </div>
          <CardContent className="p-6 space-y-4 relative pt-8">
            <div className="flex items-start justify-between">
              <div className={cn(
                "p-3 rounded-full transition-all duration-300",
                selectedServices.virtualStaging 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                  : "bg-muted shadow-neu-pressed"
              )}>
                <Home className="h-6 w-6" />
              </div>
              {selectedServices.virtualStaging && (
                <div className="absolute top-8 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl">Virtuelles Staging</h3>
              <p className="text-3xl font-bold text-primary">89€<span className="text-base font-normal">/Bild</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Leere Räume professionell einrichten lassen
              </p>
              <div className="bg-primary/10 px-3 py-2 rounded-xl text-center shadow-neu-pressed">
                <p className="text-xs font-bold text-primary">5 kaufen, 1 gratis!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Virtuelle Blaue Stunde */}
        <Card 
          className={cn(
            "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat",
            selectedServices.blueHour && "ring-2 ring-primary shadow-neu-float"
          )}
          onClick={() => onToggleService('blueHour')}
        >
          <CardContent className="p-6 space-y-4 relative">
            <div className="flex items-start justify-between">
              <div className={cn(
                "p-3 rounded-full transition-all duration-300",
                selectedServices.blueHour 
                  ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                  : "bg-muted shadow-neu-pressed"
              )}>
                <Sunset className="h-6 w-6" />
              </div>
              {selectedServices.blueHour && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Check className="h-5 w-5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-xl">Virtuelle Blaue Stunde</h3>
              <p className="text-3xl font-bold text-primary">+49€<span className="text-base font-normal">/Bild</span></p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                Außenaufnahmen zur goldenen Stunde verwandeln
              </p>
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
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BlueHourInfoCard overlay - covers entire services step */}
      <BlueHourInfoCard
        isExpanded={isBlueHourInfoExpanded}
        onToggle={() => onToggleBlueHourInfo(false)}
      />
    </div>
  );
}
