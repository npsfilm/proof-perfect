import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gallery, Photo, Client } from '@/types/database';

interface ClosedGalleryCardProps {
  gallery: Gallery;
  photos: Photo[] | undefined;
  selectedClients: Client[];
  onReopenGallery: () => void;
}

export function ClosedGalleryCard({
  gallery,
  photos,
  selectedClients,
  onReopenGallery,
}: ClosedGalleryCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-800 mb-2">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Galerie geschlossen</h3>
            <p className="text-sm text-muted-foreground">
              Die Galerie ist geschlossen. Bearbeitung und Upload sind nicht verfügbar.
            </p>
          </div>
          {gallery.status === 'Closed' && (
            <Button onClick={onReopenGallery} variant="outline" size="lg">
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                />
              </svg>
              Galerie wieder öffnen
            </Button>
          )}
        </div>

        {/* Compact Summary */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-xl">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Fotos
            </p>
            <p className="text-xl font-bold">{photos?.length ?? 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Paket-Ziel
            </p>
            <p className="text-xl font-bold">{gallery.package_target_count}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Kunden
            </p>
            <p className="text-xl font-bold">{selectedClients.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
