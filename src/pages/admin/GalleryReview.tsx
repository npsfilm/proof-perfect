import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { TimeElapsed } from '@/components/admin/TimeElapsed';
import { DownloadHistoryCard } from '@/components/admin/delivery/DownloadHistoryCard';
import {
  useGalleryReviewData,
  useDeliveryActions,
  GalleryInfoSummary,
  CollapsibleFeedbackCard,
  CollapsibleReferencesCard,
  CompactDeliverySection,
  ReviewActionsBar,
  ReviewPhotoGrid,
} from '@/components/admin/review';

const STATUS_LABELS: Record<string, string> = {
  'Planning': 'Planung',
  'Open': 'Offen',
  'Closed': 'Geschlossen',
  'Processing': 'In Bearbeitung',
  'Delivered': 'Geliefert',
};

export default function GalleryReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    gallery,
    galleryLoading,
    selectedPhotos,
    feedback,
    clientEmails,
    deliveryFiles,
    allAnnotations,
    stagingReferences,
    signedUrls,
  } = useGalleryReviewData(id);

  const {
    delivering,
    resending,
    useExternalLink,
    setUseExternalLink,
    externalLink,
    setExternalLink,
    handleDeliverFinalFiles,
    handleResendDelivery,
    handleCopyFilenames,
  } = useDeliveryActions({
    gallery,
    clientEmails,
    deliveryFiles,
  });

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

  return (
    <PageContainer size="xl">
      <div className="space-y-3">
        <PageHeader
          title={gallery.status === 'Delivered' ? `Geliefert: ${gallery.name}` : `In Bearbeitung: ${gallery.name}`}
          description="Kundenauswahl und Feedback"
          breadcrumbs={[
            { label: 'Galerien', href: '/admin/galleries' },
            { label: gallery.name, href: `/admin/galleries/${id}` },
            { label: 'Überprüfung' }
          ]}
          actions={
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              {gallery.reviewed_at && (
                <TimeElapsed 
                  startTime={gallery.reviewed_at} 
                  label="seit Freigabe"
                  variant="secondary"
                />
              )}
              {gallery.status === 'Delivered' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResendDelivery}
                  disabled={resending}
                  className="w-full sm:w-auto"
                >
                  {resending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Erneut senden
                </Button>
              )}
            </div>
          }
        />

        {/* Compact Gallery Info Summary */}
        <GalleryInfoSummary
          gallery={gallery}
          selectedPhotos={selectedPhotos || []}
          stagingPhotos={stagingPhotos}
          blueHourPhotos={blueHourPhotos}
          photosWithComments={photosWithComments}
          photosWithAnnotations={photosWithAnnotations}
          companyName={gallery.companies?.name}
        />

        {gallery.status !== 'Closed' && gallery.status !== 'Delivered' && (
          <Alert>
            <AlertDescription className="text-sm">
              Diese Galerie wurde vom Kunden noch nicht überprüft. Ausgewählte Fotos erscheinen hier, sobald der Kunde seine Auswahl finalisiert hat.
            </AlertDescription>
          </Alert>
        )}

        {/* Collapsible sections for feedback and references */}
        {(feedback?.length > 0 || stagingReferences?.length > 0) && (
          <div className="space-y-2">
            <CollapsibleFeedbackCard feedback={feedback || []} />
            <CollapsibleReferencesCard stagingReferences={stagingReferences || []} />
          </div>
        )}

        {/* Compact Download History */}
        <DownloadHistoryCard galleryId={gallery.id} />

        {/* Compact Delivery Section */}
        <CompactDeliverySection
          galleryId={gallery.id}
          gallerySlug={gallery.slug}
          useExternalLink={useExternalLink}
          setUseExternalLink={setUseExternalLink}
          externalLink={externalLink}
          setExternalLink={setExternalLink}
          isDelivered={gallery.status === 'Delivered'}
        />

        {/* Actions Bar */}
        <ReviewActionsBar
          gallery={gallery}
          selectedPhotos={selectedPhotos || []}
          delivering={delivering}
          useExternalLink={useExternalLink}
          deliveryFilesCount={deliveryFiles?.length || 0}
          onCopyFilenames={() => handleCopyFilenames(selectedPhotos)}
          onDeliver={handleDeliverFinalFiles}
        />

        {/* Photo Grid */}
        <ReviewPhotoGrid
          selectedPhotos={selectedPhotos || []}
          allAnnotations={allAnnotations || []}
          signedUrls={signedUrls}
        />
      </div>
    </PageContainer>
  );
}
