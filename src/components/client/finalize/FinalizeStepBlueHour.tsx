import { Sunset, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/types/database';
import { FinalizePricingSummary } from './FinalizePricingSummary';
import { cn } from '@/lib/utils';

interface FinalizeStepBlueHourProps {
  selectedPhotos: Photo[];
  signedUrls: Record<string, string>;
  photoNumberMap: Record<string, number>;
  blueHourSelections: Record<string, boolean>;
  expressDelivery: boolean;
  stagingCount: number;
  onBlueHourToggle: (photoId: string, checked: boolean) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  isMobile: boolean;
}

export function FinalizeStepBlueHour({
  selectedPhotos,
  signedUrls,
  photoNumberMap,
  blueHourSelections,
  expressDelivery,
  stagingCount,
  onBlueHourToggle,
  onSelectAll,
  onDeselectAll,
  isMobile,
}: FinalizeStepBlueHourProps) {
  const blueHourCount = Object.values(blueHourSelections).filter(v => v).length;

  return (
    <>
      <div className="py-6 space-y-6">
        {/* Blue Hour Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Sunset className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Fotos auswählen</h3>
                <p className="text-sm text-muted-foreground">
                  {blueHourCount} von {selectedPhotos.length} Fotos ausgewählt
                </p>
              </div>
            </div>
            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"}
                onClick={onSelectAll}
                className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
              >
                Alle auswählen
              </Button>
              <Button 
                variant="outline" 
                size={isMobile ? "default" : "sm"}
                onClick={onDeselectAll}
                className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
              >
                Alle abwählen
              </Button>
            </div>
          </div>
          
          {/* Photo Grid */}
          <div className={cn(
            "grid gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {selectedPhotos.map((photo) => (
              <div 
                key={photo.id}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                  blueHourSelections[photo.id] && "ring-2 ring-primary shadow-lg"
                )}
                onClick={() => onBlueHourToggle(photo.id, !blueHourSelections[photo.id])}
              >
                <img
                  src={signedUrls[photo.id] || photo.storage_url}
                  alt={photo.filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                  <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
                </div>
                <div className={cn(
                  "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                  blueHourSelections[photo.id] 
                    ? "bg-primary shadow-lg animate-scale-in" 
                    : "bg-background/80 group-hover:bg-background shadow-neu-flat-sm"
                )}>
                  {blueHourSelections[photo.id] && (
                    <Check className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FinalizePricingSummary 
        expressDelivery={expressDelivery}
        stagingCount={stagingCount}
        blueHourCount={blueHourCount}
      />
    </>
  );
}
