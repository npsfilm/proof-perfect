import React, { useState } from 'react';
import { useBookingPackages } from '@/hooks/useBookingPackages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Plane, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface PackagePickerProps {
  selectedType?: 'foto' | 'drohne' | 'kombi';
  selectedCount?: number;
  onSelect: (
    type: 'foto' | 'drohne' | 'kombi',
    count: number,
    duration: number,
    requiresAdditionalInfo: boolean
  ) => void;
}

const packageIcons = {
  foto: Camera,
  drohne: Plane,
  kombi: Layers,
};

const packageLabels = {
  foto: 'Foto',
  drohne: 'Drohne',
  kombi: 'Kombi',
};

const packageDescriptions = {
  foto: 'Professionelle Innen- und Außenaufnahmen',
  drohne: 'Luftaufnahmen für beste Übersicht',
  kombi: 'Foto + Drohne im Paket',
};

export function PackagePicker({ selectedType, selectedCount, onSelect }: PackagePickerProps) {
  const { data: packages, isLoading } = useBookingPackages();
  const [activeTab, setActiveTab] = useState<string>(selectedType || 'foto');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  const packageTypes = ['foto', 'drohne', 'kombi'] as const;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full grid grid-cols-3">
        {packageTypes.map((type) => {
          const Icon = packageIcons[type];
          return (
            <TabsTrigger key={type} value={type} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{packageLabels[type]}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {packageTypes.map((type) => (
        <TabsContent key={type} value={type} className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {packageDescriptions[type]}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {packages
              ?.filter((p) => p.package_type === type)
              .map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() =>
                    onSelect(
                      pkg.package_type as 'foto' | 'drohne' | 'kombi',
                      pkg.photo_count,
                      pkg.duration_minutes,
                      pkg.requires_additional_info
                    )
                  }
                  className={cn(
                    'p-4 rounded-lg border-2 text-left transition-all hover:border-primary/50',
                    selectedType === type && selectedCount === pkg.photo_count
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  )}
                >
                  <div className="text-2xl font-bold text-primary">
                    {pkg.photo_count}
                  </div>
                  <div className="text-sm text-muted-foreground">Bilder</div>
                  <div className="mt-2 text-sm font-medium">
                    {(pkg.price_cents / 100).toLocaleString('de-DE', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ca. {pkg.duration_minutes} Min.
                  </div>
                </button>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
