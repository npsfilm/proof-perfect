import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Home, Sunrise } from 'lucide-react';
import { Gallery, Photo } from '@/types/database';

interface ReviewServicesCardProps {
  gallery: Gallery;
  stagingPhotos: Photo[];
  blueHourPhotos: Photo[];
}

export function ReviewServicesCard({ gallery, stagingPhotos, blueHourPhotos }: ReviewServicesCardProps) {
  const hasServices = gallery.express_delivery_requested || stagingPhotos.length > 0 || blueHourPhotos.length > 0;

  return (
    <Card className={gallery.express_delivery_requested ? 'border-2 border-red-500 shadow-lg' : ''}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          {gallery.express_delivery_requested && (
            <span className="text-red-600">⚡</span>
          )}
          Ausgewählte Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasServices ? (
          <p className="text-sm text-muted-foreground">Keine Zusatzleistungen gebucht</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {gallery.express_delivery_requested && (
              <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 animate-pulse">
                <Clock className="h-4 w-4 mr-1" />
                24H EXPRESS
              </Badge>
            )}
            {stagingPhotos.length > 0 && (
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1">
                <Home className="h-4 w-4 mr-1" />
                {stagingPhotos.length}× Staging
              </Badge>
            )}
            {blueHourPhotos.length > 0 && (
              <Badge className="bg-gradient-to-r from-blue-600 to-orange-500 text-white px-3 py-1">
                <Sunrise className="h-4 w-4 mr-1" />
                {blueHourPhotos.length}× Blaue Stunde
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
