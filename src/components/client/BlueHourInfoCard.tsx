import { Info, X } from "lucide-react";
import { BlueHourSlider } from "./BlueHourSlider";
import { Button } from "@/components/ui/button";
import blueHourBefore1 from "@/assets/blue-hour-before-1.jpg";
import blueHourAfter1 from "@/assets/blue-hour-after-1.jpg";
import blueHourBefore2 from "@/assets/blue-hour-before-2.jpg";
import blueHourAfter2 from "@/assets/blue-hour-after-2.jpg";

interface BlueHourInfoCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const BlueHourInfoCard = ({ isExpanded, onToggle }: BlueHourInfoCardProps) => {
  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="soft"
        className="flex items-center gap-2 w-full"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <Info className="h-4 w-4" />
        <span className="text-sm font-medium">
          Beispiele ansehen
        </span>
      </Button>

      {/* Overlay - covers parent card when expanded */}
      {isExpanded && (
        <div 
          className="absolute inset-0 z-10 bg-background rounded-[inherit] p-6 flex flex-col overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with title and close button */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-foreground">
                Was ist die Blaue Stunde?
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Sehen Sie den Unterschied
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={onToggle}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Two sliders side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <BlueHourSlider
              title="Beispiel 1: Einfamilienhaus"
              beforeImage={blueHourBefore1}
              afterImage={blueHourAfter1}
            />
            <BlueHourSlider
              title="Beispiel 2: Moderne Villa"
              beforeImage={blueHourBefore2}
              afterImage={blueHourAfter2}
            />
          </div>

          {/* Explanatory text */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-primary/5 mt-6">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Die blaue Stunde verleiht Ihren Außenaufnahmen eine warme, einladende 
              Atmosphäre mit dramatischer Beleuchtung. Perfekt für Immobilien mit 
              besonderer Architektur oder stimmungsvoller Außengestaltung.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
