import { ChevronDown, Info } from "lucide-react";
import { BlueHourSlider } from "./BlueHourSlider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BlueHourInfoCardProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const BlueHourInfoCard = ({ isExpanded, onToggle }: BlueHourInfoCardProps) => {
  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger 
        className="flex items-center justify-between w-full px-4 py-3 rounded-2xl bg-background/50 hover:bg-background/80 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Beispiele ansehen
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-4 space-y-6">
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
      </CollapsibleContent>
    </Collapsible>
  );
};
