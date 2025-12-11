import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWeekend, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Clock, MapPin } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

type ViewMode = 'month' | 'week';

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const navigate = useNavigate();
  
  const { data: bookings = [], isLoading } = useAdminBookings();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.scheduled_date), day)
    );
  };

  const getSlotStatus = (booking: { status: string; is_weekend_request: boolean | null }) => {
    if (booking.is_weekend_request) return 'request';
    return booking.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-primary text-primary-foreground';
      case 'request': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-destructive/50 text-destructive-foreground';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Gebucht';
      case 'request': return 'Anfrage';
      case 'cancelled': return 'Storniert';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <PageContainer>
      <PageHeader
        title="Kalender"
        description="Übersicht aller Buchungen und Termine"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Kalender' }
        ]}
        actions={
          <Button onClick={() => navigate('/admin/bookings')}>
            <Plus className="h-4 w-4 mr-2" />
            Alle Buchungen
          </Button>
        }
      />

      <Card className="shadow-neu-flat">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {format(currentDate, 'MMMM yyyy', { locale: de })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
              >
                Heute
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index >= 5 ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayBookings = getBookingsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isWeekendDay = isWeekend(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-24 p-1 rounded-lg border transition-colors ${
                        !isCurrentMonth
                          ? 'bg-muted/30 text-muted-foreground'
                          : isWeekendDay
                          ? 'bg-muted/50 border-dashed'
                          : 'bg-background'
                      } ${isToday ? 'ring-2 ring-primary' : 'border-border/50'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday
                              ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                              : ''
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        {isWeekendDay && isCurrentMonth && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-[10px] px-1 py-0">
                                Anfrage
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Nur auf Anfrage buchbar</p>
                              <p className="text-xs text-muted-foreground">
                                Wochenendzuschlag 25-50%
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="space-y-0.5 overflow-hidden max-h-16">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <Tooltip key={booking.id}>
                            <TooltipTrigger asChild>
                              <div
                                className={`text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${getStatusColor(
                                  getSlotStatus(booking)
                                )}`}
                                onClick={() => navigate(`/admin/bookings?id=${booking.id}`)}
                              >
                                {booking.scheduled_start.slice(0, 5)} - {booking.address.split(',')[0]}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs">
                              <div className="space-y-1">
                                <p className="font-medium">{booking.contact_name}</p>
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  {booking.scheduled_start.slice(0, 5)} - {booking.scheduled_end.slice(0, 5)}
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="h-3 w-3" />
                                  {booking.address}
                                </div>
                                <Badge className={getStatusColor(getSlotStatus(booking))}>
                                  {getStatusLabel(getSlotStatus(booking))}
                                </Badge>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {dayBookings.length > 3 && (
                          <div className="text-[10px] text-muted-foreground px-1">
                            +{dayBookings.length - 3} weitere
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-neu-flat-sm mt-4">
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">Legende:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary" />
              <span>Gebucht</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>Anfrage (Wochenende)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Abgeschlossen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/50" />
              <span>Storniert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-dashed border-muted-foreground" />
              <span>Wochenende (nur auf Anfrage)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
