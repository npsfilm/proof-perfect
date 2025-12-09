import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gallery, Photo } from '@/types/database';

interface ReviewStatsGridProps {
  gallery: Gallery;
  selectedPhotos: Photo[];
  stagingPhotos: Photo[];
  blueHourPhotos: Photo[];
  photosWithComments: Photo[];
  photosWithAnnotations: number;
}

export function ReviewStatsGrid({
  gallery,
  selectedPhotos,
  stagingPhotos,
  blueHourPhotos,
  photosWithComments,
  photosWithAnnotations,
}: ReviewStatsGridProps) {
  return (
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
  );
}
