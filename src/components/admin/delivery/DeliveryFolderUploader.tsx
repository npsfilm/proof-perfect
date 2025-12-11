import { useCallback, useState } from 'react';
import { Upload, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUploadDeliveryFile } from '@/hooks/useDeliveryFiles';
import { DeliveryFolderType } from '@/constants/delivery-folders';

interface DeliveryFolderUploaderProps {
  galleryId: string;
  gallerySlug: string;
  folderType: DeliveryFolderType;
  compact?: boolean;
}

export function DeliveryFolderUploader({
  galleryId,
  gallerySlug,
  folderType,
  compact = false,
}: DeliveryFolderUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const uploadFile = useUploadDeliveryFile();

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!files.length) return;

      setUploading(true);
      
      try {
        for (let i = 0; i < files.length; i++) {
          await uploadFile.mutateAsync({
            galleryId,
            gallerySlug,
            folderType,
            file: files[i],
          });
        }
      } finally {
        setUploading(false);
      }
    },
    [galleryId, gallerySlug, folderType, uploadFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  if (compact) {
    return (
      <div>
        <input
          type="file"
          id={`upload-${folderType}-compact`}
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor={`upload-${folderType}-compact`}>
          <Button
            variant="ghost"
            size="icon"
            disabled={uploading}
            className="h-7 w-7 cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
            </span>
          </Button>
        </label>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        id={`upload-${folderType}`}
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
      <label htmlFor={`upload-${folderType}`}>
        <Button
          variant="outline"
          size="sm"
          disabled={uploading}
          className="cursor-pointer"
          asChild
        >
          <span>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Dateien hinzufügen
              </>
            )}
          </span>
        </Button>
      </label>
    </div>
  );
}
