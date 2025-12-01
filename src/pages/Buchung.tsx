import { useEffect, useState } from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, ChevronLeft, ChevronRight, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Buchung() {
  const {
    isAuthenticated,
    calendars,
    selectedCalendarIds,
    setSelectedCalendarIds,
    freeSlots,
    isLoading,
    error,
    signIn,
    signOut,
    exchangeCodeForToken,
    fetchFreeSlots,
  } = useGoogleCalendar();

  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !isAuthenticated) {
      exchangeCodeForToken(code);
    }
  }, [isAuthenticated, exchangeCodeForToken]);

  // Fetch free slots when calendars are selected or week changes
  useEffect(() => {
    if (isAuthenticated && selectedCalendarIds.length > 0) {
      const startDate = currentWeekStart;
      const endDate = addDays(addWeeks(currentWeekStart, 2), -1); // 2 weeks from start
      fetchFreeSlots(startDate, endDate);
    }
  }, [isAuthenticated, selectedCalendarIds, currentWeekStart, fetchFreeSlots]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendarIds(prev => 
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const handleSlotSelect = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    const formattedDate = format(new Date(date), 'EEEE, dd.MM.yyyy', { locale: de });
    toast.success(`Termin ausgewählt: ${formattedDate}, ${time} Uhr`, {
      description: 'Wir haben Ihre bevorzugte Zeit notiert.',
    });
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
            {isAuthenticated && (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-6 py-8 max-w-7xl">
        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Mit Google anmelden</CardTitle>
              <CardDescription>
                Melden Sie sich mit Ihrem Google-Konto an, um verfügbare Termine zu sehen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={signIn} className="w-full" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                Mit Google Kalender verbinden
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Calendar Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Kalender auswählen</CardTitle>
                <CardDescription>
                  Wählen Sie die Kalender aus, die bei der Verfügbarkeitsprüfung berücksichtigt werden sollen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {calendars.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Keine Kalender gefunden.</p>
                ) : (
                  <div className="space-y-3">
                    {calendars.map(calendar => (
                      <div key={calendar.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={calendar.id}
                          checked={selectedCalendarIds.includes(calendar.id)}
                          onCheckedChange={() => handleCalendarToggle(calendar.id)}
                        />
                        <label
                          htmlFor={calendar.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {calendar.summary}
                          {calendar.primary && (
                            <span className="ml-2 text-xs text-muted-foreground">(Hauptkalender)</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedCalendarIds.length > 0 && (
              <>
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
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">Verfügbare Zeiten werden geladen...</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                              slots.map(slot => {
                                const isSelected = 
                                  selectedSlot?.date === dateKey && 
                                  selectedSlot?.time === slot.displayTime;
                                
                                return (
                                  <Button
                                    key={slot.displayTime}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="w-full justify-start"
                                    onClick={() => handleSlotSelect(dateKey, slot.displayTime)}
                                  >
                                    {isSelected && <CheckCircle2 className="h-3 w-3 mr-2" />}
                                    {slot.displayTime}
                                  </Button>
                                );
                              })
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* Selection Summary */}
                {selectedSlot && (
                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                        Termin ausgewählt
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground">
                        <span className="font-semibold">
                          {format(new Date(selectedSlot.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
                        </span>
                        {' um '}
                        <span className="font-semibold">{selectedSlot.time} Uhr</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Wir haben Ihre bevorzugte Zeit notiert. Sie werden in Kürze von uns kontaktiert, um den Termin zu bestätigen.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
