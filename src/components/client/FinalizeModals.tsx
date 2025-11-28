import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Photo } from '@/types/database';
import { Upload, Clock, Home, Sunset, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { STAGING_STYLES } from '@/constants/staging';
import { Card, CardContent } from '@/components/ui/card';
import { BlueHourSlider } from './BlueHourSlider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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

// Step Indicator Component
function StepIndicator({ currentStep }: { currentStep: 'feedback' | 'services' | 'staging' }) {
  const steps = [
    { key: 'feedback', label: 'Übersicht', number: 1 },
    { key: 'services', label: 'Zusatzleistungen', number: 2 },
    { key: 'staging', label: 'Details', number: 3 },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground shadow-neu-flat-sm scale-110",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors hidden sm:block",
                isActive && "text-primary",
                !isActive && "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2 transition-colors",
                index < currentIndex ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
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
  const [stagingOpen, setStagingOpen] = useState(true);
  const [blueHourOpen, setBlueHourOpen] = useState(true);

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
      <DialogContent className={cn(
        "max-h-[85vh] overflow-y-auto transition-all duration-300",
        step === 'services' ? "max-w-4xl" : "max-w-2xl"
      )}>
        <StepIndicator currentStep={step} />

        {step === 'feedback' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Teilen Sie Ihr Feedback</DialogTitle>
              <DialogDescription className="text-base">
                Sie haben {selectedPhotos.length} Fotos ausgewählt
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-8">
              {/* Selected Photos Overview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold">Ausgewählte Fotos</Label>
                  <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                    {selectedPhotos.length} Fotos
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 max-h-72 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-2xl">
                  {selectedPhotos.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative aspect-square rounded-xl overflow-hidden shadow-neu-flat-sm hover:scale-105 transition-transform"
                    >
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
              <div className="space-y-3">
                <Label htmlFor="feedback" className="text-base font-semibold">
                  Ihr Feedback <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Ihr Feedback hilft uns, zukünftige Shootings zu verbessern..."
                  rows={4}
                  className="resize-none shadow-neu-pressed rounded-2xl"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-full px-6">
                Abbrechen
              </Button>
              <Button onClick={handleFeedbackNext} className="rounded-full px-8 shadow-neu-flat-sm">
                Weiter
              </Button>
            </DialogFooter>
          </>
        ) : step === 'services' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Zusatzleistungen wählen</DialogTitle>
              <DialogDescription className="text-base">
                Wählen Sie die gewünschten Zusatzleistungen für Ihre Fotos
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 24h Lieferung */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat",
                    selectedServices.expressDelivery && "ring-2 ring-primary shadow-neu-float"
                  )}
                  onClick={() => toggleService('expressDelivery')}
                >
                  <CardContent className="p-6 space-y-4 relative">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        selectedServices.expressDelivery 
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                          : "bg-muted shadow-neu-pressed"
                      )}>
                        <Clock className="h-6 w-6" />
                      </div>
                      {selectedServices.expressDelivery && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">24h Lieferung</h3>
                      <p className="text-3xl font-bold text-primary">+99€</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Express-Lieferung innerhalb von 24 Stunden
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Virtuelles Staging */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat relative",
                    selectedServices.virtualStaging && "ring-2 ring-primary shadow-neu-float"
                  )}
                  onClick={() => toggleService('virtualStaging')}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> BELIEBT
                    </span>
                  </div>
                  <CardContent className="p-6 space-y-4 relative pt-8">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        selectedServices.virtualStaging 
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                          : "bg-muted shadow-neu-pressed"
                      )}>
                        <Home className="h-6 w-6" />
                      </div>
                      {selectedServices.virtualStaging && (
                        <div className="absolute top-8 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">Virtuelles Staging</h3>
                      <p className="text-3xl font-bold text-primary">89€<span className="text-base font-normal">/Bild</span></p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Leere Räume professionell einrichten lassen
                      </p>
                      <div className="bg-primary/10 px-3 py-2 rounded-xl text-center shadow-neu-pressed">
                        <p className="text-xs font-bold text-primary">5 kaufen, 1 gratis!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Virtuelle Blaue Stunde */}
                <Card 
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-neu-flat",
                    selectedServices.blueHour && "ring-2 ring-primary shadow-neu-float"
                  )}
                  onClick={() => toggleService('blueHour')}
                >
                  <CardContent className="p-6 space-y-4 relative">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-3 rounded-full transition-all duration-300",
                        selectedServices.blueHour 
                          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg" 
                          : "bg-muted shadow-neu-pressed"
                      )}>
                        <Sunset className="h-6 w-6" />
                      </div>
                      {selectedServices.blueHour && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Check className="h-5 w-5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl">Virtuelle Blaue Stunde</h3>
                      <p className="text-3xl font-bold text-primary">+49€<span className="text-base font-normal">/Bild</span></p>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                        Außenaufnahmen zur goldenen Stunde verwandeln
                      </p>
                      <BlueHourSlider />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('feedback')} className="rounded-full px-6">
                Zurück
              </Button>
              <Button onClick={handleServicesNext} className="rounded-full px-8 shadow-neu-flat-sm">
                {selectedServices.virtualStaging || selectedServices.blueHour ? 'Weiter' : 'Auswahl finalisieren'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Details zu Zusatzleistungen</DialogTitle>
              <DialogDescription className="text-base">
                Wählen Sie die Details für Ihre ausgewählten Leistungen
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 space-y-6">
              {/* Virtual Staging Section */}
              {selectedServices.virtualStaging && (
                <Collapsible open={stagingOpen} onOpenChange={setStagingOpen} className="space-y-4">
                  <div className="rounded-2xl border-2 border-border/50 shadow-neu-flat p-6 space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold">Virtuelles Staging</h3>
                          <p className="text-sm text-muted-foreground">
                            {stagingCount} von {selectedPhotos.length} Fotos ausgewählt
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 transition-transform text-muted-foreground",
                        stagingOpen && "rotate-180"
                      )} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4">
                      <div className="h-px bg-border/50" />
                      
                      {/* Photo Grid */}
                      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl">
                        {selectedPhotos.map((photo) => (
                          <div 
                            key={photo.id}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                              stagingSelections[photo.id] && "ring-2 ring-primary shadow-lg scale-95"
                            )}
                            onClick={() => handleStagingToggle(photo.id, !stagingSelections[photo.id])}
                          >
                            <img
                              src={signedUrls[photo.id] || photo.storage_url}
                              alt={photo.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className={cn(
                              "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                              stagingSelections[photo.id] 
                                ? "bg-primary shadow-lg" 
                                : "bg-background/80 group-hover:bg-background shadow-neu-flat-sm"
                            )}>
                              {stagingSelections[photo.id] && (
                                <Check className="h-4 w-4 text-primary-foreground" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {hasStagingRequests && (
                        <div className="space-y-3">
                          <Label htmlFor="staging-style" className="text-base font-semibold">Staging-Stil</Label>
                          <Select value={stagingStyle} onValueChange={setStagingStyle}>
                            <SelectTrigger id="staging-style" className="shadow-neu-pressed rounded-xl">
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
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}

              {/* Blue Hour Section */}
              {selectedServices.blueHour && (
                <Collapsible open={blueHourOpen} onOpenChange={setBlueHourOpen} className="space-y-4">
                  <div className="rounded-2xl border-2 border-border/50 shadow-neu-flat p-6 space-y-4">
                    <CollapsibleTrigger className="flex items-center justify-between w-full group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Sunset className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold">Virtuelle Blaue Stunde</h3>
                          <p className="text-sm text-muted-foreground">
                            {blueHourCount} von {selectedPhotos.length} Fotos ausgewählt
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 transition-transform text-muted-foreground",
                        blueHourOpen && "rotate-180"
                      )} />
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4">
                      <div className="h-px bg-border/50" />
                      
                      {/* Photo Grid */}
                      <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl">
                        {selectedPhotos.map((photo) => (
                          <div 
                            key={photo.id}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                              blueHourSelections[photo.id] && "ring-2 ring-primary shadow-lg scale-95"
                            )}
                            onClick={() => handleBlueHourToggle(photo.id, !blueHourSelections[photo.id])}
                          >
                            <img
                              src={signedUrls[photo.id] || photo.storage_url}
                              alt={photo.filename}
                              className="w-full h-full object-cover"
                            />
                            <div className={cn(
                              "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                              blueHourSelections[photo.id] 
                                ? "bg-primary shadow-lg" 
                                : "bg-background/80 group-hover:bg-background shadow-neu-flat-sm"
                            )}>
                              {blueHourSelections[photo.id] && (
                                <Check className="h-4 w-4 text-primary-foreground" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )}

              {/* Shared fields */}
              {(hasStagingRequests || hasBlueHourRequests) && (
                <div className="space-y-6 pt-2">
                  <div className="h-px bg-border/50" />
                  
                  <div className="space-y-3">
                    <Label htmlFor="staging-comment" className="text-base font-semibold">
                      Kommentare & Wünsche <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <Textarea
                      id="staging-comment"
                      value={stagingComment}
                      onChange={(e) => setStagingComment(e.target.value)}
                      placeholder="Beschreiben Sie Ihre Vorstellungen oder besondere Wünsche..."
                      rows={3}
                      className="resize-none shadow-neu-pressed rounded-2xl"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reference-file" className="text-base font-semibold">
                      Referenzbild hochladen <span className="text-muted-foreground font-normal">(Optional)</span>
                    </Label>
                    <div className={cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group shadow-neu-pressed",
                      "hover:border-primary/50 hover:bg-primary/5",
                      referenceFile && "border-primary bg-primary/5"
                    )}>
                      <input
                        id="reference-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="reference-file" className="cursor-pointer block">
                        {referenceFile ? (
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                              <Check className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium text-primary">{referenceFile.name}</p>
                            <p className="text-xs text-muted-foreground">Klicken zum Ändern</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-sm font-medium">Klicken zum Hochladen</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG bis zu 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep('services')} className="rounded-full px-6">
                Zurück
              </Button>
              <Button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting}
                className="rounded-full px-8 shadow-neu-flat-sm"
              >
                {isSubmitting ? 'Wird übermittelt...' : 'Auswahl finalisieren'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
