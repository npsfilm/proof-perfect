import { useState } from 'react';
import { Download, Loader2, FileImage, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeliveryFile } from '@/types/database';
import { useWatermarkedDownload } from '@/hooks/useWatermarkedDownload';
import { useLogDownload } from '@/hooks/useDownloadLogs';

interface DeliveryFileItemProps {
  file: DeliveryFile;
}

export function DeliveryFileItem({ file }: DeliveryFileItemProps) {
  const [downloading, setDownloading] = useState(false);
  const logDownload = useLogDownload();
  const { downloadSingleFile, hasWatermark } = useWatermarkedDownload();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownload = async (withWatermark: boolean = false) => {
    setDownloading(true);
    try {
      await downloadSingleFile(file, withWatermark);
      
      // Log the download
      logDownload.mutate({
        gallery_id: file.gallery_id,
        download_type: 'single_file',
        file_id: file.id,
        file_count: 1,
        total_size_bytes: file.file_size,
      });
    } catch (error) {
      // Error handling done in hook
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
      
      {hasWatermark ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={downloading}
              className="flex-shrink-0"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload(false)}>
              <Download className="h-4 w-4 mr-2" />
              Original
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload(true)}>
              <Droplet className="h-4 w-4 mr-2" />
              Mit Wasserzeichen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDownload(false)}
          disabled={downloading}
          className="flex-shrink-0"
        >
          {downloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
