import { Info, X } from "lucide-react";
import { BlueHourSlider } from "./BlueHourSlider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface BlueHourInfoCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const BlueHourInfoCard = ({ isExpanded, onToggle }: BlueHourInfoCardProps) => {
  return (
    <Popover open={isExpanded} onOpenChange={onToggle}>
      <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="soft"
          className="flex items-center gap-2 w-full"
        >
          <Info className="h-4 w-4" />
          <span className="text-sm font-medium">
            Beispiele ansehen
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-80 md:w-[480px] p-6 space-y-6 max-h-[80vh] overflow-y-auto"
        align="center"
        side="top"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with title and close button */}
        <div className="flex items-start justify-between gap-4">
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

        {/* Example 1 */}
        <BlueHourSlider
          title="Beispiel 1: Einfamilienhaus"
          beforeImage={undefined}
          afterImage={undefined}
        />

        {/* Example 2 */}
        <BlueHourSlider
          title="Beispiel 2: Moderne Villa"
          beforeImage={undefined}
          afterImage={undefined}
        />

        {/* Explanatory text */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-primary/5">
          <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Die blaue Stunde verleiht Ihren Außenaufnahmen eine warme, einladende 
            Atmosphäre mit dramatischer Beleuchtung. Perfekt für Immobilien mit 
            besonderer Architektur oder stimmungsvoller Außengestaltung.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
