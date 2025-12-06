import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { CalendarMonthView } from '@/components/calendar/CalendarMonthView';
import { CalendarWeekView } from '@/components/calendar/CalendarWeekView';
import { CalendarDayView } from '@/components/calendar/CalendarDayView';
import { CalendarListView } from '@/components/calendar/CalendarListView';
import { EventModal } from '@/components/calendar/EventModal';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { useEvents, CalendarEvent, CreateEventData } from '@/hooks/useEvents';
import { useGoogleCalendarAuth } from '@/hooks/useGoogleCalendarAuth';
import { useGoogleCalendarSync } from '@/hooks/useGoogleCalendarSync';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCalendar() {
  const {
    currentDate,
    view,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
    goToDate,
  } = useCalendarNavigation();

  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useEvents(currentDate);
  const { user, handleOAuthSuccess, isConnected } = useGoogleCalendarAuth();
  const { sync } = useGoogleCalendarSync();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callbackProcessed, setCallbackProcessed] = useState(false);

  // Handle OAuth callback - tokens are stored server-side, just refresh local state
  useEffect(() => {
    if (callbackProcessed || !user) return;

    const params = new URLSearchParams(window.location.search);
    
    if (params.get('google_auth') === 'success') {
      setCallbackProcessed(true);
      // Clean URL immediately
      window.history.replaceState({}, '', '/admin/calendar');
      // Refresh token state and trigger sync
      handleOAuthSuccess().then(() => sync());
    } else if (params.get('error')) {
      setCallbackProcessed(true);
      window.history.replaceState({}, '', '/admin/calendar');
    }
  }, [user, callbackProcessed, handleOAuthSuccess, sync]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const handleDateClick = (date: Date) => {
    setSelectedEvent(null);
    setDefaultDate(date);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setDefaultDate(undefined);
    setIsModalOpen(true);
  };

  const handleSave = (data: CreateEventData) => {
    createEvent.mutate(data);
  };

  const handleUpdate = (id: string, data: Partial<CreateEventData>) => {
    updateEvent.mutate({ id, ...data });
  };

  const handleDelete = (id: string) => {
    deleteEvent.mutate(id);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setDefaultDate(undefined);
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex-1 p-8">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      );
    }

    switch (view) {
      case 'month':
        return (
          <CalendarMonthView
            currentDate={currentDate}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        );
      case 'week':
        return (
          <CalendarWeekView
            currentDate={currentDate}
            events={events}
            onTimeSlotClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        );
      case 'day':
        return (
          <CalendarDayView
            currentDate={currentDate}
            events={events}
            onTimeSlotClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        );
      case 'list':
        return (
          <CalendarListView
            currentDate={currentDate}
            events={events}
            onEventClick={handleEventClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Kalender"
        description="Termine verwalten und mit Google Kalender synchronisieren"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Kalender' },
        ]}
      />

      <div className="flex flex-col h-[calc(100vh-12rem)] bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-4">
          <CalendarHeader
            currentDate={currentDate}
            view={view}
            onViewChange={setView}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onToday={goToToday}
          />
        </div>

        {renderView()}
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        defaultDate={defaultDate}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        isSaving={createEvent.isPending || updateEvent.isPending}
      />
    </PageContainer>
  );
}
