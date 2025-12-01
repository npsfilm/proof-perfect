import { useEffect, useState } from 'react';
import { usePublicBooking } from '@/hooks/usePublicBooking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { de } from 'date-fns/locale';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(100),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  phone: z.string().trim().max(50).optional(),
  message: z.string().trim().max(1000).optional(),
});

export default function Buchung() {
  const { freeSlots, isLoading, error, fetchAvailability, createBooking } = usePublicBooking();

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  // Fetch free slots on mount and when week changes
  useEffect(() => {
    const startDate = currentWeekStart;
    const endDate = addDays(addWeeks(currentWeekStart, 2), -1); // 2 weeks from start
    fetchAvailability(startDate, endDate);
  }, [currentWeekStart, fetchAvailability]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    setShowContactForm(true);
  };

  const validateForm = () => {
    try {
      contactSchema.parse(contactData);
      setFormErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            errors[error.path[0].toString()] = error.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedSlot) return;

    setIsSubmitting(true);
    const result = await createBooking(
      contactData.name,
      contactData.email,
      contactData.phone || '',
      contactData.message || '',
      selectedSlot.date,
      selectedSlot.time
    );

    setIsSubmitting(false);

    if (result.success) {
      setIsBooked(true);
      toast.success('Termin erfolgreich gebucht!', {
        description: 'Sie erhalten in Kürze eine Bestätigungs-E-Mail.',
      });
    } else {
      toast.error('Buchung fehlgeschlagen', {
        description: 'Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.',
      });
    }
  };

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  // Generate array of dates for current 2-week period
  const weekDates = Array.from({ length: 14 }, (_, i) => addDays(currentWeekStart, i)).filter(
    date => date.getDay() !== 0 && date.getDay() !== 6 // Exclude weekends
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-neu-flat">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">immoonpoint</h1>
              <p className="text-sm text-muted-foreground mt-1">Termin buchen</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        {isBooked ? (
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <CheckCircle2 className="h-6 w-6 mr-2" />
                Termin erfolgreich gebucht!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                Vielen Dank für Ihre Buchung! Sie haben folgende Zeit reserviert:
              </p>
              {selectedSlot && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-semibold text-lg">
                    {format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                  </p>
                  <p className="text-xl font-bold text-primary">
                    {selectedSlot.time} Uhr
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details. Wir freuen uns auf Ihren Termin!
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Weiteren Termin buchen
              </Button>
            </CardContent>
          </Card>
        ) : showContactForm && selectedSlot ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ihre Kontaktdaten</CardTitle>
                <CardDescription>
                  Gewählter Termin: {format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: de })} um {selectedSlot.time} Uhr
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Max Mustermann"
                  />
                  {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    placeholder="max@beispiel.de"
                  />
                  {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                    placeholder="+49 123 456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Nachricht (optional)</Label>
                  <Textarea
                    id="message"
                    value={contactData.message}
                    onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    placeholder="Teilen Sie uns mit, worum es bei Ihrem Termin geht..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowContactForm(false);
                      setSelectedSlot(null);
                    }}
                    className="flex-1"
                  >
                    Zurück
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Wird gebucht...
                      </>
                    ) : (
                      'Termin verbindlich buchen'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verfügbare Termine</CardTitle>
                <CardDescription>
                  Wählen Sie einen passenden Termin für Ihr Anliegen. Die Buchung ist für 30 Minuten vorgesehen.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Week Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={goToPreviousWeek} disabled={isLoading}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Vorherige Woche
              </Button>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {format(currentWeekStart, 'dd.MM.yyyy', { locale: de })} -{' '}
                  {format(addDays(addWeeks(currentWeekStart, 2), -1), 'dd.MM.yyyy', { locale: de })}
                </p>
              </div>
              <Button variant="outline" onClick={goToNextWeek} disabled={isLoading}>
                Nächste Woche
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Time Slots Grid */}
            {isLoading ? (
              <Card>
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Verfügbare Zeiten werden geladen...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weekDates.map(date => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const slots = freeSlots[dateKey] || [];
                  
                  return (
                    <Card key={dateKey}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {format(date, 'EEE dd.MM', { locale: de })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {slots.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            Keine freien Zeiten
                          </p>
                        ) : (
                          slots.map(slot => (
                            <Button
                              key={slot.displayTime}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleSlotSelect(dateKey, slot.displayTime)}
                            >
                              {slot.displayTime} Uhr
                            </Button>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
