import { ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NextStepsWizardProps {
  galleryName: string;
  galleryAddress?: string;
  onStartSelection: () => void;
}

export function NextStepsWizard({ 
  galleryName, 
  galleryAddress, 
  onStartSelection 
}: NextStepsWizardProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen!';
    if (hour < 18) return 'Guten Tag!';
    return 'Guten Abend!';
  };

  return (
    <Card className="relative overflow-hidden border-2 border-primary/30 shadow-neu-float bg-gradient-to-br from-primary/5 to-primary/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-neu-flat">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {getTimeBasedGreeting()} Bereit loszulegen?
            </h3>
            <p className="text-base text-muted-foreground">
              Starten Sie jetzt mit der Auswahl Ihrer Lieblingsfotos für{' '}
              <span className="font-semibold text-foreground">
                {galleryAddress || galleryName}
              </span>
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Galerie ist bereit zur Auswahl</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onStartSelection}
            size="lg"
            className={cn(
              "flex-shrink-0 rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed",
              "group transition-all duration-300 hover:scale-105"
            )}
          >
            <span>Auswahl starten</span>
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
