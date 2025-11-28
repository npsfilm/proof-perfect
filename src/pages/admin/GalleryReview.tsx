import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo, GalleryFeedback } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Copy, Send, Loader2, MessageSquare, Wand2, Check, MapPin } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { TimeElapsed } from '@/components/admin/TimeElapsed';

export default function GalleryReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deliveryLink, setDeliveryLink] = useState('');
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [delivering, setDelivering] = useState(false);

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
    if (!deliveryLink.trim()) {
      toast({
        title: 'Link fehlt',
        description: 'Bitte geben Sie einen Download-Link ein.',
        variant: 'destructive',
      });
      return;
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
          final_delivery_link: deliveryLink,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', id!);

      if (updateError) throw updateError;

      // 2. Send delivery webhook
      const { error: webhookError } = await supabase.functions.invoke('webhook-deliver', {
        body: {
          gallery_id: id,
          client_emails: clientEmails,
          download_link: deliveryLink,
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

      setShowDeliveryDialog(false);
      setDeliveryLink('');
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
  const photosWithComments = selectedPhotos?.filter(p => p.client_comment) || [];
  const photosWithAnnotations = allAnnotations ? 
    [...new Set(allAnnotations.map(a => a.photo_id))].length : 0;

  return (
    <PageContainer size="xl">
      <div className="space-y-6">
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
                {gallery.status}
              </Badge>
            </div>
          }
        />

      {gallery.status !== 'Closed' && gallery.status !== 'Delivered' && (
        <Alert>
          <AlertDescription>
            Diese Galerie wurde vom Kunden noch nicht überprüft. Ausgewählte Fotos erscheinen hier, sobald der Kunde seine Auswahl finalisiert hat.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ausgewählte Fotos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPhotos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              von {gallery.package_target_count} im Paket
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Staging-Anfragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stagingPhotos.length}</div>
            <p className="text-xs text-muted-foreground">Fotos benötigen Staging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Kommentare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photosWithComments.length}</div>
            <p className="text-xs text-muted-foreground">Fotos mit Notizen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Anmerkungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photosWithAnnotations}</div>
            <p className="text-xs text-muted-foreground">Fotos mit Markierungen</p>
          </CardContent>
        </Card>
      </div>

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

      {/* Actions */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <div className="flex gap-3">
          <Button onClick={handleCopyFilenames} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Dateinamen kopieren
          </Button>
          
          {gallery.status !== 'Delivered' && (
            <Button onClick={() => setShowDeliveryDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Finale Dateien ausliefern
            </Button>
          )}

          {gallery.status === 'Delivered' && gallery.final_delivery_link && (
            <Button variant="outline" onClick={() => window.open(gallery.final_delivery_link!, '_blank')}>
              <Check className="h-4 w-4 mr-2" />
              Lieferlink ansehen
            </Button>
          )}
        </div>
      )}

      {/* Selected Photos Grid */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ausgewählte Fotos ({selectedPhotos.length})</CardTitle>
            <CardDescription>Vom Kunden gewählte Fotos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedPhotos.map((photo) => {
                const photoAnnotations = allAnnotations?.filter(a => a.photo_id === photo.id) || [];
                
                return (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary relative">
                      <img
                        src={photo.storage_url}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                      
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
                                      {/* Marker Pin */}
                                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-background hover:scale-110 transition-transform">
                                        {idx + 1}
                                      </div>
                                      {/* Pointer */}
                                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary"></div>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                  side="top" 
                                  className="max-w-xs"
                                  sideOffset={8}
                                >
                                  <p className="text-sm font-medium mb-1">Anmerkung {idx + 1}</p>
                                  <p className="text-xs">{annotation.comment}</p>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                          
                          {/* Count Badge */}
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                            {photoAnnotations.length}
                          </div>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-mono truncate">{photo.filename}</p>
                      
                      {photo.staging_requested && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Wand2 className="h-3 w-3" />
                          <span>Staging: {photo.staging_style || 'Modern'}</span>
                        </div>
                      )}
                      
                      {photo.client_comment && (
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
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

      {/* Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finale Dateien ausliefern</DialogTitle>
            <DialogDescription>
              Geben Sie den Download-Link für die finalen bearbeiteten Fotos ein (z.B. Google Drive, TransferNow)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-link">Download-Link</Label>
              <Input
                id="delivery-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={deliveryLink}
                onChange={(e) => setDeliveryLink(e.target.value)}
              />
            </div>
            
            <Alert>
              <AlertDescription>
                Dies sendet eine Benachrichtigung an {clientEmails?.length || 0} Kunde(n) mit dem Download-Link.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleDeliverFinalFiles} disabled={delivering}>
              {delivering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Auslieferung senden
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageContainer>
  );
}