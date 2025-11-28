import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Photo } from '@/types/database';
import { Upload } from 'lucide-react';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';

interface FinalizeModalsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: Photo[];
  onFinalize: (data: {
    feedback: string;
    stagingSelections: { photoId: string; staging: boolean; style?: string }[];
    referenceFile?: File;
  }) => Promise<void>;
}

export function FinalizeModals({ isOpen, onClose, selectedPhotos, onFinalize }: FinalizeModalsProps) {
  const { signedUrls } = useSignedPhotoUrls(selectedPhotos);
  const [step, setStep] = useState<'feedback' | 'staging'>('feedback');
  const [feedback, setFeedback] = useState('');
  const [stagingSelections, setStagingSelections] = useState<Record<string, boolean>>({});
  const [stagingStyle, setStagingStyle] = useState<string>('Modern');
  const [referenceFile, setReferenceFile] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackNext = () => {
    setStep('staging');
  };

  const handleStagingToggle = (photoId: string, checked: boolean) => {
    setStagingSelections(prev => ({ ...prev, [photoId]: checked }));
  };

  const hasStagingRequests = Object.values(stagingSelections).some(v => v);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setReferenceFile(file);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const stagingData = selectedPhotos.map(photo => ({
        photoId: photo.id,
        staging: stagingSelections[photo.id] || false,
        style: stagingSelections[photo.id] ? stagingStyle : undefined,
      }));

      await onFinalize({
        feedback,
        stagingSelections: stagingData,
        referenceFile,
      });
      
      // Reset state
      setStep('feedback');
      setFeedback('');
      setStagingSelections({});
      setStagingStyle('Modern');
      setReferenceFile(undefined);
    } catch (error) {
      console.error('Finalization error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stagingCount = Object.values(stagingSelections).filter(v => v).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {step === 'feedback' ? (
          <>
            <DialogHeader>
              <DialogTitle>Teilen Sie Ihr Feedback</DialogTitle>
              <DialogDescription>
                Sie haben {selectedPhotos.length} Fotos ausgewählt
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Selected Photos Overview */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Ausgewählte Fotos</Label>
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded overflow-hidden">
                      <img
                        src={signedUrls[photo.id] || photo.storage_url}
                        alt={photo.filename}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Ihr Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ihr Feedback hilft uns, zukünftige Shootings zu verbessern..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Abbrechen</Button>
              <Button onClick={handleFeedbackNext}>Weiter</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Virtuelles Staging</DialogTitle>
              <DialogDescription>
                Verwandeln Sie Ihre Fotos mit professionellem virtuellem Staging
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-lg font-semibold text-primary">5 kaufen, 1 gratis!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wählen Sie 6 oder mehr Fotos für Staging, um den besten Wert zu erhalten
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Fotos für virtuelles Staging auswählen ({stagingCount} ausgewählt)
                </Label>
                <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {selectedPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                      <Checkbox
                        id={`staging-${photo.id}`}
                        checked={stagingSelections[photo.id] || false}
                        onCheckedChange={(checked) => handleStagingToggle(photo.id, checked as boolean)}
                      />
                      <img
                        src={signedUrls[photo.id] || photo.storage_url}
                        alt={photo.filename}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <label
                        htmlFor={`staging-${photo.id}`}
                        className="flex-1 text-sm font-medium cursor-pointer"
                      >
                        {photo.filename}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {hasStagingRequests && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="staging-style">Staging-Stil</Label>
                    <Select value={stagingStyle} onValueChange={setStagingStyle}>
                      <SelectTrigger id="staging-style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Modern">Modern</SelectItem>
                        <SelectItem value="Scandi">Skandinavisch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference-file">Referenzbild (Optional)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        id="reference-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="reference-file"
                        className="flex flex-col items-center gap-2 cursor-pointer"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {referenceFile ? referenceFile.name : 'Referenzbild zur Inspiration hochladen'}
                        </p>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('feedback')}>Zurück</Button>
              <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Wird übermittelt...' : 'Auswahl finalisieren'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}