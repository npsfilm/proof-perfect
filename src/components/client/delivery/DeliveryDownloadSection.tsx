import { useState, useEffect } from 'react';
import { Download, Loader2, Package, Archive, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeliveryFolderDownload } from './DeliveryFolderDownload';
import { useDeliveryFiles } from '@/hooks/useDeliveryFiles';
import { DeliveryFolderType } from '@/constants/delivery-folders';
import { LoadingState } from '@/components/ui/loading-state';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Gallery } from '@/types/database';
import { useLogDownload } from '@/hooks/useDownloadLogs';
import { useCreateZipJob, useZipJob, useDownloadZipJob } from '@/hooks/useZipJobs';
import { WatermarkEditor } from './WatermarkEditor';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrls';
import { useAnsprache } from '@/contexts/AnspracheContext';

const ASYNC_THRESHOLD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

interface DeliveryDownloadSectionProps {
  gallery: Gallery;
}

export function DeliveryDownloadSection({ gallery }: DeliveryDownloadSectionProps) {
  const { t } = useAnsprache();
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  const { data: files, isLoading } = useDeliveryFiles(gallery.id);
  const { data: photos } = useGalleryPhotos(gallery.id);
  const firstPhoto = photos?.[0];
  const { signedUrl: previewUrl } = useSignedPhotoUrl(firstPhoto);
  
  const logDownload = useLogDownload();
  const createZipJob = useCreateZipJob();
  const downloadZipJob = useDownloadZipJob();
  const { data: zipJob } = useZipJob(activeJobId || undefined);

  const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
  const isLargeDownload = totalSize > ASYNC_THRESHOLD_BYTES;

  // When job completes, auto-download
  useEffect(() => {
    if (zipJob?.status === 'completed' && zipJob.storage_path) {
      downloadZipJob.mutate(zipJob);
      setActiveJobId(null);
      setDownloadingZip(false);
      
      // Log the download
      logDownload.mutate({
        gallery_id: gallery.id,
        download_type: 'gallery_zip',
        file_count: files?.length || 0,
        total_size_bytes: totalSize,
      });
    } else if (zipJob?.status === 'failed') {
      setDownloadingZip(false);
      setActiveJobId(null);
      toast({
        title: 'ZIP-Generierung fehlgeschlagen',
        description: zipJob.error_message || 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    }
  }, [zipJob?.status]);

  if (isLoading) {
    return (
      <Card className="shadow-neu-flat">
        <CardContent className="py-6">
          <LoadingState message={t('Lädt deine Dateien...', 'Lädt Ihre Dateien...')} />
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

  const handleDownloadAllZip = async () => {
    setDownloadingZip(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // For large files, create async job
      if (isLargeDownload) {
        const job = await createZipJob.mutateAsync({
          galleryId: gallery.id,
        });
        setActiveJobId(job.id);
        return; // Job will be downloaded when completed via useEffect
      }

      // For small files, download directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-zip`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gallery_id: gallery.id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      // Get the blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${gallery.slug}_alle_dateien.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log the download
      logDownload.mutate({
        gallery_id: gallery.id,
        download_type: 'gallery_zip',
        file_count: files?.length || 0,
        total_size_bytes: totalSize,
      });

      toast({
        title: 'ZIP-Download gestartet',
        description: `Alle Dateien werden als ZIP heruntergeladen...`,
      });
    } catch (error) {
      toast({
        title: 'ZIP-Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      if (!isLargeDownload) {
        setDownloadingZip(false);
      }
    }
  };

  // If external link is set, show external download link
  if (gallery.final_delivery_link) {
    return (
      <Card className="shadow-neu-flat border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>{t('Deine Fotos sind bereit!', 'Ihre Fotos sind bereit!')}</CardTitle>
                <CardDescription>
                  {gallery.address || gallery.name} • Geliefert am{' '}
                  {gallery.delivered_at
                    ? new Date(gallery.delivered_at).toLocaleDateString('de-DE')
                    : new Date().toLocaleDateString('de-DE')}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {t('Deine Fotos wurden auf einem externen Service bereitgestellt', 'Ihre Fotos wurden auf einem externen Service bereitgestellt')}
          </p>
          <Button
            size="lg"
            onClick={() => window.open(gallery.final_delivery_link!, '_blank')}
            className="shadow-neu-flat-sm"
          >
            <Download className="h-5 w-5 mr-2" />
            Zum Download
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Link: {gallery.final_delivery_link}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-neu-flat border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('Deine Fotos sind bereit!', 'Ihre Fotos sind bereit!')}</CardTitle>
              <CardDescription>
                {gallery.address || gallery.name} • Geliefert am{' '}
                {gallery.delivered_at
                  ? new Date(gallery.delivered_at).toLocaleDateString('de-DE')
                  : new Date().toLocaleDateString('de-DE')}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
          <Button
            variant="default"
            onClick={handleDownloadAllZip}
            disabled={downloadingZip || downloadingAll}
            className="shadow-neu-flat-sm"
          >
            {downloadingZip ? (
              zipJob?.status === 'processing' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ZIP wird erstellt...
                </>
              ) : zipJob?.status === 'pending' ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  In Warteschlange...
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lädt...
                </>
              )
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                Alles als ZIP {isLargeDownload && '(groß)'}
              </>
            )}
          </Button>
            <Button
              variant="outline"
              onClick={handleDownloadAll}
              disabled={downloadingAll || downloadingZip}
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lädt einzeln...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Alle einzeln
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Watermark Editor */}
        <WatermarkEditor previewImageUrl={previewUrl} />

        {zipJob && (zipJob.status === 'pending' || zipJob.status === 'processing') && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {zipJob.status === 'pending' ? 'ZIP-Datei wird vorbereitet...' : 'ZIP wird generiert...'}
                </p>
                <p className="text-xs text-blue-700">
                  {zipJob.file_count} Dateien • {formatSize(zipJob.total_size_bytes || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {folderTypes.map((folderType) => {
          const folderFiles = files.filter((f) => f.folder_type === folderType);
          return (
            <DeliveryFolderDownload
              key={folderType}
              folderType={folderType}
              files={folderFiles}
              galleryId={gallery.id}
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
