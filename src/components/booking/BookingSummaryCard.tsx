import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { useBookingPrice } from '@/contexts/hooks/useBookingPrice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Camera, Plane, Layers, MapPin, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

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

export function BookingSummaryCard() {
  const { properties, selectedSlots, propertyCount, currentPropertyIndex } = useBooking();
  const { totalDuration, totalPrice } = useBookingPrice();

  const hasProperties = properties.length > 0;

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Ihre Buchung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Immobilien:</span>
          <span className="font-medium text-foreground">
            {properties.length} / {propertyCount}
          </span>
        </div>

        {/* Properties list */}
        {hasProperties ? (
          <div className="space-y-3">
            {properties.map((property, index) => {
              const Icon = packageIcons[property.packageType];
              const slot = selectedSlots[index];

              return (
                <div
                  key={index}
                  className="p-3 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <span className="text-sm font-medium line-clamp-2">
                      {property.address}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Icon className="h-3.5 w-3.5" />
                      <span>{packageLabels[property.packageType]}</span>
                    </div>
                    <span>•</span>
                    <span>{property.photoCount} Bilder</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>ca. {property.durationMinutes} Min.</span>
                  </div>

                  {slot && (
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(parseISO(slot.date), 'EEE, dd.MM.', { locale: de })} • {slot.start}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Noch keine Immobilien hinzugefügt</p>
          </div>
        )}

        {/* Pending slots */}
        {currentPropertyIndex < propertyCount && properties.length < propertyCount && (
          <div className="space-y-2">
            {Array.from({ length: propertyCount - properties.length }).map((_, i) => (
              <div
                key={`pending-${i}`}
                className="p-3 border border-dashed rounded-lg text-center text-sm text-muted-foreground"
              >
                Immobilie {properties.length + i + 1}
              </div>
            ))}
          </div>
        )}

        {hasProperties && (
          <>
            <Separator />

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Geschätzte Dauer</span>
                <span className="font-medium">{totalDuration} Min.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preis ab</span>
                <span className="text-lg font-bold text-primary">
                  {(totalPrice / 100).toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              * Endpreis kann je nach Aufwand variieren. 
              Anfahrtskosten werden separat berechnet.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
