import { useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RoomTypeSelector } from './RoomTypeSelector';
import { StyleGallery } from './StyleGallery';
import { StagingOptions } from './StagingOptions';
import { Loader2, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StagingConfigPanelProps {
  // Options
  roomType: string | null;
  onRoomTypeChange: (type: string | null) => void;
  stagingStyle: string | null;
  onStagingStyleChange: (style: string | null) => void;
  removeFurniture: boolean;
  onRemoveFurnitureChange: (value: boolean) => void;
  addFurniture: boolean;
  onAddFurnitureChange: (value: boolean) => void;
  enhancePhoto: boolean;
  onEnhancePhotoChange: (value: boolean) => void;
  
  // Reference
  referenceUrls: string[];
  onReferenceUrlsChange: (urls: string[]) => void;
  uploading: boolean;
  onUploadingChange: (value: boolean) => void;
  
  // Notes
  notes: string;
  onNotesChange: (value: string) => void;
}

export function StagingConfigPanel({
  roomType,
  onRoomTypeChange,
  stagingStyle,
  onStagingStyleChange,
  removeFurniture,
  onRemoveFurnitureChange,
  addFurniture,
  onAddFurnitureChange,
  enhancePhoto,
  onEnhancePhotoChange,
  referenceUrls,
  onReferenceUrlsChange,
  uploading,
  onUploadingChange,
  notes,
  onNotesChange,
}: StagingConfigPanelProps) {
  // Handle reference image upload
  const handleReferenceUpload = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    if (referenceUrls.length + files.length > 5) {
      toast({
        title: 'Zu viele Bilder',
        description: 'Maximal 5 Referenzbilder erlaubt.',
        variant: 'destructive',
      });
      return;
    }

    onUploadingChange(true);
    const filesArray = Array.from(files);

    try {
      const uploadPromises = filesArray.map(async (file) => {
        const timestamp = Date.now();
        const filePath = `staging-references/temp/${timestamp}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('proofs')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      onReferenceUrlsChange([...referenceUrls, ...urls]);

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
      onUploadingChange(false);
    }
  }, [referenceUrls, onReferenceUrlsChange, onUploadingChange]);

  const removeReferenceImage = (index: number) => {
    onReferenceUrlsChange(referenceUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Staging Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Optionen</CardTitle>
        </CardHeader>
        <CardContent>
          <StagingOptions
            removeFurniture={removeFurniture}
            onRemoveFurnitureChange={onRemoveFurnitureChange}
            addFurniture={addFurniture}
            onAddFurnitureChange={onAddFurnitureChange}
            enhancePhoto={enhancePhoto}
            onEnhancePhotoChange={onEnhancePhotoChange}
          >
            {/* Room Type & Style inside Add Furniture collapsible */}
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Raumtyp
                </Label>
                <RoomTypeSelector value={roomType} onChange={onRoomTypeChange} />
              </div>
              
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Einrichtungsstil
                </Label>
                <StyleGallery value={stagingStyle} onChange={onStagingStyleChange} />
              </div>
            </div>
          </StagingOptions>
        </CardContent>
      </Card>

      {/* Reference Images - Inline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referenzbilder (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div
            onDrop={(e) => { e.preventDefault(); handleReferenceUpload(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors"
          >
            <input
              type="file"
              id="reference-upload-config"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleReferenceUpload(e.target.files)}
              disabled={uploading || referenceUrls.length >= 5}
              className="hidden"
            />
            <label htmlFor="reference-upload-config" className="cursor-pointer">
              {uploading ? (
                <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin text-muted-foreground" />
              ) : (
                <ImageIcon className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              )}
              <p className="text-xs text-muted-foreground">
                Bilder hierher ziehen oder klicken (max. 5)
              </p>
            </label>
          </div>

          {referenceUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {referenceUrls.map((url, index) => (
                <div key={url} className="relative group rounded-md overflow-hidden aspect-square">
                  <img src={url} alt={`Ref ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeReferenceImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Anmerkungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Zusätzliche Wünsche oder Hinweise..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
