import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DELIVERY_FOLDERS, DeliveryFolderType } from '@/constants/delivery-folders';
import { DeliveryFileItem } from './DeliveryFileItem';
import { DeliveryFile } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeliveryFolderDownloadProps {
  folderType: DeliveryFolderType;
  files: DeliveryFile[];
}

export function DeliveryFolderDownload({
  folderType,
  files,
}: DeliveryFolderDownloadProps) {
  const [downloadingAll, setDownloadingAll] = useState(false);
  const folder = DELIVERY_FOLDERS[folderType];
  const Icon = folder.icon;

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={downloadingAll}
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
      <CardContent>
        <div className="space-y-2">
          {files.map((file) => (
            <DeliveryFileItem key={file.id} file={file} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
