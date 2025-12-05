import { CheckCircle2, Calendar, MapPin, Home } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { useNavigate } from 'react-router-dom';

export function BookingSuccess() {
  const { completedBookings, contactDetails, resetBooking } = useBooking();
  const navigate = useNavigate();

  const handleNewBooking = () => {
    resetBooking();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] px-4 py-8 text-center">
      <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-12 h-12 text-secondary" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
        Vielen Dank für Ihre Buchung!
      </h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Wir haben Ihre Anfrage erhalten und werden uns in Kürze bei Ihnen melden.
        Eine Bestätigung wurde an <strong>{contactDetails.email}</strong> gesendet.
      </p>

      {/* Booked properties summary */}
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 mb-8">
        <h3 className="font-semibold mb-4 text-left">
          {completedBookings.length === 1 ? 'Ihre Buchung' : `Ihre ${completedBookings.length} Buchungen`}
        </h3>
        <div className="space-y-4">
          {completedBookings.map((booking, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">{index + 1}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{booking.address}</span>
                </div>
                {booking.scheduledDate && booking.scheduledTime && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {format(booking.scheduledDate, 'EEE, d. MMM', { locale: de })} um {booking.scheduledTime} Uhr
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button variant="outline" size="lg" className="flex-1" onClick={handleGoHome}>
          <Home className="w-5 h-5 mr-2" />
          Zur Startseite
        </Button>
        <Button size="lg" className="flex-1" onClick={handleNewBooking}>
          <Calendar className="w-5 h-5 mr-2" />
          Neue Buchung
        </Button>
      </div>
    </div>
  );
}
