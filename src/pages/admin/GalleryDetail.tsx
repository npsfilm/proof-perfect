import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/database';
import { useCompanies } from '@/hooks/useCompanies';
import { useGalleryClients } from '@/hooks/useClients';
import { useGallery } from '@/hooks/useGallery';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useReopenRequests, useResolveReopenRequest } from '@/hooks/useReopenRequests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { EditableGalleryInfo } from '@/components/admin/gallery/EditableGalleryInfo';
import { GalleryClientsCard } from '@/components/admin/gallery/GalleryClientsCard';
import { GalleryPhotosSection } from '@/components/admin/gallery/GalleryPhotosSection';
import { GallerySendActions } from '@/components/admin/gallery/GallerySendActions';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { GalleryDetailSkeleton } from '@/components/admin/skeletons/GalleryDetailSkeleton';
import { Copy, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { GalleryProgressBar } from '@/components/ui/GalleryProgressBar';

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companies } = useCompanies();
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const { data: gallery, isLoading: galleryLoading } = useGallery(id);
  const { data: photos, refetch: refetchPhotos } = useGalleryPhotos(id);
  const { data: galleryClients } = useGalleryClients(id);
  const { data: reopenRequests } = useReopenRequests(id);
  const resolveRequest = useResolveReopenRequest();

  const pendingRequests = reopenRequests?.filter(req => req.status === 'pending') || [];

  useEffect(() => {
    if (galleryClients) {
      const clients = galleryClients.map((gc: any) => gc.clients);
      setSelectedClients(clients);
    }
  }, [galleryClients]);

  // Auto-redirect to review page for Processing/Delivered galleries
  // MUST be before any conditional returns to avoid hook ordering issues
  useEffect(() => {
    if (gallery && (gallery.status === 'Processing' || gallery.status === 'Delivered')) {
      navigate(`/admin/galleries/${gallery.id}/review`, { replace: true });
    }
  }, [gallery, navigate]);

  const handleCopyUrl = () => {
    if (gallery) {
      navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`);
      toast({ 
        title: 'URL kopiert!', 
        description: 'Die Galerie-URL wurde in die Zwischenablage kopiert.' 
      });
    }
  };

  if (galleryLoading) {
    return <GalleryDetailSkeleton />;
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

  const isDraft = gallery.status === 'Planning';
  const isClosed = gallery.status === 'Closed';

  const handleApproveRequest = async (requestId: string) => {
    resolveRequest.mutate(
      { requestId, status: 'approved', reopenGallery: true },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['gallery', gallery?.id] });
        },
      }
    );
  };

  const handleRejectRequest = async (requestId: string) => {
    resolveRequest.mutate({ requestId, status: 'rejected' });
  };

  const handleReopenGallery = async () => {
    try {
      const { error } = await supabase
        .from('galleries')
        .update({ status: 'Open' })
        .eq('id', gallery.id);

      if (error) throw error;

      toast({
        title: 'Galerie geöffnet',
        description: 'Die Galerie wurde wieder geöffnet und kann bearbeitet werden.',
      });

      queryClient.invalidateQueries({ queryKey: ['gallery', gallery.id] });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <PageContainer size="full">
      <div className="space-y-6">
        <PageHeader
          title={gallery.name}
          description={gallery.slug}
          breadcrumbs={[
            { label: 'Galerien', href: '/admin/galleries' },
            { label: gallery.name }
          ]}
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyUrl}
              >
                <Copy className="h-4 w-4 mr-2" />
                URL kopieren
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`/gallery/${gallery.slug}`, '_blank')}
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Kunden-Ansicht
              </Button>
              {gallery.status === 'Closed' && (
                <Button onClick={() => navigate(`/admin/galleries/${gallery.id}/review`)}>
                  Bearbeitung starten
                </Button>
              )}
            </div>
          }
        />

        {/* Reopen Requests Alert */}
        {pendingRequests.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900 dark:text-orange-100">
              Anfrage zur Wiedereröffnung
            </AlertTitle>
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="space-y-3 mt-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-start justify-between gap-4 p-3 bg-white dark:bg-orange-900/20 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Ein Kunde bittet um Wiedereröffnung dieser Galerie
                      </p>
                      {request.message && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          Nachricht: "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.created_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={resolveRequest.isPending}
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Genehmigen
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectRequest(request.id)}
                        disabled={resolveRequest.isPending}
                        className="gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        Ablehnen
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Gallery Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <GalleryProgressBar currentStatus={gallery.status} />
          </CardContent>
        </Card>

        {isClosed ? (
          /* Compact View for Closed Galleries */
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-800 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Galerie geschlossen</h3>
                    <p className="text-sm text-muted-foreground">
                      Die Galerie ist geschlossen. Bearbeitung und Upload sind nicht verfügbar.
                    </p>
                  </div>
                  {gallery.status === 'Closed' && (
                    <Button onClick={handleReopenGallery} variant="outline" size="lg">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      Galerie wieder öffnen
                    </Button>
                  )}
                </div>

                {/* Compact Summary */}
                <div className="mt-8 grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fotos</p>
                    <p className="text-xl font-bold">{photos?.length ?? 0}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paket-Ziel</p>
                    <p className="text-xl font-bold">{gallery.package_target_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Kunden</p>
                    <p className="text-xl font-bold">{selectedClients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Send Actions - Full Width */}
            <GallerySendActions
              gallery={gallery}
              selectedClients={selectedClients}
              photos={photos}
              galleryClients={galleryClients}
            />
          </div>
        ) : (
          /* Full View for Planning/Open Galleries */
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content - Left Side (2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                <EditableGalleryInfo
                  gallery={gallery}
                  companies={companies}
                  photoCount={photos?.length ?? 0}
                  isDraft={isDraft}
                />
              </div>

              {/* Sidebar - Right Side (1 column) */}
              <div className="space-y-6">
                <GalleryClientsCard
                  selectedClients={selectedClients}
                  onClientsChange={setSelectedClients}
                  disabled={!isDraft}
                />
              </div>
            </div>

            {/* Photos Section - Full Width */}
            <GalleryPhotosSection
              galleryId={gallery.id}
              gallerySlug={gallery.slug}
              photos={photos}
              onUploadComplete={() => refetchPhotos()}
            />

            {/* Send Actions - Full Width */}
            <GallerySendActions
              gallery={gallery}
              selectedClients={selectedClients}
              photos={photos}
              galleryClients={galleryClients}
            />
          </>
        )}
      </div>
    </PageContainer>
  );
}
