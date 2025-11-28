import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Photo } from '@/types/database';
import { Upload, Clock, Home, Sunset, Check } from 'lucide-react';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { STAGING_STYLES } from '@/constants/staging';
import { Card, CardContent } from '@/components/ui/card';

interface FinalizeModalsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: Photo[];
  onFinalize: (data: {
    feedback: string;
    services: {
      expressDelivery: boolean;
      virtualStaging: boolean;
      blueHour: boolean;
    };
    stagingSelections: { photoId: string; staging: boolean; style?: string }[];
    blueHourSelections: string[];
    referenceFile?: File;
    stagingComment?: string;
  }) => Promise<void>;
}

export function FinalizeModals({ isOpen, onClose, selectedPhotos, onFinalize }: FinalizeModalsProps) {
  const { signedUrls } = useSignedPhotoUrls(selectedPhotos);
  const [step, setStep] = useState<'feedback' | 'services' | 'staging'>('feedback');
  const [feedback, setFeedback] = useState('');
  const [selectedServices, setSelectedServices] = useState({
    expressDelivery: false,
    virtualStaging: false,
    blueHour: false,
  });
  const [stagingSelections, setStagingSelections] = useState<Record<string, boolean>>({});
  const [blueHourSelections, setBlueHourSelections] = useState<Record<string, boolean>>({});
  const [stagingStyle, setStagingStyle] = useState<string>('Modern');
  const [stagingComment, setStagingComment] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedbackNext = () => {
    setStep('services');
  };

  const handleServicesNext = () => {
    if (selectedServices.virtualStaging || selectedServices.blueHour) {
      setStep('staging');
    } else {
      handleFinalSubmit();
    }
  };

  const toggleService = (service: 'expressDelivery' | 'virtualStaging' | 'blueHour') => {
    setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const handleStagingToggle = (photoId: string, checked: boolean) => {
    setStagingSelections(prev => ({ ...prev, [photoId]: checked }));
  };

  const handleBlueHourToggle = (photoId: string, checked: boolean) => {
    setBlueHourSelections(prev => ({ ...prev, [photoId]: checked }));
  };

  const hasStagingRequests = Object.values(stagingSelections).some(v => v);
  const hasBlueHourRequests = Object.values(blueHourSelections).some(v => v);

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

      const blueHourData = Object.keys(blueHourSelections)
        .filter(photoId => blueHourSelections[photoId]);

      await onFinalize({
        feedback,
        services: selectedServices,
        stagingSelections: stagingData,
        blueHourSelections: blueHourData,
        referenceFile,
        stagingComment,
      });
      
      // Reset state
      setStep('feedback');
      setFeedback('');
      setSelectedServices({ expressDelivery: false, virtualStaging: false, blueHour: false });
      setStagingSelections({});
      setBlueHourSelections({});
      setStagingStyle('Modern');
      setStagingComment('');
      setReferenceFile(undefined);
    } catch (error) {
      console.error('Finalization error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stagingCount = Object.values(stagingSelections).filter(v => v).length;
  const blueHourCount = Object.values(blueHourSelections).filter(v => v).length;

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
        ) : step === 'services' ? (
          <>
            <DialogHeader>
              <DialogTitle>Zusatzleistungen wählen</DialogTitle>
              <DialogDescription>
                Wählen Sie die gewünschten Zusatzleistungen für Ihre Fotos
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 24h Lieferung */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedServices.expressDelivery 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleService('expressDelivery')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-full ${
                        selectedServices.expressDelivery 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        <Clock className="h-6 w-6" />
                      </div>
                      {selectedServices.expressDelivery && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">24h Lieferung</h3>
                      <p className="text-2xl font-bold text-primary">+99€</p>
                      <p className="text-sm text-muted-foreground">
                        Express-Lieferung innerhalb von 24 Stunden
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Virtuelles Staging */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedServices.virtualStaging 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleService('virtualStaging')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-full ${
                        selectedServices.virtualStaging 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        <Home className="h-6 w-6" />
                      </div>
                      {selectedServices.virtualStaging && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Virtuelles Staging</h3>
                      <p className="text-2xl font-bold text-primary">89€<span className="text-sm font-normal">/Bild</span></p>
                      <p className="text-sm text-muted-foreground">
                        Leere Räume professionell einrichten lassen
                      </p>
                      <div className="bg-primary/10 px-3 py-2 rounded-lg text-center">
                        <p className="text-xs font-semibold text-primary">5 kaufen, 1 gratis!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Virtuelle Blaue Stunde */}
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedServices.blueHour 
                      ? 'ring-2 ring-primary shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => toggleService('blueHour')}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-full ${
                        selectedServices.blueHour 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary'
                      }`}>
                        <Sunset className="h-6 w-6" />
                      </div>
                      {selectedServices.blueHour && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Virtuelle Blaue Stunde</h3>
                      <p className="text-2xl font-bold text-primary">+49€<span className="text-sm font-normal">/Bild</span></p>
                      <p className="text-sm text-muted-foreground">
                        Außenaufnahmen zur goldenen Stunde verwandeln
                      </p>
                      <div className="bg-muted px-3 py-2 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Vorher/Nachher-Effekt</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('feedback')}>Zurück</Button>
              <Button onClick={handleServicesNext}>
                {selectedServices.virtualStaging || selectedServices.blueHour ? 'Weiter' : 'Auswahl finalisieren'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Details zu Zusatzleistungen</DialogTitle>
              <DialogDescription>
                Wählen Sie die Details für Ihre ausgewählten Leistungen
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-6">
              {/* Virtual Staging Section */}
              {selectedServices.virtualStaging && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Virtuelles Staging</Label>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">
                      Fotos auswählen ({stagingCount} ausgewählt)
                    </Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
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
                            className="w-12 h-12 object-cover rounded"
                          />
                          <label
                            htmlFor={`staging-${photo.id}`}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {photo.filename}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {hasStagingRequests && (
                    <div className="space-y-2">
                      <Label htmlFor="staging-style">Staging-Stil</Label>
                      <Select value={stagingStyle} onValueChange={setStagingStyle}>
                        <SelectTrigger id="staging-style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGING_STYLES.map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Blue Hour Section */}
              {selectedServices.blueHour && (
                <div className="space-y-3 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Sunset className="h-5 w-5 text-primary" />
                    <Label className="text-base font-semibold">Virtuelle Blaue Stunde</Label>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm">
                      Außenaufnahmen auswählen ({blueHourCount} ausgewählt)
                    </Label>
                    <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {selectedPhotos.map((photo) => (
                        <div key={photo.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                          <Checkbox
                            id={`bluehour-${photo.id}`}
                            checked={blueHourSelections[photo.id] || false}
                            onCheckedChange={(checked) => handleBlueHourToggle(photo.id, checked as boolean)}
                          />
                          <img
                            src={signedUrls[photo.id] || photo.storage_url}
                            alt={photo.filename}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <label
                            htmlFor={`bluehour-${photo.id}`}
                            className="flex-1 text-sm cursor-pointer"
                          >
                            {photo.filename}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Shared fields */}
              {(hasStagingRequests || hasBlueHourRequests) && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="staging-comment">Kommentare & Wünsche (Optional)</Label>
                    <Textarea
                      id="staging-comment"
                      value={stagingComment}
                      onChange={(e) => setStagingComment(e.target.value)}
                      placeholder="Beschreiben Sie Ihre Vorstellungen oder besondere Wünsche..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference-file">Referenzbild hochladen (Optional)</Label>
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
              <Button variant="outline" onClick={() => setStep('services')}>Zurück</Button>
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