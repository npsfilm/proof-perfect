import { useState, useEffect } from "react";
import { usePublicBooking } from "@/hooks/usePublicBooking";
import { toast } from "sonner";
import { BookingProfileSection } from "@/components/booking/BookingProfileSection";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import { BookingTimeSlots } from "@/components/booking/BookingTimeSlots";
import { BookingContactForm } from "@/components/booking/BookingContactForm";
import { BookingConfirmation } from "@/components/booking/BookingConfirmation";
import { addDays, startOfDay, format } from "date-fns";
import { Loader2, AlertCircle } from "lucide-react";

type BookingStep = "select" | "contact" | "confirmed";

interface SelectedSlot {
  date: string;
  time: string;
}

export default function Buchung() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [step, setStep] = useState<BookingStep>("select");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const { freeSlots, isLoading, error, fetchAvailability, createBooking } = usePublicBooking();

  // Fetch availability for the next 14 days
  useEffect(() => {
    const today = startOfDay(new Date());
    const endDate = addDays(today, 14);
    fetchAvailability(today, endDate);
  }, [fetchAvailability]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
    setStep("contact");
  };

  const handleBack = () => {
    setStep("select");
  };

  const handleSubmit = async (data: { name: string; email: string; phone: string; message: string }) => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const result = await createBooking(
        data.name,
        data.email,
        data.phone,
        data.message,
        selectedSlot.date,
        selectedSlot.time
      );
      
      if (result.success) {
        setConfirmedEmail(data.email);
        setStep("confirmed");
        toast.success("Termin gebucht", {
          description: "Sie erhalten in Kürze eine Bestätigung per E-Mail.",
        });
      } else {
        toast.error("Fehler", {
          description: "Die Buchung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
        });
      }
    } catch (err) {
      toast.error("Fehler", {
        description: "Die Buchung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get slots for selected date
  const getSlotsForDate = () => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return freeSlots[dateKey] || [];
  };

  // Get dates that have available slots
  const getAvailableDates = () => {
    return Object.entries(freeSlots)
      .filter(([_, slots]) => slots.length > 0)
      .map(([dateKey]) => dateKey);
  };

  // Loading state
  if (isLoading && Object.keys(freeSlots).length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Lade Verfügbarkeit...</p>
        </div>
      </div>
    );
  }

  // Error state when booking is not configured
  if (error && Object.keys(freeSlots).length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Buchung nicht verfügbar</h2>
          <p className="text-muted-foreground text-sm">
            Das Buchungssystem ist derzeit nicht konfiguriert. 
            Bitte kontaktieren Sie uns direkt unter{" "}
            <a href="mailto:hello@immoonpoint.de" className="text-primary hover:underline">
              hello@immoonpoint.de
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">IP</span>
            </div>
            <span className="font-semibold text-foreground">immoonpoint</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {step === "confirmed" && selectedSlot ? (
          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-3xl shadow-neu-flat p-8">
              <BookingConfirmation
                date={selectedSlot.date}
                time={selectedSlot.time}
                email={confirmedEmail}
              />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[320px_1fr] gap-8">
            {/* Left Column - Profile Section */}
            <div className="bg-card rounded-3xl shadow-neu-flat p-6 h-fit lg:sticky lg:top-8">
              <BookingProfileSection />
            </div>

            {/* Right Column - Calendar & Time Slots or Contact Form */}
            <div className="bg-card rounded-3xl shadow-neu-flat p-6">
              {step === "select" ? (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-1">
                      Wählen Sie Datum und Uhrzeit
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Verfügbare Termine in den nächsten 14 Tagen
                    </p>
                  </div>

                  <div className="grid md:grid-cols-[1fr_1fr] gap-8">
                    {/* Calendar */}
                    <div>
                      <BookingCalendar
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                        availableDates={getAvailableDates()}
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
                      <BookingTimeSlots
                        selectedDate={selectedDate}
                        slots={getSlotsForDate()}
                        selectedSlot={selectedSlot}
                        onSlotSelect={handleSlotSelect}
                        isLoading={isLoading}
                      />
                    </div>
                  </div>
                </div>
              ) : step === "contact" && selectedSlot ? (
                <BookingContactForm
                  selectedSlot={selectedSlot}
                  onBack={handleBack}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                />
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
