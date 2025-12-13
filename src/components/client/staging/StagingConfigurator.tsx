import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GalleryPhotoSelector } from './GalleryPhotoSelector';
import { StagingConfigPanel } from './StagingConfigPanel';
import { StagingPricingSummary } from './StagingPricingSummary';
import { useStagingForm } from './hooks/useStagingForm';
import { useStagingPricing } from './hooks/useStagingPricing';
import { useDeliveredGalleries } from '@/hooks/useDeliveredGalleries';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { useCreateStagingRequest } from '@/hooks/useStagingRequests';
import { useStagingStyles } from '@/hooks/useStagingStyles';
import { Loader2, ImagePlus, Wand2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAnsprache } from '@/contexts/AnspracheContext';

export function StagingConfigurator() {
  const { t } = useAnsprache();
  const { data: galleries, isLoading: galleriesLoading } = useDeliveredGalleries();
  const { data: stagingStyles } = useStagingStyles();
  const createStagingRequest = useCreateStagingRequest();
  
  // Custom Hooks
  const form = useStagingForm();
  const pricing = useStagingPricing(form.selectedPhotoIds.length);
  
  // Fetch photos for selected gallery
  const { data: photos } = useGalleryPhotos(form.selectedGalleryId);
  const { signedUrls } = useSignedPhotoUrls(photos || []);

  // Get style label for API
  const getStyleLabel = () => {
    const style = stagingStyles?.find(s => s.slug === form.stagingStyle);
    return style?.name || 'Standard';
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!form.selectedGalleryId || form.selectedPhotoIds.length === 0) {
      toast({
        title: 'Fehler',
        description: t('Bitte wähle mindestens ein Foto aus.', 'Bitte wählen Sie mindestens ein Foto aus.'),
        variant: 'destructive',
      });
      return;
    }

    if (!form.stagingStyle) {
      toast({
        title: 'Fehler',
        description: t('Bitte wähle einen Einrichtungsstil.', 'Bitte wählen Sie einen Einrichtungsstil.'),
        variant: 'destructive',
      });
      return;
    }

    const extendedNotes = [
      form.roomType && `Raumtyp: ${form.roomType}`,
      form.removeFurniture && 'Option: Möbel entfernen',
      form.enhancePhoto && 'Option: Foto verbessern',
      form.notes,
    ].filter(Boolean).join('\n');

    await createStagingRequest.mutateAsync({
      gallery_id: form.selectedGalleryId,
      staging_style: getStyleLabel(),
      photo_ids: form.selectedPhotoIds,
      notes: extendedNotes || undefined,
      reference_image_urls: form.referenceUrls.length > 0 ? form.referenceUrls : undefined,
    });

    form.resetForm();
  };

  // Loading state
  if (galleriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state
  if (!galleries?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImagePlus className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">
            Noch keine abgeschlossenen Galerien verfügbar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Galerie auswählen</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={form.selectedGalleryId} 
            onValueChange={(v) => {
              form.setSelectedGalleryId(v);
              form.clearSelection();
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Galerie wählen..." />
            </SelectTrigger>
            <SelectContent>
              {galleries.map((gallery) => (
                <SelectItem key={gallery.gallery_id!} value={gallery.gallery_id!}>
                  {gallery.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {form.selectedGalleryId && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Photo Preview & Selection */}
          <GalleryPhotoSelector
            photos={photos}
            signedUrls={signedUrls}
            selectedPhotoIds={form.selectedPhotoIds}
            currentPhotoIndex={form.currentPhotoIndex}
            onToggleSelection={form.togglePhotoSelection}
            onCurrentIndexChange={form.setCurrentPhotoIndex}
          />

          {/* Right: Configuration Options */}
          <div className="space-y-4">
            <StagingConfigPanel
              roomType={form.roomType}
              onRoomTypeChange={form.setRoomType}
              stagingStyle={form.stagingStyle}
              onStagingStyleChange={form.setStagingStyle}
              removeFurniture={form.removeFurniture}
              onRemoveFurnitureChange={form.setRemoveFurniture}
              addFurniture={form.addFurniture}
              onAddFurnitureChange={form.setAddFurniture}
              enhancePhoto={form.enhancePhoto}
              onEnhancePhotoChange={form.setEnhancePhoto}
              referenceUrls={form.referenceUrls}
              onReferenceUrlsChange={form.setReferenceUrls}
              uploading={form.uploading}
              onUploadingChange={form.setUploading}
              notes={form.notes}
              onNotesChange={form.setNotes}
            />

            {/* Pricing Summary */}
            {form.selectedPhotoIds.length > 0 && (
              <StagingPricingSummary
                photoCount={form.selectedPhotoIds.length}
                basePrice={pricing.basePrice}
                totalPrice={pricing.totalPrice}
              />
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={
                form.selectedPhotoIds.length === 0 || 
                !form.stagingStyle || 
                createStagingRequest.isPending
              }
              className="w-full"
              size="lg"
            >
              {createStagingRequest.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Staging anfragen ({form.selectedPhotoIds.length} {form.selectedPhotoIds.length === 1 ? 'Foto' : 'Fotos'})
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
