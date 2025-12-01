import { useState } from 'react';
import { Download, Loader2, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { DeliveryFile } from '@/types/database';
import { toast } from '@/hooks/use-toast';
import { useLogDownload } from '@/hooks/useDownloadLogs';

interface DeliveryFileItemProps {
  file: DeliveryFile;
}

export function DeliveryFileItem({ file }: DeliveryFileItemProps) {
  const [downloading, setDownloading] = useState(false);
  const logDownload = useLogDownload();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('deliveries')
        .createSignedUrl(file.storage_url, 3600);

      if (error) throw error;

      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log the download
      logDownload.mutate({
        gallery_id: file.gallery_id,
        download_type: 'single_file',
        file_id: file.id,
        file_count: 1,
        total_size_bytes: file.file_size,
      });

      toast({
        title: 'Download gestartet',
        description: `${file.filename} wird heruntergeladen...`,
      });
    } catch (error) {
      toast({
        title: 'Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
      <FileImage className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.filename}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file_size)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        disabled={downloading}
        className="flex-shrink-0"
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
