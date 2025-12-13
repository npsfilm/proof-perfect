import React, { useState } from 'react';
import { useBooking, PropertyBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { AddressInput } from './AddressInput';
import { PackagePicker } from './PackagePicker';
import { PropertyDetailsModal } from './PropertyDetailsModal';
import { Check, ChevronRight } from 'lucide-react';
import { type BookingPackage } from '@/hooks/useBookingPackages';

export function BookingStepProperty() {
  const {
    propertyCount,
    currentPropertyIndex,
    properties,
    addProperty,
    updateProperty,
    setCurrentPropertyIndex,
    nextStep,
    prevStep,
  } = useBooking();

  const [currentProperty, setCurrentProperty] = useState<Partial<PropertyBooking>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>();

  const isCurrentComplete = !!(
    currentProperty.address &&
    currentProperty.packageType &&
    currentProperty.photoCount &&
    currentProperty.durationMinutes
  );

  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    setCurrentProperty(prev => ({ ...prev, address, lat, lng }));
  };

  const handlePackageSelect = (pkg: BookingPackage) => {
    const packageType = pkg.package_type.toLowerCase() as 'foto' | 'drohne' | 'kombi';
    setSelectedPackageId(pkg.id);
    setCurrentProperty(prev => ({
      ...prev,
      packageType,
      photoCount: pkg.photo_count,
      durationMinutes: pkg.duration_minutes,
    }));

    if (pkg.requires_additional_info) {
      setShowDetailsModal(true);
    }
  };

  const handleDetailsSubmit = (propertyType: 'bewohnt' | 'unbewohnt' | 'gestaged', squareMeters: number) => {
    setCurrentProperty(prev => ({ ...prev, propertyType, squareMeters }));
    setShowDetailsModal(false);
  };

  const handleNextProperty = () => {
    if (isCurrentComplete) {
      addProperty(currentProperty as PropertyBooking);
      
      if (currentPropertyIndex + 1 < propertyCount) {
        setCurrentPropertyIndex(currentPropertyIndex + 1);
        setCurrentProperty({});
      } else {
        nextStep();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-1">
            Immobilie {currentPropertyIndex + 1} von {propertyCount}
          </h2>
          <p className="text-muted-foreground text-sm">
            Geben Sie die Details für diese Immobilie ein
          </p>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: propertyCount }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i < properties.length
                  ? 'bg-primary'
                  : i === currentPropertyIndex
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Address input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Adresse</label>
        <AddressInput
          value={currentProperty.address || ''}
          onSelect={handleAddressSelect}
        />
      </div>

      {/* Package picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Paket auswählen</label>
        <PackagePicker
          selectedPackageId={selectedPackageId}
          onSelect={handlePackageSelect}
        />
      </div>

      {/* Info about additional details */}
      {currentProperty.propertyType && (
        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg text-sm">
          <Check className="h-4 w-4 text-primary" />
          <span>
            {currentProperty.propertyType === 'bewohnt' ? 'Bewohnte' : 
             currentProperty.propertyType === 'unbewohnt' ? 'Unbewohnte' : 'Gestagete'} Immobilie,{' '}
            ca. {currentProperty.squareMeters} m²
          </span>
        </div>
      )}

      {/* Note about photo count */}
      <p className="text-xs text-muted-foreground italic">
        Die Bildanzahl dient als Richtwert für den Zeitaufwand. 
        Sie können später jederzeit mehr Bilder nachbestellen.
      </p>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => {
            if (currentPropertyIndex > 0) {
              setCurrentPropertyIndex(currentPropertyIndex - 1);
              setCurrentProperty(properties[currentPropertyIndex - 1] || {});
            } else {
              prevStep();
            }
          }}
        >
          Zurück
        </Button>
        <Button onClick={handleNextProperty} disabled={!isCurrentComplete}>
          {currentPropertyIndex + 1 < propertyCount ? (
            <>
              Nächste Immobilie
              <ChevronRight className="ml-1 h-4 w-4" />
            </>
          ) : (
            'Weiter zu Terminen'
          )}
        </Button>
      </div>

      <PropertyDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSubmit={handleDetailsSubmit}
      />
    </div>
  );
}
