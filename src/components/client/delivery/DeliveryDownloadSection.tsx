import { useState } from 'react';
import { Download, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveryFolderDownload } from './DeliveryFolderDownload';
import { useDeliveryFiles } from '@/hooks/useDeliveryFiles';
import { DeliveryFolderType } from '@/constants/delivery-folders';
import { LoadingState } from '@/components/ui/loading-state';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Gallery } from '@/types/database';

interface DeliveryDownloadSectionProps {
  gallery: Gallery;
}

export function DeliveryDownloadSection({ gallery }: DeliveryDownloadSectionProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const { data: files, isLoading } = useDeliveryFiles(gallery.id);

  if (isLoading) {
    return (
      <Card className="shadow-neu-flat">
        <CardContent className="py-6">
          <LoadingState message="Lädt Ihre Dateien..." />
        </CardContent>
      </Card>
    );
  }

  if (!files || files.length === 0) {
    return (
      <Card className="shadow-neu-flat">
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Noch keine Dateien verfügbar</p>
        </CardContent>
      </Card>
    );
  }

  const folderTypes: DeliveryFolderType[] = [
    'full_resolution',
    'web_version',
    'virtual_staging',
    'blue_hour',
  ];

  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      // Download all files sequentially
      for (const file of files) {
        const { data, error } = await supabase.storage
          .from('deliveries')
          .createSignedUrl(file.storage_url, 3600);

        if (error) throw error;

        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast({
        title: 'Downloads gestartet',
        description: `${files.length} Dateien werden heruntergeladen...`,
      });
    } catch (error) {
      toast({
        title: 'Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <Card className="shadow-neu-flat border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Ihre Fotos sind bereit!</CardTitle>
              <CardDescription>
                {gallery.address || gallery.name} • Geliefert am{' '}
                {gallery.delivered_at
                  ? new Date(gallery.delivered_at).toLocaleDateString('de-DE')
                  : new Date().toLocaleDateString('de-DE')}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="default"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="shadow-neu-flat-sm"
          >
            {downloadingAll ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird heruntergeladen...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Alle herunterladen
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {folderTypes.map((folderType) => {
          const folderFiles = files.filter((f) => f.folder_type === folderType);
          return (
            <DeliveryFolderDownload
              key={folderType}
              folderType={folderType}
              files={folderFiles}
            />
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Gesamt</span>
            <span className="text-muted-foreground">
              {files.length} Datei{files.length !== 1 ? 'en' : ''} • {formatSize(totalSize)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
