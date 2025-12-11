import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label: string;
  description?: string;
  currentUrl: string | null;
  onUpload: (file: File) => Promise<string | null>;
  onRemove: () => void;
  accept?: string;
  aspectRatio?: string;
}

export function ImageUploader({
  label,
  description,
  currentUrl,
  onUpload,
  onRemove,
  accept = 'image/*',
  aspectRatio = 'aspect-video',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    await onUpload(file);
    setIsUploading(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors',
          aspectRatio,
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
          !currentUrl && 'hover:border-primary/50'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {currentUrl ? (
          <div className="relative w-full h-full">
            <img
              src={currentUrl}
              alt={label}
              className="w-full h-full object-contain rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <>
                <Upload className="h-8 w-8" />
                <span className="text-sm">Bild hochladen oder hierher ziehen</span>
              </>
            )}
          </button>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
