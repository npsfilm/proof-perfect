import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Home, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export function BookingSuccess() {
  const { properties, selectedSlots, contact, batchId, resetBooking } = useBooking();

  const hasWeekendRequest = selectedSlots.some(s => s.isWeekendRequest);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {hasWeekendRequest ? 'Anfrage gesendet!' : 'Buchung erfolgreich!'}
          </h1>
          <p className="text-muted-foreground">
            {hasWeekendRequest
              ? 'Wir prüfen Ihre Wochenendanfrage und melden uns in Kürze.'
              : 'Ihre Termine wurden erfolgreich reserviert.'}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 mb-6 text-left">
          <h2 className="font-semibold mb-4">Zusammenfassung</h2>
          
          <div className="space-y-4">
            {properties.map((property, index) => {
              const slot = selectedSlots[index] || selectedSlots[0];
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Home className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{property.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {property.packageType === 'foto' ? 'Foto' : 
                       property.packageType === 'drohne' ? 'Drohne' : 'Kombi'} • {property.photoCount} Bilder
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(parseISO(slot.date), 'EEE, dd.MM.yyyy', { locale: de })} • {slot.start} - {slot.end}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Bestätigung gesendet an: <strong>{contact.email}</strong>
            </p>
            {batchId && (
              <p className="text-xs text-muted-foreground mt-1">
                Buchungs-ID: {batchId.slice(0, 8)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link to="/">
              Zur Startseite
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" onClick={resetBooking} className="w-full">
            Weitere Buchung
          </Button>
        </div>
      </div>
    </div>
  );
}
