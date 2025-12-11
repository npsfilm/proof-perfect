import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, RotateCcw, Palette } from 'lucide-react';
import { useThemeSettings } from '@/hooks/useThemeSettings';
import { ColorSwatch } from './ColorSwatch';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const categoryLabels: Record<string, { title: string; description: string }> = {
  brand: {
    title: 'Markenfarben',
    description: 'Primäre und sekundäre Farben der Markenidentität',
  },
  status: {
    title: 'Status-Farben',
    description: 'Farben für Galerie-Status (Planung, Offen, Geschlossen, etc.)',
  },
  service: {
    title: 'Service-Farben',
    description: 'Farben für Zusatzleistungen (Express, Staging, Blaue Stunde)',
  },
  slot: {
    title: 'Slot-Farben',
    description: 'Farben für Buchungs-Zeitslots',
  },
  accent: {
    title: 'Akzent-Farben',
    description: 'Info, Warnung und Erfolg-Meldungen',
  },
};

export function ColorPaletteEditor() {
  const { settingsByCategory, isLoading, updateColor, resetToDefaults } = useThemeSettings();
  const { toast } = useToast();
  const [openSections, setOpenSections] = useState<string[]>(['brand', 'status']);

  const handleUpdateColor = (id: string, lightValue: string, darkValue?: string | null) => {
    updateColor.mutate(
      { id, color_value_light: lightValue, color_value_dark: darkValue },
      {
        onSuccess: () => {
          toast({
            title: 'Farbe aktualisiert',
            description: 'Die Änderung wurde gespeichert und angewendet.',
          });
        },
        onError: (error: any) => {
          toast({
            title: 'Fehler',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleResetAll = () => {
    if (!confirm('Alle Farben auf Standardwerte zurücksetzen?')) return;
    
    resetToDefaults.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: 'Zurückgesetzt',
          description: 'Alle Farben wurden auf die Standardwerte zurückgesetzt.',
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Fehler',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-24 w-full" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Design System
          </CardTitle>
          <CardDescription>
            Farben live bearbeiten. Änderungen werden sofort angewendet.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetAll}
          disabled={resetToDefaults.isPending}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Alle zurücksetzen
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(settingsByCategory).map(([category, settings]) => {
          if (settings.length === 0) return null;
          
          const { title, description } = categoryLabels[category] || { 
            title: category, 
            description: '' 
          };
          
          return (
            <Collapsible
              key={category}
              open={openSections.includes(category)}
              onOpenChange={() => toggleSection(category)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="text-left">
                  <div className="font-medium">{title}</div>
                  <div className="text-xs text-muted-foreground">{description}</div>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openSections.includes(category) ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
                  {settings.map((setting) => (
                    <ColorSwatch
                      key={setting.id}
                      setting={setting}
                      onUpdate={handleUpdateColor}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
