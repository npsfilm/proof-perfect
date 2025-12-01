import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X } from 'lucide-react';
import { useUploadWatermark } from '@/hooks/useClientWatermark';

interface WatermarkUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WatermarkUploader({ open, onOpenChange }: WatermarkUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadWatermark();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.match(/^image\/(png|webp)$/)) {
      alert('Nur PNG und WebP Formate werden unterstützt');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Datei zu groß. Maximal 5MB erlaubt.');
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadMutation.mutateAsync(selectedFile);
      onOpenChange(false);
      // Reset state
      setSelectedFile(null);
      setPreview(null);
    } catch (error) {
      // Error handling done in mutation
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Wasserzeichen hochladen</DialogTitle>
          <DialogDescription>
            Laden Sie Ihr Logo als PNG oder WebP hoch. Transparente Hintergründe werden unterstützt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!preview ? (
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Ziehen Sie Ihre Datei hierher oder
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                Datei auswählen
              </Button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/webp"
                onChange={handleChange}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">
                PNG oder WebP, max. 5MB
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-muted/50 rounded-2xl p-4 flex items-center justify-center min-h-[200px]">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-[200px] max-w-full object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Wird hochgeladen...' : 'Hochladen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
