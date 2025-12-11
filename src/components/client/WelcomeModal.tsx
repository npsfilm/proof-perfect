import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Eye, ArrowLeftRight, CheckCircle, HelpCircle } from 'lucide-react';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryName: string;
  onComplete: () => void;
}

export function WelcomeModal({ open, onOpenChange, galleryName, onComplete }: WelcomeModalProps) {
  const { t } = useAnsprache();
  const [currentStep, setCurrentStep] = useState(0);

  const TUTORIAL_STEPS = [
    {
      title: t('Willkommen zu deiner Galerie!', 'Willkommen zu Ihrer Galerie!'),
      description: t('Schön, dass du da bist. Lass uns beginnen.', 'Schön, dass Sie da sind. Lassen Sie uns beginnen.'),
      icon: Heart,
      content: () => (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {t(
              'Hier findest du deine Fotos zur Durchsicht. Nimm dir Zeit und wähle deine Favoriten aus.',
              'Hier finden Sie Ihre Fotos zur Durchsicht. Nehmen Sie sich Zeit und wählen Sie Ihre Favoriten aus.'
            )}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Wichtig:</span> Dies sind unbearbeitete Proofs. Farben und Belichtung werden in der finalen Version professionell korrigiert.
          </p>
          <p className="text-sm text-muted-foreground/80">
            {t('Konzentriere dich auf Perspektiven, Bildausschnitte und Motive.', 'Konzentrieren Sie sich auf Perspektiven, Bildausschnitte und Motive.')}
          </p>
        </div>
      ),
    },
    {
      title: 'Fotos ansehen',
      description: t('Klicke auf ein Foto, um es in voller Größe zu betrachten.', 'Klicken Sie auf ein Foto, um es in voller Größe zu betrachten.'),
      icon: Eye,
      content: () => (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {t(
              'Nutze die Pfeiltasten oder wische, um zwischen Fotos zu navigieren.',
              'Nutzen Sie die Pfeiltasten oder wischen Sie, um zwischen Fotos zu navigieren.'
            )}
          </p>
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Zoomen:</span> Strg + Scrollen (Desktop) oder Pinch-Geste (Mobile)
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
      description: t('Markiere deine Favoriten ganz einfach.', 'Markieren Sie Ihre Favoriten ganz einfach.'),
      icon: CheckCircle,
      content: () => (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {t(
              'Klicke auf das Häkchen-Symbol unter einem Foto, um es auszuwählen.',
              'Klicken Sie auf das Häkchen-Symbol unter einem Foto, um es auszuwählen.'
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'Du kannst auch die Leertaste drücken, während du ein Foto im Vollbild betrachtest.',
              'Sie können auch die Leertaste drücken, während Sie ein Foto im Vollbild betrachten.'
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'Deine Auswahl wird automatisch gespeichert – kein manuelles Speichern nötig.',
              'Ihre Auswahl wird automatisch gespeichert – kein manuelles Speichern nötig.'
            )}
          </p>
        </div>
      ),
    },
    {
      title: 'Fotos vergleichen',
      description: t('Vergleiche zwei Fotos direkt nebeneinander.', 'Vergleichen Sie zwei Fotos direkt nebeneinander.'),
      icon: ArrowLeftRight,
      content: () => (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {t(
              'Wähle zwei Fotos aus der Galerie aus, um sie Seite an Seite zu vergleichen.',
              'Wählen Sie zwei Fotos aus der Galerie aus, um sie Seite an Seite zu vergleichen.'
            )}
          </p>
          <p className="text-muted-foreground">
            Perfekt, um zwischen ähnlichen Aufnahmen zu entscheiden!
          </p>
        </div>
      ),
    },
    {
      title: 'Bereit loszulegen!',
      description: t('Viel Spaß beim Durchsehen deiner Fotos.', 'Viel Spaß beim Durchsehen Ihrer Fotos.'),
      icon: CheckCircle,
      content: () => (
        <div className="space-y-3">
          <p className="text-muted-foreground">
            {t(
              'Nimm dir Zeit für deine Auswahl. Du kannst jederzeit zurückkehren und Änderungen vornehmen.',
              'Nehmen Sie sich Zeit für Ihre Auswahl. Sie können jederzeit zurückkehren und Änderungen vornehmen.'
            )}
          </p>
          <p className="text-muted-foreground">
            {t(
              'Wenn du fertig bist, klicke auf "Auswahl abschließen" am unteren Bildschirmrand.',
              'Wenn Sie fertig sind, klicken Sie auf "Auswahl abschließen" am unteren Bildschirmrand.'
            )}
          </p>
          <p className="text-sm text-muted-foreground/80">
            {t('Tipp: Drücke ? jederzeit für Tastaturkürzel.', 'Tipp: Drücken Sie ? jederzeit für Tastaturkürzel.')}
          </p>
        </div>
      ),
    },
  ];

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
          {step.content()}
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
