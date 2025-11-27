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
import { GalleryInfoCard } from '@/components/admin/gallery/GalleryInfoCard';
import { GalleryClientsCard } from '@/components/admin/gallery/GalleryClientsCard';
import { GalleryPhotosSection } from '@/components/admin/gallery/GalleryPhotosSection';
import { GallerySendActions } from '@/components/admin/gallery/GallerySendActions';
import { ArrowLeft, Loader2 } from 'lucide-react';

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

  const handleCompanyChange = async (companyId: string) => {
    try {
      await supabase.rpc('assign_gallery_to_company', {
        p_gallery_id: id!,
        p_company_id: companyId || null,
      });
      
      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      toast({
        title: 'Unternehmen aktualisiert',
        description: 'Unternehmens-Zuweisung der Galerie erfolgreich aktualisiert',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
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

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/galleries')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{gallery.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{gallery.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {(gallery.status === 'Reviewed' || gallery.status === 'Delivered') && (
            <Button onClick={() => navigate(`/admin/galleries/${gallery.id}/review`)}>
              Überprüfung ansehen
            </Button>
          )}
          <Badge>{gallery.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <GalleryInfoCard
          gallery={gallery}
          photoCount={photos?.length ?? 0}
          companies={companies}
          onCompanyChange={handleCompanyChange}
        />

        <GalleryClientsCard
          selectedClients={selectedClients}
          onClientsChange={setSelectedClients}
          disabled={gallery.status !== 'Draft'}
        />
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
    </div>
  );
}