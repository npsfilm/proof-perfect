import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { DeliveredGallerySelector } from './DeliveredGallerySelector';
import { StagingPhotoGrid } from './StagingPhotoGrid';
import { StagingStyleSelector } from './StagingStyleSelector';
import { StagingPricingSummary } from './StagingPricingSummary';
import { ReferenceImageUploader } from './ReferenceImageUploader';
import { useCreateStagingRequest } from '@/hooks/useStagingRequests';
import { useAnsprache } from '@/contexts/AnspracheContext';
import { cn } from '@/lib/utils';

const STEP_LABELS = [
  'Galerie',
  'Fotos',
  'Stil',
  'Referenzen',
  'Absenden',
];

export function StagingRequestFlow() {
  const { t } = useAnsprache();
  const [step, setStep] = useState(1);
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>('');
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [stagingStyle, setStagingStyle] = useState<string>('');
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const createRequest = useCreateStagingRequest();

  const handleNext = () => {
    if (step === 1 && !selectedGalleryId) return;
    if (step === 2 && selectedPhotoIds.length === 0) return;
    if (step === 3 && !stagingStyle) return;
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    createRequest.mutate({
      gallery_id: selectedGalleryId,
      staging_style: stagingStyle,
      photo_ids: selectedPhotoIds,
      notes: notes || undefined,
      reference_image_urls: referenceImageUrls.length > 0 ? referenceImageUrls : undefined,
    });
    
    // Reset form
    setStep(1);
    setSelectedGalleryId('');
    setSelectedPhotoIds([]);
    setStagingStyle('');
    setReferenceImageUrls([]);
    setNotes('');
  };

  const photoCount = selectedPhotoIds.length;
  const basePrice = 89;
  const totalPrice = photoCount >= 6 
    ? Math.floor(photoCount / 6) * (basePrice * 5) + (photoCount % 6) * basePrice
    : photoCount * basePrice;

  return (
    <Card className="shadow-sm">
      <CardContent className="pt-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            
            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      isActive && "bg-primary text-primary-foreground",
                      isCompleted && "bg-primary/20 text-primary",
                      !isActive && !isCompleted && "bg-muted text-muted-foreground"
                    )}
                  >
                    {stepNum}
                  </div>
                  <span className={cn(
                    "text-xs mt-1 hidden sm:block",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={cn(
                    "w-6 sm:w-10 h-0.5 mx-1 sm:mx-2",
                    isCompleted ? "bg-primary/40" : "bg-muted"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Galerie auswählen</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('Wähle eine gelieferte Galerie aus', 'Wählen Sie eine gelieferte Galerie aus')}
              </p>
              <DeliveredGallerySelector
                value={selectedGalleryId}
                onChange={setSelectedGalleryId}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Fotos auswählen</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('Wähle die Fotos aus, für die du Staging wünschst', 'Wählen Sie die Fotos aus, für die Sie Staging wünschen')}
              </p>
              <StagingPhotoGrid
                galleryId={selectedGalleryId}
                selectedPhotoIds={selectedPhotoIds}
                onSelectionChange={setSelectedPhotoIds}
              />
              <div className="mt-3 text-sm text-muted-foreground">
                ✓ {photoCount} {photoCount === 1 ? 'Foto' : 'Fotos'} ausgewählt
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Stil wählen</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t('Wähle den gewünschten Staging-Stil', 'Wählen Sie den gewünschten Staging-Stil')}
              </p>
              <StagingStyleSelector
                value={stagingStyle}
                onChange={setStagingStyle}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">
                Referenzbilder (optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                {t(
                  'Lade bis zu 5 Bilder hoch, um deinen gewünschten Möbelstil zu zeigen',
                  'Laden Sie bis zu 5 Bilder hoch, um Ihren gewünschten Möbelstil zu zeigen'
                )}
              </p>
              <ReferenceImageUploader
                requestId="temp-upload"
                onUploadComplete={setReferenceImageUrls}
                existingUrls={referenceImageUrls}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes" className="text-base font-semibold">
                Anmerkungen (optional)
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                z.B. "Wohnzimmer mit hellblauem Sofa"
              </p>
              <Textarea
                id="notes"
                placeholder={t('Deine Anmerkungen...', 'Ihre Anmerkungen...')}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <StagingPricingSummary
              photoCount={photoCount}
              basePrice={basePrice}
              totalPrice={totalPrice}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          {step < 5 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !selectedGalleryId) ||
                (step === 2 && selectedPhotoIds.length === 0) ||
                (step === 3 && !stagingStyle)
              }
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={createRequest.isPending}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Send className="mr-2 h-4 w-4" />
              Staging-Anfrage absenden
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
