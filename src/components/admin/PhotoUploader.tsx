import { useCallback, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface PhotoUploaderProps {
  galleryId: string;
  gallerySlug: string;
  onUploadComplete: () => void;
}

export function PhotoUploader({ galleryId, gallerySlug, onUploadComplete }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      setUploading(true);
      const filesArray = Array.from(files);
      setUploadProgress(filesArray.map((f) => f.name));

      try {
        // Get current max upload_order
        const { data: existingPhotos } = await supabase
          .from('photos')
          .select('upload_order')
          .eq('gallery_id', galleryId)
          .order('upload_order', { ascending: false })
          .limit(1);

        const startOrder = existingPhotos?.[0]?.upload_order ?? 0;

        // Upload all files in parallel using Promise.allSettled
        const uploadPromises = filesArray.map(async (file, index) => {
          const filePath = `${gallerySlug}/${file.name}`;
          
          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('proofs')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            throw new Error(`${file.name}: ${uploadError.message}`);
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('proofs')
            .getPublicUrl(filePath);

          // Insert photo record with sequential order
          const { error: dbError } = await supabase.from('photos').insert({
            gallery_id: galleryId,
            filename: file.name,
            storage_url: publicUrl,
            upload_order: startOrder + index + 1,
          });

          if (dbError) {
            throw new Error(`${file.name}: ${dbError.message}`);
          }

          return file.name;
        });

        const results = await Promise.allSettled(uploadPromises);
        
        const successful = results.filter((r) => r.status === 'fulfilled');
        const failed = results.filter((r) => r.status === 'rejected');

        if (successful.length > 0) {
          toast({
            title: 'Upload abgeschlossen',
            description: `Erfolgreich ${successful.length} von ${filesArray.length} Foto(s) hochgeladen.`,
          });
          onUploadComplete();
        }

        if (failed.length > 0) {
          const errors = failed.map((r) => (r as PromiseRejectedResult).reason.message);
          toast({
            title: 'Teilweise fehlgeschlagen',
            description: `${failed.length} Datei(en) konnten nicht hochgeladen werden: ${errors.join(', ')}`,
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Upload-Fehler',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
        setUploadProgress([]);
      }
    },
    [galleryId, gallerySlug, onUploadComplete, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors"
      >
        <input
          type="file"
          id="photo-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {uploading ? 'Wird hochgeladen...' : 'Fotos hier ablegen oder klicken zum Durchsuchen'}
          </p>
          <p className="text-xs text-muted-foreground">
            Unterstützt JPG, PNG, WEBP Dateien
          </p>
        </label>
      </div>

      {uploading && uploadProgress.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Lade {uploadProgress.length} Datei(en) hoch...</span>
          </div>
        </div>
      )}
    </div>
  );
}