import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, Filter, Calendar, MapPin, Clock, User, Phone, Mail, Building2, Camera, Plane, Package, MoreHorizontal, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type BookingStatus = 'all' | 'confirmed' | 'request' | 'cancelled' | 'completed';

export default function AdminBookings() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<string | null>(
    searchParams.get('id')
  );
  const navigate = useNavigate();
  
  const { data: bookings = [], isLoading, refetch } = useAdminBookings();

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.contact_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  const selectedBookingData = useMemo(() => {
    return bookings.find(b => b.id === selectedBooking);
  }, [bookings, selectedBooking]);

  const getStatusBadge = (status: string, isWeekendRequest: boolean | null) => {
    if (isWeekendRequest && status === 'confirmed') {
      return <Badge className="bg-yellow-500 text-white">Wochenend-Anfrage</Badge>;
    }
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-primary text-primary-foreground">Bestätigt</Badge>;
      case 'request':
        return <Badge className="bg-yellow-500 text-white">Anfrage</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">Abgeschlossen</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPackageIcon = (packageType: string) => {
    switch (packageType) {
      case 'foto': return <Camera className="h-4 w-4" />;
      case 'drohne': return <Plane className="h-4 w-4" />;
      case 'kombi': return <Package className="h-4 w-4" />;
      default: return <Camera className="h-4 w-4" />;
    }
  };

  const getPackageLabel = (packageType: string) => {
    switch (packageType) {
      case 'foto': return 'Foto';
      case 'drohne': return 'Drohne';
      case 'kombi': return 'Kombi';
      default: return packageType;
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast.error('Fehler beim Aktualisieren des Status');
      return;
    }

    toast.success(`Buchung ${newStatus === 'completed' ? 'abgeschlossen' : newStatus === 'cancelled' ? 'storniert' : 'aktualisiert'}`);
    refetch();
  };

  // Stats
  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      todayBookings: bookings.filter(b => b.scheduled_date === todayStr).length,
      requests: bookings.filter(b => b.is_weekend_request).length,
    };
  }, [bookings]);

  return (
    <PageContainer>
      <PageHeader
        title="Buchungen"
        description="Verwaltung aller Shooting-Buchungen"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Buchungen' }
        ]}
        actions={
          <Button onClick={() => navigate('/admin/calendar')}>
            <Calendar className="h-4 w-4 mr-2" />
            Kalender
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-neu-flat-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Gesamt</div>
          </CardContent>
        </Card>
        <Card className="shadow-neu-flat-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{stats.confirmed}</div>
            <div className="text-sm text-muted-foreground">Bestätigt</div>
          </CardContent>
        </Card>
        <Card className="shadow-neu-flat-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.todayBookings}</div>
            <div className="text-sm text-muted-foreground">Heute</div>
          </CardContent>
        </Card>
        <Card className="shadow-neu-flat-sm">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.requests}</div>
            <div className="text-sm text-muted-foreground">Wochenend-Anfragen</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-neu-flat mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suche nach Name, E-Mail oder Adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="confirmed">Bestätigt</SelectItem>
                <SelectItem value="request">Anfrage</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="shadow-neu-flat">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Keine Buchungen gefunden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum / Zeit</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead className="hidden md:table-cell">Adresse</TableHead>
                  <TableHead className="hidden lg:table-cell">Paket</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow 
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedBooking(booking.id)}
                  >
                    <TableCell>
                      <div className="font-medium">
                        {format(new Date(booking.scheduled_date), 'dd.MM.yyyy', { locale: de })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {booking.scheduled_start.slice(0, 5)} - {booking.scheduled_end.slice(0, 5)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{booking.contact_name}</div>
                      <div className="text-sm text-muted-foreground">{booking.contact_email}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="max-w-[200px] truncate">{booking.address}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {getPackageIcon(booking.package_type)}
                        <span>{getPackageLabel(booking.package_type)}</span>
                        <Badge variant="outline">{booking.photo_count} Bilder</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status, booking.is_weekend_request)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking.id);
                          }}>
                            Details anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {booking.status !== 'completed' && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              updateBookingStatus(booking.id, 'completed');
                            }}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                              Als abgeschlossen markieren
                            </DropdownMenuItem>
                          )}
                          {booking.status !== 'cancelled' && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBookingStatus(booking.id, 'cancelled');
                              }}
                              className="text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Stornieren
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Buchungsdetails</DialogTitle>
            <DialogDescription>
              {selectedBookingData && format(new Date(selectedBookingData.scheduled_date), 'EEEE, dd. MMMM yyyy', { locale: de })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBookingData && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedBookingData.status, selectedBookingData.is_weekend_request)}
                <div className="flex gap-2">
                  {selectedBookingData.status !== 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        updateBookingStatus(selectedBookingData.id, 'completed');
                        setSelectedBooking(null);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Abschließen
                    </Button>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">
                    {selectedBookingData.scheduled_start.slice(0, 5)} - {selectedBookingData.scheduled_end.slice(0, 5)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dauer: {selectedBookingData.estimated_duration_minutes} Minuten
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{selectedBookingData.address}</div>
                  {selectedBookingData.property_type && (
                    <div className="text-sm text-muted-foreground">
                      {selectedBookingData.property_type === 'bewohnt' && 'Bewohnt'}
                      {selectedBookingData.property_type === 'unbewohnt' && 'Unbewohnt'}
                      {selectedBookingData.property_type === 'gestaged' && 'Gestaged'}
                      {selectedBookingData.square_meters && ` • ${selectedBookingData.square_meters} m²`}
                    </div>
                  )}
                </div>
              </div>

              {/* Package */}
              <div className="flex items-start gap-3">
                {getPackageIcon(selectedBookingData.package_type)}
                <div>
                  <div className="font-medium">
                    {getPackageLabel(selectedBookingData.package_type)}-Paket
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedBookingData.photo_count} Bilder
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{selectedBookingData.contact_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <a href={`mailto:${selectedBookingData.contact_email}`} className="text-primary hover:underline">
                    {selectedBookingData.contact_email}
                  </a>
                </div>
                {selectedBookingData.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <a href={`tel:${selectedBookingData.contact_phone}`} className="text-primary hover:underline">
                      {selectedBookingData.contact_phone}
                    </a>
                  </div>
                )}
                {selectedBookingData.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span>{selectedBookingData.company_name}</span>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedBookingData.notes && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-1">Notizen</div>
                  <div className="text-sm text-muted-foreground">{selectedBookingData.notes}</div>
                </div>
              )}

              {/* Batch Info */}
              {selectedBookingData.property_index > 1 && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <AlertCircle className="h-4 w-4 inline mr-2 text-muted-foreground" />
                  Teil einer Mehrfachbuchung (Objekt {selectedBookingData.property_index})
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
