import React, { useState } from 'react';
import { useBookingPackages, type BookingPackage } from '@/hooks/useBookingPackages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Plane, Layers, Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/calculator/pricing';

type PackageType = 'Foto' | 'Drohne' | 'Kombi';

interface PackagePickerProps {
  selectedPackageId?: string;
  onSelect: (pkg: BookingPackage) => void;
}

const packageIcons = {
  Foto: Camera,
  Drohne: Plane,
  Kombi: Layers,
};

const packageDescriptions = {
  Foto: 'Professionelle Innen- und Außenaufnahmen',
  Drohne: 'Luftaufnahmen für beste Übersicht',
  Kombi: 'Foto + Drohne im Paket',
};

export function PackagePicker({ selectedPackageId, onSelect }: PackagePickerProps) {
  const { data: packages, isLoading } = useBookingPackages();
  const [activeTab, setActiveTab] = useState<PackageType>('Foto');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const packageTypes: PackageType[] = ['Foto', 'Drohne', 'Kombi'];

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PackageType)}>
      <TabsList className="w-full grid grid-cols-3">
        {packageTypes.map((type) => {
          const Icon = packageIcons[type];
          return (
            <TabsTrigger key={type} value={type} className="gap-2">
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{type}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {packageTypes.map((type) => (
        <TabsContent key={type} value={type} className="mt-4">
          <p className="text-sm text-muted-foreground mb-4">
            {packageDescriptions[type]}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {packages
              ?.filter((p) => p.package_type === type)
              .map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const features = pkg.features || [];

                return (
                  <button
                    key={pkg.id}
                    onClick={() => onSelect(pkg)}
                    className={cn(
                      'relative p-4 rounded-lg border-2 text-left transition-all',
                      'hover:border-primary/50 hover:shadow-md',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border'
                    )}
                  >
                    {pkg.is_popular && (
                      <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        BELIEBT
                      </Badge>
                    )}

                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}

                    <div className="font-semibold text-foreground">
                      {pkg.name || `${type} ${pkg.photo_count}`}
                    </div>

                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-primary">
                        {pkg.photo_count}
                      </span>
                      <span className="text-sm text-muted-foreground">Bilder</span>
                    </div>

                    {features.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {features.slice(0, 3).map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                          >
                            <Check className="h-3 w-3 text-secondary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 pt-2 border-t">
                      <div className="text-lg font-bold text-foreground">
                        {formatPrice(pkg.price_cents)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ca. {pkg.duration_minutes} Min.
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
