import { Trash2, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeliveryFile } from '@/types/database';
import { useDeleteDeliveryFile } from '@/hooks/useDeliveryFiles';

interface DeliveryFilesListProps {
  files: DeliveryFile[];
  galleryId: string;
}

export function DeliveryFilesList({ files, galleryId }: DeliveryFilesListProps) {
  const deleteFile = useDeleteDeliveryFile();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDelete = (file: DeliveryFile) => {
    if (confirm(`Möchten Sie "${file.filename}" wirklich löschen?`)) {
      deleteFile.mutate({
        fileId: file.id,
        storagePath: file.storage_url,
        galleryId,
      });
    }
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-muted-foreground">
        Keine Dateien hochgeladen
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
        >
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
            onClick={() => handleDelete(file)}
            disabled={deleteFile.isPending}
            className="flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
