import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@/types/database';
import { useCompanies } from '@/hooks/useCompanies';
import { useGalleryClients } from '@/hooks/useClients';
import { useGallery, useGalleryPhotos } from '@/hooks/galleries';
import { useReopenRequests } from '@/hooks/useReopenRequests';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/admin/PageContainer';
import { GalleryDetailSkeleton } from '@/components/admin/skeletons/GalleryDetailSkeleton';
import { GalleryProgressBar } from '@/components/ui/GalleryProgressBar';
import {
  GalleryDetailHeader,
  ReopenRequestsAlert,
  ClosedGalleryCard,
  EditableGalleryInfo,
  GalleryClientsCard,
  GalleryPhotosSection,
  GallerySendActions,
  useGalleryDetailActions,
  ReopenRequest,
} from '@/components/admin/gallery';

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: companies } = useCompanies();
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);

  const { data: gallery, isLoading: galleryLoading } = useGallery(id);
  const { data: photos, refetch: refetchPhotos } = useGalleryPhotos(id);
  const { data: galleryClients } = useGalleryClients(id);
  const { data: reopenRequests } = useReopenRequests(id);

  const {
    handleApproveRequest,
    handleRejectRequest,
    handleReopenGallery,
    isResolving,
  } = useGalleryDetailActions(id);

  const pendingRequests = (reopenRequests?.filter(
    (req) => req.status === 'pending'
  ) || []) as ReopenRequest[];

  useEffect(() => {
    if (galleryClients) {
      const clients = galleryClients.map((gc: any) => gc.clients);
      setSelectedClients(clients);
    }
  }, [galleryClients]);

  // Auto-redirect to review page for Processing/Delivered galleries
  useEffect(() => {
    if (gallery && (gallery.status === 'Processing' || gallery.status === 'Delivered')) {
      navigate(`/admin/galleries/${gallery.id}/review`, { replace: true });
    }
  }, [gallery, navigate]);

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

  return (
    <PageContainer size="full">
      <div className="space-y-4">
        {/* Header with integrated progress bar */}
        <div className="space-y-3">
          <GalleryDetailHeader gallery={gallery} />
          <GalleryProgressBar currentStatus={gallery.status} />
        </div>

        <ReopenRequestsAlert
          pendingRequests={pendingRequests}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
          isResolving={isResolving}
        />

        {isClosed ? (
          <div className="space-y-4">
            <ClosedGalleryCard
              gallery={gallery}
              photos={photos}
              selectedClients={selectedClients}
              onReopenGallery={handleReopenGallery}
            />
            <GallerySendActions
              gallery={gallery}
              selectedClients={selectedClients}
              photos={photos}
              galleryClients={galleryClients}
            />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <EditableGalleryInfo
                  gallery={gallery}
                  companies={companies}
                  photoCount={photos?.length ?? 0}
                  isDraft={isDraft}
                />
              </div>
              <div>
                <GalleryClientsCard
                  selectedClients={selectedClients}
                  onClientsChange={setSelectedClients}
                  disabled={!isDraft}
                />
              </div>
            </div>

            <GalleryPhotosSection
              galleryId={gallery.id}
              gallerySlug={gallery.slug}
              photos={photos}
              onUploadComplete={() => refetchPhotos()}
            />

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
