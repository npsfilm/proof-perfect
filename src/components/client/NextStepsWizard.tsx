import { ArrowRight, Sparkles, Clock, CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GallerySelectionStats } from '@/types/database';

interface NextStepsWizardProps {
  gallery: GallerySelectionStats;
  type: 'select' | 'continue' | 'processing' | 'delivered';
  onAction: () => void;
}

export function NextStepsWizard({ gallery, type, onAction }: NextStepsWizardProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen!';
    if (hour < 18) return 'Guten Tag!';
    return 'Guten Abend!';
  };

  const getContent = () => {
    switch (type) {
      case 'select':
        return {
          icon: Sparkles,
          iconColor: 'text-primary',
          bgGradient: 'from-primary/5 to-primary/10',
          greeting: getTimeBasedGreeting(),
          title: 'Bereit loszulegen?',
          description: `Starten Sie jetzt mit der Auswahl Ihrer Lieblingsfotos für ${gallery.name}`,
          statusText: 'Galerie ist bereit zur Auswahl',
          statusColor: 'bg-secondary',
          buttonText: 'Auswahl starten',
        };
      case 'continue':
        return {
          icon: ArrowRight,
          iconColor: 'text-blue-500',
          bgGradient: 'from-blue-500/5 to-blue-500/10',
          greeting: 'Fast geschafft!',
          title: 'Auswahl fortsetzen',
          description: `Sie haben ${gallery.selected_count} von ${gallery.photos_count} Fotos für ${gallery.name} ausgewählt`,
          statusText: 'Auswahl läuft',
          statusColor: 'bg-blue-500',
          buttonText: 'Weiter auswählen',
        };
      case 'processing':
        return {
          icon: Clock,
          iconColor: 'text-orange-500',
          bgGradient: 'from-orange-500/5 to-orange-500/10',
          greeting: 'In Bearbeitung',
          title: 'Ihre Fotos werden bearbeitet',
          description: `Die Auswahl für ${gallery.name} wird gerade bearbeitet. Sie werden benachrichtigt, sobald die Fotos bereit sind.`,
          statusText: 'Bearbeitung läuft',
          statusColor: 'bg-orange-500',
          buttonText: null,
        };
      case 'delivered':
        return {
          icon: CheckCircle2,
          iconColor: 'text-secondary',
          bgGradient: 'from-secondary/5 to-secondary/10',
          greeting: 'Fertig!',
          title: 'Ihre Fotos sind bereit',
          description: `Die bearbeiteten Fotos für ${gallery.name} stehen zum Download bereit`,
          statusText: 'Bereit zum Download',
          statusColor: 'bg-secondary',
          buttonText: 'Jetzt herunterladen',
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 shadow-lg",
      type === 'select' ? 'border-primary/30' : 'border-muted',
      `bg-gradient-to-br ${content.bgGradient}`
    )}>
      {/* Decorative background elements */}
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2",
        type === 'select' ? 'bg-primary/5' : 'bg-muted/20'
      )} />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className={cn(
              "w-16 h-16 rounded-lg flex items-center justify-center shadow-md",
              type === 'select' ? 'bg-primary/10' : 'bg-muted/20'
            )}>
              <Icon className={cn("h-8 w-8", content.iconColor)} />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {content.greeting}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {content.title}
            </h3>
            <p className="text-base text-muted-foreground">
              {content.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", content.statusColor)} />
              <span>{content.statusText}</span>
            </div>
          </div>

          {/* CTA Button */}
          {content.buttonText && (
            <Button
              onClick={onAction}
              size="lg"
              className="flex-shrink-0 group transition-all duration-300"
            >
              <span>{content.buttonText}</span>
              {type === 'delivered' ? (
                <Download className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
              ) : (
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
