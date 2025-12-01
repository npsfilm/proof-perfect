import { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReferenceImageUploaderProps {
  requestId: string;
  onUploadComplete: (urls: string[]) => void;
  existingUrls?: string[];
}

export function ReferenceImageUploader({ 
  requestId, 
  onUploadComplete, 
  existingUrls = [] 
}: ReferenceImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingUrls);
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;
      if (previewUrls.length + files.length > 5) {
        toast({
          title: 'Zu viele Bilder',
          description: 'Maximal 5 Referenzbilder erlaubt.',
          variant: 'destructive',
        });
        return;
      }

      setUploading(true);
      const filesArray = Array.from(files);

      try {
        const uploadPromises = filesArray.map(async (file) => {
          const timestamp = Date.now();
          const filePath = `staging-references/${requestId}/${timestamp}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from('proofs')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('proofs')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        const newUrls = [...previewUrls, ...urls];
        setPreviewUrls(newUrls);
        onUploadComplete(newUrls);

        toast({
          title: 'Hochgeladen',
          description: `${filesArray.length} Referenzbild(er) erfolgreich hochgeladen.`,
        });
      } catch (error: any) {
        toast({
          title: 'Upload-Fehler',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    },
    [requestId, previewUrls, onUploadComplete, toast]
  );

  const handleRemove = (indexToRemove: number) => {
    const newUrls = previewUrls.filter((_, index) => index !== indexToRemove);
    setPreviewUrls(newUrls);
    onUploadComplete(newUrls);
  };

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
        className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary transition-colors"
      >
        <input
          type="file"
          id="reference-upload"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={uploading || previewUrls.length >= 5}
          className="hidden"
        />
        <label htmlFor="reference-upload" className="cursor-pointer">
          <ImageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">
            {uploading ? 'Wird hochgeladen...' : 'Referenzbilder hier ablegen oder klicken'}
          </p>
          <p className="text-xs text-muted-foreground">
            Max. 5 Bilder • JPG, PNG, WEBP
          </p>
        </label>
      </div>

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Bilder werden hochgeladen...</span>
        </div>
      )}

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative group rounded-xl overflow-hidden shadow-neu-flat aspect-[4/3]">
              <img
                src={url}
                alt={`Referenzbild ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 p-0"
                onClick={() => handleRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
