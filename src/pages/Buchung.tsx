import { useCalendly, CalendlyEventType } from '@/hooks/useCalendly';
import { BookingProfileCard } from '@/components/booking/BookingProfileCard';
import { BookingEventTypeSelector } from '@/components/booking/BookingEventTypeSelector';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { BookingTimeSlots } from '@/components/booking/BookingTimeSlots';
import { BookingConfirmButton } from '@/components/booking/BookingConfirmButton';
import { AlertCircle, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function Buchung() {
  const {
    user,
    eventTypes,
    selectedEventType,
    setSelectedEventType,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    availableTimes,
    isLoading,
    isLoadingTimes,
    error,
  } = useCalendly();
  
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            Calendly konnte nicht geladen werden. Bitte versuchen Sie es später erneut.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Termin buchen</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Event Type */}
          <div className="lg:col-span-4 space-y-6">
            <BookingProfileCard
              user={user}
              eventType={selectedEventType}
              isLoading={isLoading}
            />
            
            <BookingEventTypeSelector
              eventTypes={eventTypes}
              selectedEventType={selectedEventType}
              onSelect={(eventType: CalendlyEventType) => {
                setSelectedEventType(eventType);
                setSelectedTime(null);
              }}
            />
            
            {/* Confirm Button (mobile shows at bottom) */}
            <div className="hidden lg:block">
              <BookingConfirmButton
                selectedTime={selectedTime}
                selectedDate={selectedDate}
                eventType={selectedEventType}
              />
            </div>
          </div>
          
          {/* Middle Column - Calendar */}
          <div className="lg:col-span-4">
            <BookingCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
            />
          </div>
          
          {/* Right Column - Time Slots */}
          <div className="lg:col-span-4">
            <BookingTimeSlots
              times={availableTimes}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              isLoading={isLoadingTimes}
              selectedDate={selectedDate}
            />
          </div>
          
          {/* Mobile Confirm Button */}
          <div className="lg:hidden">
            <BookingConfirmButton
              selectedTime={selectedTime}
              selectedDate={selectedDate}
              eventType={selectedEventType}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
