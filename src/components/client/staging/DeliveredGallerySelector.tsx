import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDeliveredGalleries } from '@/hooks/useDeliveredGalleries';
import { LoadingState } from '@/components/ui/loading-state';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface DeliveredGallerySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function DeliveredGallerySelector({ value, onChange }: DeliveredGallerySelectorProps) {
  const { data: galleries, isLoading } = useDeliveredGalleries();

  if (isLoading) {
    return <LoadingState message="Galerien werden geladen..." />;
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Keine gelieferten Galerien verfügbar</p>
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="shadow-neu-pressed">
        <SelectValue placeholder="Galerie auswählen..." />
      </SelectTrigger>
      <SelectContent>
        {galleries.map((gallery) => (
          <SelectItem key={gallery.gallery_id} value={gallery.gallery_id}>
            <div className="flex flex-col">
              <span className="font-medium">{gallery.name}</span>
              <span className="text-xs text-muted-foreground">
                Geliefert am {format(new Date(gallery.created_at), 'dd.MM.yyyy', { locale: de })}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
