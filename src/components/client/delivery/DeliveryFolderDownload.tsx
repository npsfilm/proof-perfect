import { useState, useEffect } from 'react';
import { Download, Loader2, Archive, Clock, Droplet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DELIVERY_FOLDERS, DeliveryFolderType } from '@/constants/delivery-folders';
import { DeliveryFileItem } from './DeliveryFileItem';
import { DeliveryFile } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useLogDownload } from '@/hooks/useDownloadLogs';
import { useCreateZipJob, useZipJob, useDownloadZipJob } from '@/hooks/useZipJobs';
import { useWatermarkedDownload } from '@/hooks/useWatermarkedDownload';

const ASYNC_THRESHOLD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB

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
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  
  const folder = DELIVERY_FOLDERS[folderType];
  const Icon = folder.icon;
  const logDownload = useLogDownload();
  const createZipJob = useCreateZipJob();
  const downloadZipJob = useDownloadZipJob();
  const { data: zipJob } = useZipJob(activeJobId || undefined);
  const { downloadMultipleFiles, downloadAsZip, isProcessing, progress, hasWatermark } = useWatermarkedDownload();

  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const isLargeDownload = totalSize > ASYNC_THRESHOLD_BYTES;

  // When job completes, auto-download
  useEffect(() => {
    if (zipJob?.status === 'completed' && zipJob.storage_path) {
      downloadZipJob.mutate(zipJob);
      setActiveJobId(null);
      
      // Log the download
      logDownload.mutate({
        gallery_id: galleryId,
        download_type: 'folder_zip',
        folder_type: folderType,
        file_count: files.length,
        total_size_bytes: totalSize,
      });
    } else if (zipJob?.status === 'failed') {
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

  const handleDownloadAll = async (withWatermark: boolean = false) => {
    await downloadMultipleFiles(files, withWatermark);
  };

  const handleDownloadZip = async (withWatermark: boolean = false) => {
    // For large downloads (>2GB) or watermarked, use client-side processing
    if (withWatermark || !isLargeDownload) {
      await downloadAsZip(files, `${folderType}.zip`, withWatermark);
      
      // Log the download
      logDownload.mutate({
        gallery_id: galleryId,
        download_type: 'folder_zip',
        folder_type: folderType,
        file_count: files.length,
        total_size_bytes: totalSize,
      });
    } else {
      // For large non-watermarked downloads, use server-side async job
      const job = await createZipJob.mutateAsync({
        galleryId,
        folderType,
      });
      setActiveJobId(job.id);
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
            {hasWatermark ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      disabled={isProcessing || !!activeJobId}
                    >
                      {isProcessing || zipJob?.status === 'processing' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {isProcessing ? `${progress.current}/${progress.total}` : 'ZIP wird erstellt...'}
                        </>
                      ) : zipJob?.status === 'pending' ? (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          In Warteschlange...
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Als ZIP
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownloadZip(false)}>
                      <Archive className="h-4 w-4 mr-2" />
                      Original ZIP
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadZip(true)}>
                      <Droplet className="h-4 w-4 mr-2" />
                      Mit Wasserzeichen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing || !!activeJobId}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {progress.current}/{progress.total}
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Einzeln
                        </>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownloadAll(false)}>
                      <Download className="h-4 w-4 mr-2" />
                      Original
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadAll(true)}>
                      <Droplet className="h-4 w-4 mr-2" />
                      Mit Wasserzeichen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleDownloadZip(false)}
                  disabled={isProcessing || !!activeJobId}
                >
                  {isProcessing || zipJob?.status === 'processing' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isProcessing ? `${progress.current}/${progress.total}` : 'ZIP wird erstellt...'}
                    </>
                  ) : zipJob?.status === 'pending' ? (
                    <>
                      <Clock className="h-4 w-4 mr-2" />
                      In Warteschlange...
                    </>
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
                  onClick={() => handleDownloadAll(false)}
                  disabled={isProcessing || !!activeJobId}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {progress.current}/{progress.total}
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Einzeln
                    </>
                  )}
                </Button>
              </>
            )}
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
