import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/PageHeader';
import { Copy, Eye } from 'lucide-react';
import { Gallery } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface GalleryDetailHeaderProps {
  gallery: Gallery;
}

export function GalleryDetailHeader({ gallery }: GalleryDetailHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`);
    toast({
      title: 'URL kopiert!',
      description: 'Die Galerie-URL wurde in die Zwischenablage kopiert.',
    });
  };

  return (
    <PageHeader
      title={gallery.name}
      description={gallery.slug}
      breadcrumbs={[
        { label: 'Galerien', href: '/admin/galleries' },
        { label: gallery.name },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            <Copy className="h-4 w-4 mr-2" />
            URL kopieren
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/gallery/${gallery.slug}`, '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
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
  );
}
