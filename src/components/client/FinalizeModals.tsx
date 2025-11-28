import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Photo } from '@/types/database';
import { Upload, Clock, Home, Sunset, Check, Sparkles, ChevronDown, Camera, Gift, Settings, Loader2 } from 'lucide-react';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { STAGING_STYLES } from '@/constants/staging';
import { Card, CardContent } from '@/components/ui/card';
import { BlueHourInfoCard } from './BlueHourInfoCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Step Indicator Component with Icons
function StepIndicator({ currentStep }: { currentStep: 'feedback' | 'services' | 'staging' | 'blueHour' | 'summary' }) {
  const steps = [
    { key: 'feedback', label: 'Übersicht', icon: Camera },
    { key: 'services', label: 'Leistungen', icon: Gift },
    { key: 'staging', label: 'Staging', icon: Home },
    { key: 'blueHour', label: 'Blaue Stunde', icon: Sunset },
    { key: 'summary', label: 'Zusammenfassung', icon: Check },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500",
                    isActive && "bg-primary text-primary-foreground shadow-neu-float scale-110",
                    isCompleted && "bg-primary text-primary-foreground shadow-neu-flat",
                    !isActive && !isCompleted && "bg-muted text-muted-foreground shadow-neu-pressed"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-all duration-300 hidden sm:block",
                  isActive && "text-primary font-bold",
                  isCompleted && "text-primary/70",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 px-2">
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-primary transition-all duration-500 rounded-full",
                        index < currentIndex ? "w-full" : "w-0"
                      )} 
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Overall Progress Bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden shadow-neu-pressed">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Pricing Summary Component
function PricingSummaryBar({ 
  expressDelivery, 
  stagingCount, 
  blueHourCount 
}: { 
  expressDelivery: boolean;
  stagingCount: number;
  blueHourCount: number;
}) {
  const hasAnyService = expressDelivery || stagingCount > 0 || blueHourCount > 0;
  
  if (!hasAnyService) return null;

  const expressPrice = expressDelivery ? 99 : 0;
  const stagingPrice = stagingCount * 89;
  const stagingDiscount = Math.floor(stagingCount / 6) * 89;
  const stagingTotal = stagingPrice - stagingDiscount;
  const blueHourPrice = blueHourCount * 49;
  const totalPrice = expressPrice + stagingTotal + blueHourPrice;

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">Zusätzliche Kosten:</span>
          <div className="text-right space-y-1">
            {expressDelivery && (
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">24h Lieferung</span>
                <span className="font-medium">+99€</span>
              </div>
            )}
            {stagingCount > 0 && (
              <>
                <div className="flex justify-between gap-8">
                  <span className="text-muted-foreground">{stagingCount} × Staging</span>
                  <span className="font-medium">{stagingPrice}€</span>
                </div>
                {stagingDiscount > 0 && (
                  <div className="flex justify-between gap-8 text-green-600">
                    <span>Rabatt (5+1 Gratis)</span>
                    <span>-{stagingDiscount}€</span>
                  </div>
                )}
              </>
            )}
            {blueHourCount > 0 && (
              <div className="flex justify-between gap-8">
                <span className="text-muted-foreground">{blueHourCount} × Blaue Stunde</span>
                <span className="font-medium">{blueHourPrice}€</span>
              </div>
            )}
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Zusatz gesamt:</span>
          <span className="text-2xl font-bold text-primary">{totalPrice}€</span>
        </div>
        {stagingDiscount > 0 && (
          <p className="text-xs text-center text-green-600 font-medium">
            🎉 Sie sparen {stagingDiscount}€ mit dem 5+1 Rabatt!
          </p>
        )}
      </div>
    </div>
  );
}

