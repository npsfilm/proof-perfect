import { useMemo } from 'react';
import { Sparkles, Camera } from 'lucide-react';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface DashboardHeroProps {
  clientName?: string;
  anrede?: string | null;
}

const MOTIVATIONAL_QUOTES_DU = [
  'Bereit für großartige Fotos?',
  'Deine Immobilie im besten Licht.',
  'Perfekte Bilder für perfekte Verkäufe.',
  'Qualität, die überzeugt.',
  'Dein Erfolg ist unser Antrieb.',
];

const MOTIVATIONAL_QUOTES_SIE = [
  'Bereit für großartige Fotos?',
  'Ihre Immobilie im besten Licht.',
  'Perfekte Bilder für perfekte Verkäufe.',
  'Qualität, die überzeugt.',
  'Ihr Erfolg ist unser Antrieb.',
];

export function DashboardHero({ clientName, anrede }: DashboardHeroProps) {
  const { ansprache } = useAnsprache();
  
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Guten Morgen';
    if (hour < 18) return 'Guten Tag';
    return 'Guten Abend';
  }, []);

  const quote = useMemo(() => {
    const quotes = ansprache === 'Du' ? MOTIVATIONAL_QUOTES_DU : MOTIVATIONAL_QUOTES_SIE;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, [ansprache]);

  const displayName = clientName ? `${anrede || ''} ${clientName}`.trim() : '';

  return (
    <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-4 sm:p-6 md:p-8 lg:p-10 text-primary-foreground animate-fade-in">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 sm:w-64 h-32 sm:h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-24 sm:w-48 h-24 sm:h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        <div className="space-y-1 sm:space-y-2 md:space-y-3">
          <div className="hidden sm:flex items-center gap-2 text-primary-foreground/80">
            <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm font-medium">{quote}</span>
          </div>
          
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            {greeting}{displayName ? `, ${displayName}` : ''}!
          </h1>
          
          <p className="hidden sm:block text-primary-foreground/80 text-sm md:text-lg max-w-xl">
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
