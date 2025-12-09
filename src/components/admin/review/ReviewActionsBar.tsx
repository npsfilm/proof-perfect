import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, Loader2, Check } from 'lucide-react';
import { Gallery, Photo } from '@/types/database';

interface ReviewActionsBarProps {
  gallery: Gallery;
  selectedPhotos: Photo[];
  delivering: boolean;
  useExternalLink: boolean;
  deliveryFilesCount: number;
  onCopyFilenames: () => void;
  onDeliver: () => void;
}

export function ReviewActionsBar({
  gallery,
  selectedPhotos,
  delivering,
  useExternalLink,
  deliveryFilesCount,
  onCopyFilenames,
  onDeliver,
}: ReviewActionsBarProps) {
  if (!selectedPhotos || selectedPhotos.length === 0) return null;

  return (
    <div className="flex gap-3">
      <Button onClick={onCopyFilenames} variant="outline">
        <Copy className="h-4 w-4 mr-2" />
        Dateinamen kopieren
      </Button>
      
      {gallery.status !== 'Delivered' && (
        <Button 
          onClick={onDeliver}
          disabled={delivering || (!useExternalLink && deliveryFilesCount === 0)}
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

      {gallery.status === 'Delivered' && gallery.delivered_at && (
        <Badge variant="default" className="px-4 py-2">
          <Check className="h-4 w-4 mr-2" />
          Geliefert am {new Date(gallery.delivered_at).toLocaleDateString('de-DE')}
        </Badge>
      )}
    </div>
  );
}
