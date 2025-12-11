import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info, Trash2, Plus, Sparkles, ImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StagingOptionsProps {
  removeFurniture: boolean;
  onRemoveFurnitureChange: (value: boolean) => void;
  addFurniture: boolean;
  onAddFurnitureChange: (value: boolean) => void;
  enhancePhoto: boolean;
  onEnhancePhotoChange: (value: boolean) => void;
  children?: React.ReactNode;
}

export function StagingOptions({
  removeFurniture,
  onRemoveFurnitureChange,
  addFurniture,
  onAddFurnitureChange,
  enhancePhoto,
  onEnhancePhotoChange,
  children,
}: StagingOptionsProps) {
  return (
    <div className="space-y-2">
      {/* Remove Furniture Option */}
      <Collapsible>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <Switch
              id="remove-furniture"
              checked={removeFurniture}
              onCheckedChange={onRemoveFurnitureChange}
            />
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="remove-furniture" className="text-sm font-medium cursor-pointer">
                Möbel entfernen
              </Label>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                Entfernt vorhandene Möbel aus dem Bild bevor neue hinzugefügt werden
              </TooltipContent>
            </Tooltip>
          </div>
          <CollapsibleTrigger className="p-1 hover:bg-accent rounded">
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="mt-1 p-3 rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
            Markieren Sie Bereiche im Bild, die entfernt werden sollen (kommt bald)
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Add Furniture Option */}
      <Collapsible defaultOpen={addFurniture}>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <Switch
              id="add-furniture"
              checked={addFurniture}
              onCheckedChange={onAddFurnitureChange}
            />
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="add-furniture" className="text-sm font-medium cursor-pointer">
                Möbel hinzufügen
              </Label>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[200px]">
                Fügt virtuelle Möbel basierend auf Raumtyp und Stil hinzu
              </TooltipContent>
            </Tooltip>
          </div>
          <CollapsibleTrigger className="p-1 hover:bg-accent rounded">
            <ChevronDown className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              addFurniture && 'rotate-180'
            )} />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="mt-1 p-3 rounded-lg border bg-accent/30">
            {children}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Enhance Photo Option */}
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <Switch
            id="enhance-photo"
            checked={enhancePhoto}
            onCheckedChange={onEnhancePhotoChange}
          />
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="enhance-photo" className="text-sm font-medium cursor-pointer">
              Foto verbessern
            </Label>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px]">
              Automatische Bildverbesserung: Helligkeit, Kontrast und Farbkorrektur
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
