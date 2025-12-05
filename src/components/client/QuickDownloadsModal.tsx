import { useNavigate } from 'react-router-dom';
import { Download, ExternalLink, FolderOpen, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/ui/empty-state';
import { GallerySelectionStats } from '@/types/database';

interface QuickDownloadsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deliveredGalleries: GallerySelectionStats[];
}

export function QuickDownloadsModal({ 
  open, 
  onOpenChange, 
  deliveredGalleries 
}: QuickDownloadsModalProps) {
  const navigate = useNavigate();

  const handleOpenGallery = (slug: string) => {
    onOpenChange(false);
    navigate(`/gallery/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Meine Downloads
          </DialogTitle>
          <DialogDescription>
            Schnellzugriff auf gelieferte Galerien
          </DialogDescription>
        </DialogHeader>

        {deliveredGalleries.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={FolderOpen}
              title="Keine Downloads verfügbar"
              description="Sobald Galerien geliefert wurden, erscheinen sie hier."
            />
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {deliveredGalleries.map((gallery) => (
                <Card 
                  key={gallery.gallery_id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
                  onClick={() => handleOpenGallery(gallery.slug || '')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-foreground truncate">
                          {gallery.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {gallery.created_at && format(
                            new Date(gallery.created_at),
                            'dd. MMM yyyy',
                            { locale: de }
                          )}
                          <span className="text-muted-foreground/50">•</span>
                          <span>{gallery.photos_count} Fotos</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {deliveredGalleries.length > 0 && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                onOpenChange(false);
                navigate('/dashboard?tab=galleries');
              }}
            >
              Alle Galerien anzeigen
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
