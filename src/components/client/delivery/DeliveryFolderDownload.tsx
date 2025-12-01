import { useState, useEffect } from 'react';
import { Download, Loader2, Archive, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DELIVERY_FOLDERS, DeliveryFolderType } from '@/constants/delivery-folders';
import { DeliveryFileItem } from './DeliveryFileItem';
import { DeliveryFile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLogDownload } from '@/hooks/useDownloadLogs';
import { useCreateZipJob, useZipJob, useDownloadZipJob } from '@/hooks/useZipJobs';

const ASYNC_THRESHOLD_BYTES = 50 * 1024 * 1024; // 50MB

interface DeliveryFolderDownloadProps {
  folderType: DeliveryFolderType;
  files: DeliveryFile[];
  galleryId: string;
}

export function DeliveryFolderDownload({
  folderType,
  files,
  galleryId,
}: DeliveryFolderDownloadProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  const folder = DELIVERY_FOLDERS[folderType];
  const Icon = folder.icon;
  const logDownload = useLogDownload();
  const createZipJob = useCreateZipJob();
  const downloadZipJob = useDownloadZipJob();
  const { data: zipJob } = useZipJob(activeJobId || undefined);

  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const isLargeDownload = totalSize > ASYNC_THRESHOLD_BYTES;

  // When job completes, auto-download
  useEffect(() => {
    if (zipJob?.status === 'completed' && zipJob.storage_path) {
      downloadZipJob.mutate(zipJob);
      setActiveJobId(null);
      setDownloadingZip(false);
      
      // Log the download
      logDownload.mutate({
        gallery_id: galleryId,
        download_type: 'folder_zip',
        folder_type: folderType,
        file_count: files.length,
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

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // For large files, create async job
      if (isLargeDownload) {
        const job = await createZipJob.mutateAsync({
          galleryId,
          folderType,
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
            gallery_id: galleryId,
            folder_type: folderType,
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
      link.download = `${folderType}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Log the download
      logDownload.mutate({
        gallery_id: galleryId,
        download_type: 'folder_zip',
        folder_type: folderType,
        file_count: files.length,
        total_size_bytes: totalSize,
      });

      toast({
        title: 'ZIP-Download gestartet',
        description: `Ordner "${folder.label}" wird als ZIP heruntergeladen...`,
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

  if (files.length === 0) return null;

  return (
    <Card className="shadow-neu-flat">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-muted/50 ${folder.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{folder.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {files.length} Datei{files.length !== 1 ? 'en' : ''} • {formatSize(totalSize)}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadZip}
              disabled={downloadingZip || downloadingAll}
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
                  Als ZIP {isLargeDownload && '(groß)'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadAll}
              disabled={downloadingAll || downloadingZip}
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Lädt...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Einzeln
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {zipJob && (zipJob.status === 'pending' || zipJob.status === 'processing') && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {zipJob.status === 'pending' ? 'Warte auf Verarbeitung...' : 'ZIP wird generiert...'}
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {files.map((file) => (
            <DeliveryFileItem key={file.id} file={file} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
