import { CheckCircle2, Calendar, Clock, Mail } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface BookingConfirmationProps {
  date: string;
  time: string;
  email: string;
}

export function BookingConfirmation({ date, time, email }: BookingConfirmationProps) {
  const selectedDate = new Date(date);
  const formattedDate = format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de });

  return (
    <div className="flex flex-col items-center text-center py-8 space-y-6">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
      </div>

      {/* Success Message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Termin erfolgreich gebucht!
        </h2>
        <p className="text-muted-foreground">
          Wir freuen uns auf das Gespräch mit Ihnen.
        </p>
      </div>

      {/* Booking Details */}
      <div className="w-full max-w-sm p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
        <h3 className="font-medium text-foreground">Ihre Buchungsdetails</h3>
        
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-sm capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm">{time} Uhr</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-sm">{email}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <p className="text-sm text-muted-foreground max-w-md">
        Sie erhalten in Kürze eine Bestätigung per E-Mail mit allen Details 
        und einem Kalender-Link.
      </p>
    </div>
  );
}
