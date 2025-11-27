import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/database';
import { useCompanies } from '@/hooks/useCompanies';
import { useGalleryClients } from '@/hooks/useClients';
import { useGallery } from '@/hooks/useGallery';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EditableGalleryInfo } from '@/components/admin/gallery/EditableGalleryInfo';
import { GalleryClientsCard } from '@/components/admin/gallery/GalleryClientsCard';
import { GalleryPhotosSection } from '@/components/admin/gallery/GalleryPhotosSection';
import { GallerySendActions } from '@/components/admin/gallery/GallerySendActions';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { GalleryDetailSkeleton } from '@/components/admin/skeletons/GalleryDetailSkeleton';
import { Copy } from 'lucide-react';

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

  useEffect(() => {
    if (galleryClients) {
      const clients = galleryClients.map((gc: any) => gc.clients);
      setSelectedClients(clients);
    }
  }, [galleryClients]);

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

  const isDraft = gallery.status === 'Draft';

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
              {(gallery.status === 'Reviewed' || gallery.status === 'Delivered') && (
                <Button onClick={() => navigate(`/admin/galleries/${gallery.id}/review`)}>
                  Überprüfung ansehen
                </Button>
              )}
              <Badge variant={isDraft ? 'secondary' : 'default'}>
                {gallery.status}
              </Badge>
            </div>
          }
        />

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
      </div>
    </PageContainer>
  );
}
