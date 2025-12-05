import { MapPin, Camera, Package, Clock, Euro, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useBooking } from '@/contexts/BookingContext';
import { SERVICES } from '@/constants/booking';
import { cn } from '@/lib/utils';

export function BookingSummaryCard() {
  const { currentProperty, totalProperties, bookingsCompleted, getTotalPrice, getTotalDuration } = useBooking();

  const service = SERVICES.find(s => s.id === currentProperty.serviceType);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Zusammenfassung</h3>
        {totalProperties > 1 && (
          <span className="text-sm text-muted-foreground">
            Objekt {bookingsCompleted + 1}/{totalProperties}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Address */}
        {currentProperty.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Adresse</p>
              <p className="font-medium text-sm">{currentProperty.address}</p>
            </div>
          </div>
        )}

        {/* Service */}
        {service && (
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Service</p>
              <p className="font-medium text-sm">{service.name}</p>
            </div>
          </div>
        )}

        {/* Package */}
        {currentProperty.package && (
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Paket</p>
              <p className="font-medium text-sm">{currentProperty.package.name}</p>
              <p className="text-xs text-muted-foreground">{currentProperty.package.photos} Bilder</p>
            </div>
          </div>
        )}

        {/* Upgrades */}
        {currentProperty.upgrades.length > 0 && (
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">+</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Extras</p>
              {currentProperty.upgrades.map((upgrade) => (
                <p key={upgrade.id} className="font-medium text-sm">{upgrade.name}</p>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled time */}
        {currentProperty.scheduledDate && currentProperty.scheduledTime && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Termin</p>
              <p className="font-medium text-sm">
                {format(currentProperty.scheduledDate, 'EEE, d. MMM', { locale: de })}
              </p>
              <p className="text-primary font-semibold">{currentProperty.scheduledTime} Uhr</p>
            </div>
          </div>
        )}

        {/* Duration */}
        {getTotalDuration() > 0 && (
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Geschätzte Dauer</p>
              <p className="font-medium text-sm">{getTotalDuration()} Minuten</p>
            </div>
          </div>
        )}
      </div>

      {/* Total Price */}
      {getTotalPrice() > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gesamtpreis</span>
            <div className="flex items-center gap-1">
              <Euro className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">{getTotalPrice()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
