import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Eye, ArrowLeftRight, CheckCircle, HelpCircle } from 'lucide-react';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryName: string;
  targetCount: number;
  onComplete: () => void;
}

const TUTORIAL_STEPS = [
  {
    title: 'Willkommen zu Ihrer Galerie!',
    description: 'Sehen Sie sich Ihre Fotos an und wählen Sie Ihre Favoriten aus.',
    icon: Heart,
    content: (targetCount: number) => (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Sie haben <span className="font-semibold text-foreground">{targetCount} Fotos</span> in Ihrem Paket.
        </p>
        <p className="text-muted-foreground">
          Dies sind unbearbeitete Proofs. Farben und Belichtung werden in der finalen Version korrigiert.
        </p>
      </div>
    ),
  },
  {
    title: 'Fotos ansehen',
    description: 'Klicken Sie auf ein Foto, um es in voller Größe zu betrachten.',
    icon: Eye,
    content: () => (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Nutzen Sie die <span className="font-semibold text-foreground">Pfeiltasten</span> oder <span className="font-semibold text-foreground">wischen</span> Sie, um zwischen Fotos zu navigieren.
        </p>
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <kbd className="px-2 py-1 bg-background border rounded">←</kbd>
            <kbd className="px-2 py-1 bg-background border rounded">→</kbd>
            <span className="text-muted-foreground">Vorheriges/Nächstes Foto</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <kbd className="px-2 py-1 bg-background border rounded">ESC</kbd>
            <span className="text-muted-foreground">Lightbox schließen</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Fotos auswählen',
    description: 'Markieren Sie Ihre Favoriten mit einem Klick.',
    icon: Heart,
    content: () => (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Klicken Sie auf das <Heart className="inline h-4 w-4 text-primary fill-primary" /> Symbol, um ein Foto auszuwählen.
        </p>
        <p className="text-muted-foreground">
          Sie können auch die <kbd className="px-2 py-1 bg-background border rounded text-xs">Leertaste</kbd> drücken, während Sie ein Foto betrachten.
        </p>
        <p className="text-muted-foreground">
          Ihre Auswahl wird automatisch gespeichert.
        </p>
      </div>
    ),
  },
  {
    title: 'Fotos vergleichen',
    description: 'Vergleichen Sie zwei Fotos direkt nebeneinander.',
    icon: ArrowLeftRight,
    content: () => (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Wählen Sie <span className="font-semibold text-foreground">zwei Fotos</span> aus der Galerie aus, um sie Seite an Seite zu vergleichen.
        </p>
        <p className="text-muted-foreground">
          Perfekt, um zwischen ähnlichen Aufnahmen zu entscheiden!
        </p>
      </div>
    ),
  },
  {
    title: 'Bereit loszulegen!',
    description: 'Viel Spaß beim Durchsehen Ihrer Fotos.',
    icon: CheckCircle,
    content: () => (
      <div className="space-y-3">
        <p className="text-muted-foreground">
          Wenn Sie fertig sind, klicken Sie auf <span className="font-semibold text-foreground">"Auswahl abschließen"</span> am unteren Rand.
        </p>
        <p className="text-sm text-muted-foreground">
          Tipp: Drücken Sie <kbd className="px-2 py-1 bg-background border rounded text-xs">?</kbd> jederzeit, um Tastaturkürzel anzuzeigen.
        </p>
      </div>
    ),
  },
];

export function WelcomeModal({ open, onOpenChange, galleryName, targetCount, onComplete }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TUTORIAL_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {step.content(targetCount)}
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {TUTORIAL_STEPS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
              aria-label={`Schritt ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Überspringen
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Zurück
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep < TUTORIAL_STEPS.length - 1 ? 'Weiter' : 'Los geht\'s!'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
