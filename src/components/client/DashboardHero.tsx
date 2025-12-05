import { useMemo } from 'react';
import { Sparkles, Camera } from 'lucide-react';

interface DashboardHeroProps {
  clientName?: string;
  anrede?: string | null;
}

const MOTIVATIONAL_QUOTES = [
  'Bereit für großartige Fotos?',
  'Ihre Immobilie im besten Licht.',
  'Perfekte Bilder für perfekte Verkäufe.',
  'Qualität, die überzeugt.',
  'Ihr Erfolg ist unser Antrieb.',
];

export function DashboardHero({ clientName, anrede }: DashboardHeroProps) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  }, []);

  const quote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  }, []);

  const displayName = clientName ? `${anrede || ''} ${clientName}`.trim() : '';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-10 text-primary-foreground animate-fade-in">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary-foreground/80">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">{quote}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}{displayName ? `, ${displayName}` : ''}!
          </h1>
          
          <p className="text-primary-foreground/80 text-lg max-w-xl">
            Willkommen bei ImmoOnPoint. Verwalten Sie Ihre Projekte und entdecken Sie unsere Services.
          </p>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
              <Camera className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
