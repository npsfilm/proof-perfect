import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RoomTypeSelector } from './RoomTypeSelector';
import { StyleGallery } from './StyleGallery';
import { StagingOptions } from './StagingOptions';
import { StagingPricingSummary } from './StagingPricingSummary';
import { useDeliveredGalleries } from '@/hooks/useDeliveredGalleries';
import { useGalleryPhotos } from '@/hooks/useGalleryPhotos';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { useCreateStagingRequest } from '@/hooks/useStagingRequests';
import { useServices } from '@/hooks/useServices';
import { useDiscounts } from '@/hooks/useDiscounts';
import { useStagingStyles } from '@/hooks/useStagingStyles';
import { Loader2, ImagePlus, ChevronLeft, ChevronRight, Wand2, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export function StagingConfigurator() {
  const { data: galleries, isLoading: galleriesLoading } = useDeliveredGalleries();
  const createStagingRequest = useCreateStagingRequest();
  
  // Load pricing from database
  const { data: services } = useServices({ showIn: 'finalize' });
  const { data: discounts } = useDiscounts();
  const { data: stagingStyles } = useStagingStyles();

  // Get staging service price from DB
  const stagingService = services?.find(s => 
    s.slug === 'virtuelles-staging' || s.slug === 'virtual-staging'
  );
  const basePrice = stagingService ? stagingService.price_cents / 100 : 89;

  // Get discount info
  const stagingDiscount = discounts?.find(d => 
    d.discount_type === 'buy_x_get_y' && d.is_active
  );
  const buyQuantity = stagingDiscount?.buy_quantity || 5;
  const freeQuantity = stagingDiscount?.free_quantity || 1;

  // Form state
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [roomType, setRoomType] = useState<string | null>(null);
  const [stagingStyle, setStagingStyle] = useState<string | null>(null);
  const [removeFurniture, setRemoveFurniture] = useState(false);
  const [addFurniture, setAddFurniture] = useState(true);
  const [enhancePhoto, setEnhancePhoto] = useState(true);
  const [notes, setNotes] = useState('');
  const [referenceUrls, setReferenceUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch photos for selected gallery
  const { data: photos } = useGalleryPhotos(selectedGalleryId);
  const { signedUrls } = useSignedPhotoUrls(photos || []);

  // Calculate pricing with dynamic discount
  const photoCount = selectedPhotoIds.length;
  const discountSets = Math.floor(photoCount / (buyQuantity + freeQuantity));
  const remainingPhotos = photoCount % (buyQuantity + freeQuantity);
  const freePhotos = discountSets * freeQuantity + (remainingPhotos > buyQuantity ? remainingPhotos - buyQuantity : 0);
  const totalPrice = (photoCount - freePhotos) * basePrice;

  // Handle photo selection
  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  // Get style label for API
  const getStyleLabel = () => {
    const style = stagingStyles?.find(s => s.slug === stagingStyle);
    return style?.name || 'Standard';
  };

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

    setUploading(true);
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
      setReferenceUrls(prev => [...prev, ...urls]);

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
  }, [referenceUrls]);

  const removeReferenceImage = (index: number) => {
    setReferenceUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedGalleryId || selectedPhotoIds.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie mindestens ein Foto aus.',
        variant: 'destructive',
      });
      return;
    }

    if (!stagingStyle) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie einen Einrichtungsstil.',
        variant: 'destructive',
      });
      return;
    }

    const extendedNotes = [
      roomType && `Raumtyp: ${roomType}`,
      removeFurniture && 'Option: Möbel entfernen',
      enhancePhoto && 'Option: Foto verbessern',
      notes,
    ].filter(Boolean).join('\n');

    await createStagingRequest.mutateAsync({
      gallery_id: selectedGalleryId,
      staging_style: getStyleLabel(),
      photo_ids: selectedPhotoIds,
      notes: extendedNotes || undefined,
      reference_image_urls: referenceUrls.length > 0 ? referenceUrls : undefined,
    });

    // Reset form
    setSelectedPhotoIds([]);
    setRoomType(null);
    setStagingStyle(null);
    setNotes('');
    setReferenceUrls([]);
  };

  // Current selected photo for preview
  const currentPhoto = photos?.find(p => p.id === selectedPhotoIds[currentPhotoIndex]);
  const currentPhotoUrl = currentPhoto ? signedUrls[currentPhoto.id] : null;

  if (galleriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
          <Select value={selectedGalleryId} onValueChange={(v) => {
            setSelectedGalleryId(v);
            setSelectedPhotoIds([]);
            setCurrentPhotoIndex(0);
          }}>
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

      {selectedGalleryId && (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: Photo Preview & Selection */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Fotos auswählen</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {selectedPhotoIds.length} ausgewählt
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Preview */}
              <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                {currentPhotoUrl ? (
                  <img
                    src={currentPhotoUrl}
                    alt="Ausgewähltes Foto"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Foto auswählen</p>
                  </div>
                )}
                
                {/* Navigation */}
                {selectedPhotoIds.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={() => setCurrentPhotoIndex(i => Math.max(0, i - 1))}
                      disabled={currentPhotoIndex === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                      onClick={() => setCurrentPhotoIndex(i => Math.min(selectedPhotoIds.length - 1, i + 1))}
                      disabled={currentPhotoIndex === selectedPhotoIds.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/80 px-2 py-1 rounded text-xs">
                      {currentPhotoIndex + 1} / {selectedPhotoIds.length}
                    </div>
                  </>
                )}
              </div>

              {/* Photo Thumbnails Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[200px] overflow-y-auto">
                {photos?.map((photo) => {
                  const url = signedUrls[photo.id];
                  const isSelected = selectedPhotoIds.includes(photo.id);
                  
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => togglePhotoSelection(photo.id)}
                      className={cn(
                        'relative aspect-square rounded-md overflow-hidden border-2 transition-all',
                        isSelected 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-transparent hover:border-primary/30'
                      )}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={photo.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {selectedPhotoIds.indexOf(photo.id) + 1}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right: Configuration Options */}
          <div className="space-y-4">
            {/* Staging Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Optionen</CardTitle>
              </CardHeader>
              <CardContent>
                <StagingOptions
                  removeFurniture={removeFurniture}
                  onRemoveFurnitureChange={setRemoveFurniture}
                  addFurniture={addFurniture}
                  onAddFurnitureChange={setAddFurniture}
                  enhancePhoto={enhancePhoto}
                  onEnhancePhotoChange={setEnhancePhoto}
                >
                  {/* Room Type & Style inside Add Furniture collapsible */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Raumtyp
                      </Label>
                      <RoomTypeSelector value={roomType} onChange={setRoomType} />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Einrichtungsstil
                      </Label>
                      <StyleGallery value={stagingStyle} onChange={setStagingStyle} />
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
                    id="reference-upload"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleReferenceUpload(e.target.files)}
                    disabled={uploading || referenceUrls.length >= 5}
                    className="hidden"
                  />
                  <label htmlFor="reference-upload" className="cursor-pointer">
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
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            {/* Pricing Summary */}
            {selectedPhotoIds.length > 0 && (
              <StagingPricingSummary
                photoCount={photoCount}
                basePrice={basePrice}
                totalPrice={totalPrice}
              />
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={selectedPhotoIds.length === 0 || !stagingStyle || createStagingRequest.isPending}
              className="w-full h-12 text-base"
              size="lg"
            >
              {createStagingRequest.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-5 w-5 mr-2" />
              )}
              Virtuelles Staging starten
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
