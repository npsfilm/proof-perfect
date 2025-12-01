import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo, GalleryFeedback, StagingReference } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Send, Loader2, MessageSquare, Wand2, Check, MapPin, Clock, Home, Sunrise } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { TimeElapsed } from '@/components/admin/TimeElapsed';
import { DeliveryUploadSection } from '@/components/admin/delivery/DeliveryUploadSection';
import { DownloadHistoryCard } from '@/components/admin/delivery/DownloadHistoryCard';
import { useDeliveryFiles } from '@/hooks/useDeliveryFiles';

export default function GalleryReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [delivering, setDelivering] = useState(false);
  const [useExternalLink, setUseExternalLink] = useState(false);
  const [externalLink, setExternalLink] = useState('');

  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Gallery;
    },
  });

  // Automatically set status to Processing when opening review page
  useEffect(() => {
    const updateStatusToProcessing = async () => {
      if (gallery && gallery.status === 'Closed') {
        try {
          const { error } = await supabase
            .from('galleries')
            .update({ status: 'Processing' })
            .eq('id', gallery.id);

          if (error) {
            console.error('Error updating status:', error);
            return;
          }

          // Invalidate queries to update UI
          queryClient.invalidateQueries({ queryKey: ['gallery', id] });
          queryClient.invalidateQueries({ queryKey: ['galleries'] });

          toast({
            title: 'Status aktualisiert',
            description: 'Galerie ist jetzt in Bearbeitung.',
          });
        } catch (error) {
          console.error('Error updating gallery status:', error);
        }
      }
    };

    updateStatusToProcessing();
  }, [gallery, id, queryClient, toast]);

  const { data: selectedPhotos } = useQuery({
    queryKey: ['selected-photos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', id!)
        .eq('is_selected', true)
        .order('upload_order', { ascending: true });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!id,
  });

  const { data: feedback } = useQuery({
    queryKey: ['gallery-feedback', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_feedback')
        .select('*, profiles(email)')
        .eq('gallery_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: clientEmails } = useQuery({
    queryKey: ['gallery-clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_access')
        .select('profiles(email)')
        .eq('gallery_id', id!);
      if (error) throw error;
      return data.map((a: any) => a.profiles.email) as string[];
    },
    enabled: !!id,
  });

  // Fetch delivery files to check if any are uploaded
  const { data: deliveryFiles } = useDeliveryFiles(id);

  // Fetch all annotations for selected photos
  const { data: allAnnotations } = useQuery({
    queryKey: ['all-annotations', id],
    queryFn: async () => {
      if (!selectedPhotos || selectedPhotos.length === 0) return [];
      
      const photoIds = selectedPhotos.map(p => p.id);
      const { data, error } = await supabase
        .from('photo_annotations')
        .select('*')
        .in('photo_id', photoIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedPhotos && selectedPhotos.length > 0,
  });

  // Fetch staging references
  const { data: stagingReferences } = useQuery({
    queryKey: ['staging-references', id],
    queryFn: async () => {
      if (!selectedPhotos || selectedPhotos.length === 0) return [];
      
      const photoIds = selectedPhotos.map(p => p.id);
      const { data, error } = await supabase
        .from('staging_references')
        .select('*')
        .in('photo_id', photoIds);
      
      if (error) throw error;
      return data as StagingReference[];
    },
    enabled: !!selectedPhotos && selectedPhotos.length > 0,
  });

  const handleCopyFilenames = () => {
    if (!selectedPhotos || selectedPhotos.length === 0) {
      toast({
        title: 'Keine Fotos ausgewählt',
        description: 'Es wurden keine ausgewählten Fotos zum Kopieren gefunden.',
        variant: 'destructive',
      });
      return;
    }

    const filenames = selectedPhotos.map(p => p.filename).join(' ');
    navigator.clipboard.writeText(filenames);
    
    toast({
      title: 'Kopiert!',
      description: `${selectedPhotos.length} Dateinamen in Zwischenablage kopiert.`,
    });
  };

  const handleDeliverFinalFiles = async () => {
    // Validate based on delivery method
    if (useExternalLink) {
      if (!externalLink.trim()) {
        toast({
          title: 'Externer Link fehlt',
          description: 'Bitte geben Sie einen externen Download-Link ein.',
          variant: 'destructive',
        });
        return;
      }
      // Validate URL format
      try {
        new URL(externalLink);
      } catch {
        toast({
          title: 'Ungültiger Link',
          description: 'Bitte geben Sie einen gültigen URL ein.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // For in-app downloads, require uploaded files
      if (!deliveryFiles || deliveryFiles.length === 0) {
        toast({
          title: 'Keine Dateien',
          description: 'Bitte laden Sie mindestens eine Datei hoch, bevor Sie ausliefern.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!clientEmails || clientEmails.length === 0) {
      toast({
        title: 'Keine Kunden',
        description: 'Keine Kunden-E-Mails für diese Galerie gefunden.',
        variant: 'destructive',
      });
      return;
    }

    setDelivering(true);
    try {
      // 1. Update gallery with delivery info
      const { error: updateError } = await supabase
        .from('galleries')
        .update({
          status: 'Delivered',
          delivered_at: new Date().toISOString(),
          final_delivery_link: useExternalLink ? externalLink : null,
        })
        .eq('id', id!);

      if (updateError) throw updateError;

      // 2. Construct download link
      const downloadLink = useExternalLink 
        ? externalLink 
        : `${window.location.origin}/gallery/${gallery.slug}`;

      // 3. Send delivery webhook
      const { error: webhookError } = await supabase.functions.invoke('webhook-deliver', {
        body: {
          gallery_id: id,
          client_emails: clientEmails,
          download_link: downloadLink,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }

      queryClient.invalidateQueries({ queryKey: ['gallery', id] });

      toast({
        title: 'Lieferung gesendet!',
        description: `Benachrichtigung über die Auslieferung der finalen Dateien an ${clientEmails.length} Kunde(n) gesendet.`,
      });
    } catch (error: any) {
      console.error('Delivery error:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDelivering(false);
    }
  };

  if (galleryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Galerie nicht gefunden</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/galleries')}>
          Zurück zu Galerien
        </Button>
      </div>
    );
  }

  const stagingPhotos = selectedPhotos?.filter(p => p.staging_requested) || [];
  const blueHourPhotos = selectedPhotos?.filter(p => p.blue_hour_requested) || [];
  const photosWithComments = selectedPhotos?.filter(p => p.client_comment) || [];
  const photosWithAnnotations = allAnnotations ? 
    [...new Set(allAnnotations.map(a => a.photo_id))].length : 0;

  // Status translations
  const statusLabels: Record<string, string> = {
    'Planning': 'Planung',
    'Open': 'Offen',
    'Closed': 'Geschlossen',
    'Processing': 'In Bearbeitung',
    'Delivered': 'Geliefert',
  };

  const hasServices = gallery.express_delivery_requested || stagingPhotos.length > 0 || blueHourPhotos.length > 0;

  return (
    <PageContainer size="xl">
      <div className="space-y-4">
        <PageHeader
          title={gallery.status === 'Delivered' ? `Geliefert: ${gallery.name}` : `In Bearbeitung: ${gallery.name}`}
          description="Kundenauswahl und Feedback"
          breadcrumbs={[
            { label: 'Galerien', href: '/admin/galleries' },
            { label: gallery.name, href: `/admin/galleries/${id}` },
            { label: 'Überprüfung' }
          ]}
          actions={
            <div className="flex items-center gap-3">
              {gallery.reviewed_at && (
                <TimeElapsed 
                  startTime={gallery.reviewed_at} 
                  label="seit Freigabe"
                  variant="secondary"
                />
              )}
              <Badge variant={gallery.status === 'Delivered' ? 'default' : 'secondary'}>
                {statusLabels[gallery.status] || gallery.status}
              </Badge>
            </div>
          }
        />

      {/* Service Tags - Always visible */}
      <Card className={gallery.express_delivery_requested ? 'border-2 border-red-500 shadow-lg' : ''}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {gallery.express_delivery_requested && (
              <span className="text-red-600">⚡</span>
            )}
            Ausgewählte Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasServices ? (
            <p className="text-sm text-muted-foreground">Keine Zusatzleistungen gebucht</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {gallery.express_delivery_requested && (
                <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 animate-pulse">
                  <Clock className="h-4 w-4 mr-1" />
                  24H EXPRESS
                </Badge>
              )}
              {stagingPhotos.length > 0 && (
                <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1">
                  <Home className="h-4 w-4 mr-1" />
                  {stagingPhotos.length}× Staging
                </Badge>
              )}
              {blueHourPhotos.length > 0 && (
                <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 py-1">
                  <Sunrise className="h-4 w-4 mr-1" />
                  {blueHourPhotos.length}× Blaue Stunde
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {gallery.status !== 'Closed' && gallery.status !== 'Delivered' && (
        <Alert>
          <AlertDescription>
            Diese Galerie wurde vom Kunden noch nicht überprüft. Ausgewählte Fotos erscheinen hier, sobald der Kunde seine Auswahl finalisiert hat.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats - Compact */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Ausgewählte Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{selectedPhotos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">von {gallery.package_target_count}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Staging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{stagingPhotos.length}</div>
            <p className="text-xs text-muted-foreground">Anfragen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Kommentare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{photosWithComments.length}</div>
            <p className="text-xs text-muted-foreground">Fotos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Anmerkungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{photosWithAnnotations}</div>
            <p className="text-xs text-muted-foreground">Markierungen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Blaue Stunde</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{blueHourPhotos.length}</div>
            <p className="text-xs text-muted-foreground">Fotos</p>
          </CardContent>
        </Card>
      </div>

      {/* Reference Images - Compact */}
      {stagingReferences && stagingReferences.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Referenzbilder ({stagingReferences.length})</CardTitle>
            <CardDescription className="text-xs">Staging-Referenzen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {stagingReferences.map((ref) => (
                <div key={ref.id} className="space-y-1">
                  <div className="aspect-square rounded-md overflow-hidden border border-purple-500">
                    <img
                      src={ref.file_url}
                      alt="Staging Referenz"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {ref.notes && (
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{ref.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Feedback */}
      {feedback && feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kunden-Feedback</CardTitle>
            <CardDescription>Allgemeine Kommentare vom Kunden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.map((item: any) => (
              <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
                <p className="text-sm">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.profiles.email} • {new Date(item.created_at).toLocaleString('de-DE')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Download History */}
      <DownloadHistoryCard galleryId={gallery.id} />

      {/* Delivery Upload Section */}
      {gallery && (
        <DeliveryUploadSection galleryId={gallery.id} gallerySlug={gallery.slug} />
      )}

      {/* Download Method Selection */}
      {gallery.status !== 'Delivered' && (
        <Card>
          <CardHeader>
            <CardTitle>Download-Methode</CardTitle>
            <CardDescription>Wählen Sie, wie Kunden ihre Fotos herunterladen sollen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delivery-method"
                  checked={!useExternalLink}
                  onChange={() => setUseExternalLink(false)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">In-App Downloads (empfohlen)</div>
                  <p className="text-sm text-muted-foreground">
                    Kunden laden direkt von der Website herunter
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="delivery-method"
                  checked={useExternalLink}
                  onChange={() => setUseExternalLink(true)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Externen Link verwenden</div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Weiterleitung zu TransferNow, Google Drive, etc.
                  </p>
                  {useExternalLink && (
                    <input
                      type="url"
                      placeholder="https://www.transfernow.net/dl/..."
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-input bg-background shadow-neu-pressed focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <div className="flex gap-3">
          <Button onClick={handleCopyFilenames} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Dateinamen kopieren
          </Button>
          
          {gallery.status !== 'Delivered' && (
            <Button 
              onClick={handleDeliverFinalFiles}
              disabled={delivering || (!useExternalLink && (!deliveryFiles || deliveryFiles.length === 0))}
            >
              {delivering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  An Kunde senden
                </>
              )}
            </Button>
          )}

          {gallery.status === 'Delivered' && (
            <Badge variant="default" className="px-4 py-2">
              <Check className="h-4 w-4 mr-2" />
              Geliefert am {new Date(gallery.delivered_at!).toLocaleDateString('de-DE')}
            </Badge>
          )}
        </div>
      )}

      {/* Selected Photos Grid - Compact with aspect-[4/3] */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ausgewählte Fotos ({selectedPhotos.length})</CardTitle>
            <CardDescription className="text-xs">Vom Kunden gewählte Fotos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {selectedPhotos.map((photo) => {
                const photoAnnotations = allAnnotations?.filter(a => a.photo_id === photo.id) || [];
                
                // Determine border styling based on services
                let borderClass = 'border border-muted';
                if (photo.staging_requested) {
                  borderClass = 'border-2 border-purple-500';
                } else if (photo.blue_hour_requested) {
                  borderClass = 'border-2 border-transparent bg-gradient-to-br from-blue-500 to-orange-500 p-0.5';
                }
                
                return (
                  <div key={photo.id} className="relative group">
                    <div className={`aspect-[4/3] rounded-md overflow-hidden relative ${borderClass}`}>
                      <div className={photo.blue_hour_requested ? 'w-full h-full rounded-sm overflow-hidden' : ''}>
                        <img
                          src={photo.storage_url}
                          alt={photo.filename}
                          className="w-full h-full object-contain bg-muted"
                        />
                      </div>
                      
                      {/* Annotation Markers Overlay */}
                      {photoAnnotations.length > 0 && (
                        <TooltipProvider>
                          <div className="absolute inset-0 pointer-events-none">
                            {photoAnnotations.map((annotation, idx) => (
                              <Tooltip key={annotation.id} delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <div
                                    className="absolute pointer-events-auto cursor-help"
                                    style={{
                                      left: `${annotation.x_position}%`,
                                      top: `${annotation.y_position}%`,
                                      transform: 'translate(-50%, -50%)',
                                    }}
                                  >
                                    <div className="relative">
                                      <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border border-background hover:scale-110 transition-transform">
                                        {idx + 1}
                                      </div>
                                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-primary"></div>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs" sideOffset={8}>
                                  <p className="text-xs font-medium mb-1">Anmerkung {idx + 1}</p>
                                  <p className="text-[10px]">{annotation.comment}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          
                          <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md">
                            {photoAnnotations.length}
                          </div>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[10px] font-mono truncate">{photo.filename}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {photo.staging_requested && (
                          <Badge className="bg-purple-100 text-purple-700 text-[9px] px-1 py-0">
                            <Wand2 className="h-2 w-2 mr-0.5" />
                            {photo.staging_style || 'Modern'}
                          </Badge>
                        )}
                        
                        {photo.blue_hour_requested && (
                          <Badge className="bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 text-[9px] px-1 py-0">
                            <Sunrise className="h-2 w-2 mr-0.5" />
                            Blaue Stunde
                          </Badge>
                        )}
                      </div>
                      
                      {photo.client_comment && (
                        <div className="flex items-start gap-1 text-[10px] text-muted-foreground">
                          <MessageSquare className="h-2.5 w-2.5 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{photo.client_comment}</span>
                        </div>
                      )}

                      {photoAnnotations.length > 0 && (
                        <div className="space-y-1 mt-2 pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs font-medium text-primary">
                            <MapPin className="h-3 w-3" />
                            <span>{photoAnnotations.length} Markierung(en)</span>
                          </div>
                          <p className="text-xs text-muted-foreground italic">
                            Hover über die Marker im Bild für Details
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      </div>
    </PageContainer>
  );
}