export function FinalizeModals({ isOpen, onClose, selectedPhotos, onFinalize }: FinalizeModalsProps) {
  const isMobile = useIsMobile();
  const { signedUrls } = useSignedPhotoUrls(selectedPhotos);
  const [step, setStep] = useState<'feedback' | 'services' | 'staging' | 'blueHour' | 'summary'>('feedback');
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
  const [isBlueHourInfoExpanded, setIsBlueHourInfoExpanded] = useState(false);

  // Photo numbering map
  const photoNumberMap = selectedPhotos.reduce((acc, photo, index) => {
    acc[photo.id] = index + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleFeedbackNext = () => {
    setStep('services');
  };

  const handleServicesNext = () => {
    if (selectedServices.virtualStaging) {
      setStep('staging');
    } else if (selectedServices.blueHour) {
      setStep('blueHour');
    } else {
      setStep('summary');
    }
  };

  const handleStagingNext = () => {
    if (selectedServices.blueHour) {
      setStep('blueHour');
    } else {
      setStep('summary');
    }
  };

  const handleBlueHourNext = () => {
    setStep('summary');
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

  const selectAllStaging = () => {
    const allSelected = selectedPhotos.reduce((acc, photo) => {
      acc[photo.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setStagingSelections(allSelected);
  };

  const deselectAllStaging = () => {
    setStagingSelections({});
  };

  const selectAllBlueHour = () => {
    const allSelected = selectedPhotos.reduce((acc, photo) => {
      acc[photo.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setBlueHourSelections(allSelected);
  };

  const deselectAllBlueHour = () => {
    setBlueHourSelections({});
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
      onClose();
    } catch (error) {
      console.error('Finalization error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stagingCount = Object.values(stagingSelections).filter(v => v).length;
  const blueHourCount = Object.values(blueHourSelections).filter(v => v).length;

  // Shared content renderer
  const renderStepContent = () => {
    if (step === 'feedback') {
      return (
        <div className="py-6 space-y-8">
          {/* Selected Photos Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Ausgewählte Fotos</Label>
              <span className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                {selectedPhotos.length} Fotos
              </span>
            </div>
            <div className={cn(
              "grid gap-3 max-h-72 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-2xl",
              isMobile ? "grid-cols-2" : "grid-cols-4"
            )}>
              {selectedPhotos.map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative aspect-square rounded-xl overflow-hidden shadow-neu-flat-sm hover:scale-105 transition-transform group"
                >
                  <img
                    src={signedUrls[photo.id] || photo.storage_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                    <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
                  </div>
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
      );
    }

    if (step === 'services') {
      return (
        <div className="py-6">
          <div className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3")}>
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
                  <div onClick={(e) => e.stopPropagation()}>
                    <BlueHourInfoCard
                      isExpanded={isBlueHourInfoExpanded}
                      onToggle={() => setIsBlueHourInfoExpanded(!isBlueHourInfoExpanded)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }

    if (step === 'staging') {
      return (
        <>
          <div className="py-6 space-y-6">
            {/* Virtual Staging Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Home className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Fotos auswählen</h3>
                    <p className="text-sm text-muted-foreground">
                      {stagingCount} von {selectedPhotos.length} Fotos ausgewählt
                    </p>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "sm"}
                    onClick={selectAllStaging}
                    className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
                  >
                    Alle auswählen
                  </Button>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "sm"}
                    onClick={deselectAllStaging}
                    className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
                  >
                    Alle abwählen
                  </Button>
                </div>
              </div>
              
              {/* Photo Grid */}
              <div className={cn(
                "grid gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl",
                isMobile ? "grid-cols-2" : "grid-cols-4"
              )}>
                {selectedPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                      stagingSelections[photo.id] && "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => handleStagingToggle(photo.id, !stagingSelections[photo.id])}
                  >
                    <img
                      src={signedUrls[photo.id] || photo.storage_url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                      <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
                    </div>
                    <div className={cn(
                      "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      stagingSelections[photo.id] 
                        ? "bg-primary shadow-lg animate-scale-in" 
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

              {/* Shared fields */}
              {hasStagingRequests && (
                <>
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
                </>
              )}
            </div>
          </div>
          <PricingSummaryBar 
            expressDelivery={selectedServices.expressDelivery}
            stagingCount={stagingCount}
            blueHourCount={blueHourCount}
          />
        </>
      );
    }

    if (step === 'blueHour') {
      return (
        <>
          <div className="py-6 space-y-6">
            {/* Blue Hour Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Sunset className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Fotos auswählen</h3>
                    <p className="text-sm text-muted-foreground">
                      {blueHourCount} von {selectedPhotos.length} Fotos ausgewählt
                    </p>
                  </div>
                </div>
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "sm"}
                    onClick={selectAllBlueHour}
                    className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
                  >
                    Alle auswählen
                  </Button>
                  <Button 
                    variant="outline" 
                    size={isMobile ? "default" : "sm"}
                    onClick={deselectAllBlueHour}
                    className={cn("rounded-full", isMobile ? "min-h-10 text-sm" : "text-xs")}
                  >
                    Alle abwählen
                  </Button>
                </div>
              </div>
              
              {/* Photo Grid */}
              <div className={cn(
                "grid gap-3 max-h-64 overflow-y-auto p-4 bg-background shadow-neu-pressed rounded-xl",
                isMobile ? "grid-cols-2" : "grid-cols-4"
              )}>
                {selectedPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all group",
                      blueHourSelections[photo.id] && "ring-2 ring-primary shadow-lg"
                    )}
                    onClick={() => handleBlueHourToggle(photo.id, !blueHourSelections[photo.id])}
                  >
                    <img
                      src={signedUrls[photo.id] || photo.storage_url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 w-7 h-7 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-neu-flat-sm">
                      <span className="text-xs font-bold text-foreground">{photoNumberMap[photo.id]}</span>
                    </div>
                    <div className={cn(
                      "absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center transition-all",
                      blueHourSelections[photo.id] 
                        ? "bg-primary shadow-lg animate-scale-in" 
                        : "bg-background/80 group-hover:bg-background shadow-neu-flat-sm"
                    )}>
                      {blueHourSelections[photo.id] && (
                        <Check className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <PricingSummaryBar 
            expressDelivery={selectedServices.expressDelivery}
            stagingCount={stagingCount}
            blueHourCount={blueHourCount}
          />
        </>
      );
    }

    if (step === 'summary') {
      return (
        <div className="py-6 space-y-6">
          {/* Selected Photos Count */}
          <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6 shadow-neu-flat">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ausgewählte Fotos</p>
                <p className="text-2xl font-bold text-primary">{selectedPhotos.length} Fotos</p>
              </div>
            </div>
          </div>

          {/* Services Summary */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg">Gebuchte Zusatzleistungen</h3>
            
            {!selectedServices.expressDelivery && stagingCount === 0 && blueHourCount === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Keine Zusatzleistungen ausgewählt</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedServices.expressDelivery && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">24h Express-Lieferung</p>
                      <p className="text-sm text-muted-foreground">Ihre Fotos in 24 Stunden</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">+99€</p>
                    </div>
                  </div>
                )}

                {stagingCount > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Home className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Virtuelles Staging</p>
                      <p className="text-sm text-muted-foreground">
                        {stagingCount} {stagingCount === 1 ? 'Foto' : 'Fotos'} · Stil: {stagingStyle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        {stagingCount * 89 - Math.floor(stagingCount / 6) * 89}€
                      </p>
                      {Math.floor(stagingCount / 6) > 0 && (
                        <p className="text-xs text-green-600">-{Math.floor(stagingCount / 6) * 89}€ Rabatt</p>
                      )}
                    </div>
                  </div>
                )}

                {blueHourCount > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-background shadow-neu-flat">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sunset className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Virtuelle Blaue Stunde</p>
                      <p className="text-sm text-muted-foreground">
                        {blueHourCount} {blueHourCount === 1 ? 'Foto' : 'Fotos'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{blueHourCount * 49}€</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feedback Preview */}
          {feedback && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Ihr Feedback</h3>
              <div className="p-4 rounded-xl bg-muted/50 shadow-neu-pressed">
                <p className="text-sm leading-relaxed">{feedback}</p>
              </div>
            </div>
          )}

          {/* Reference File Preview */}
          {referenceFile && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Referenzbild</h3>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background shadow-neu-flat">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{referenceFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(referenceFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comments Preview */}
          {stagingComment && (
            <div className="space-y-3">
              <h3 className="font-bold text-lg">Kommentare & Wünsche</h3>
              <div className="p-4 rounded-xl bg-muted/50 shadow-neu-pressed">
                <p className="text-sm leading-relaxed">{stagingComment}</p>
              </div>
            </div>
          )}

          {/* Final Price */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-2xl p-6 shadow-neu-float">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Gesamtbetrag</p>
                <p className="text-4xl font-bold text-primary">
                  {(selectedServices.expressDelivery ? 99 : 0) + 
                   (stagingCount * 89 - Math.floor(stagingCount / 6) * 89) + 
                   (blueHourCount * 49)}€
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            {Math.floor(stagingCount / 6) > 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Sie sparen {Math.floor(stagingCount / 6) * 89}€ mit dem 5+1 Gratis-Angebot!
                </p>
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className="bg-muted/30 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ Fast geschafft! Mit einem Klick auf "Jetzt finalisieren" wird Ihre Auswahl an uns übermittelt.
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  // Render footer buttons
  const renderFooterButtons = () => {
    if (step === 'feedback') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleFeedbackNext} 
            className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
          >
            Weiter
          </Button>
        </>
      );
    }

    if (step === 'services') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => setStep('feedback')} 
            className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
          >
            Zurück
          </Button>
          <Button 
            onClick={handleServicesNext} 
            className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
          >
            {selectedServices.virtualStaging || selectedServices.blueHour ? 'Weiter' : 'Auswahl finalisieren'}
          </Button>
        </>
      );
    }

    if (step === 'staging') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => setStep('services')} 
            className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
          >
            Zurück
          </Button>
          <Button 
            onClick={handleStagingNext} 
            className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
          >
            {selectedServices.blueHour ? 'Weiter' : 'Weiter zur Zusammenfassung'}
          </Button>
        </>
      );
    }

    if (step === 'blueHour') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => setStep('staging')} 
            className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
          >
            Zurück
          </Button>
          <Button 
            onClick={handleBlueHourNext} 
            className={cn("rounded-full px-8 shadow-neu-flat-sm", isMobile && "min-h-12 text-base")}
          >
            Weiter zur Zusammenfassung
          </Button>
        </>
      );
    }

    if (step === 'summary') {
      return (
        <>
          <Button 
            variant="outline" 
            onClick={() => {
              if (selectedServices.blueHour) {
                setStep('blueHour');
              } else if (selectedServices.virtualStaging) {
                setStep('staging');
              } else {
                setStep('services');
              }
            }} 
            className={cn("rounded-full px-6", isMobile && "min-h-12 text-base")}
            disabled={isSubmitting}
          >
            Zurück
          </Button>
          <Button 
            onClick={handleFinalSubmit} 
            disabled={isSubmitting}
            className={cn(
              "rounded-full px-8 shadow-neu-float bg-gradient-to-r from-primary to-primary/90",
              isMobile && "min-h-12 text-base"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird übermittelt...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Jetzt finalisieren
              </>
            )}
          </Button>
        </>
      );
    }

    return null;
  };

  // Get step title and description
  const getStepInfo = () => {
    switch (step) {
      case 'feedback':
        return { title: 'Teilen Sie Ihr Feedback', description: `Sie haben ${selectedPhotos.length} Fotos ausgewählt` };
      case 'services':
        return { title: 'Zusatzleistungen wählen', description: 'Wählen Sie die gewünschten Zusatzleistungen für Ihre Fotos' };
      case 'staging':
        return { title: 'Virtuelles Staging', description: 'Wählen Sie die Fotos für virtuelles Staging aus' };
      case 'blueHour':
        return { title: 'Virtuelle Blaue Stunde', description: 'Wählen Sie die Fotos für die virtuelle blaue Stunde aus' };
      case 'summary':
        return { title: 'Zusammenfassung Ihrer Auswahl', description: 'Bitte überprüfen Sie Ihre Auswahl vor der Finalisierung' };
      default:
        return { title: '', description: '' };
    }
  };

  const { title, description } = getStepInfo();

  // Render mobile version with Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">{title}</DrawerTitle>
            <DrawerDescription className="text-base">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <StepIndicator currentStep={step} />
            {renderStepContent()}
          </div>
          <DrawerFooter className={cn("gap-2", isMobile && "flex flex-col pt-4")}>
            {renderFooterButtons()}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render desktop version with Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto transition-all duration-500",
        step === 'services' ? "max-w-4xl" : step === 'summary' ? "max-w-3xl" : "max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <div>
          <StepIndicator currentStep={step} />
          {renderStepContent()}
        </div>
        <DialogFooter className="gap-2">
          {renderFooterButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
