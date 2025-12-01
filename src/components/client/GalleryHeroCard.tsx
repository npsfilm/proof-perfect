import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GalleryProgressBar } from '@/components/ui/GalleryProgressBar';
import { Camera, Heart, Home, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GalleryStatus } from '@/constants/gallery-status';

interface GalleryHeroCardProps {
  name: string;
  status: string;
  photosCount: number;
  selectedCount: number;
  stagingCount: number;
  coverImageUrl?: string;
  buttonLabel: string;
  buttonIcon: LucideIcon;
  buttonAction: () => void;
  buttonDisabled?: boolean;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'small';
}

export function GalleryHeroCard({
  name,
  status,
  photosCount,
  selectedCount,
  stagingCount,
  coverImageUrl,
  buttonLabel,
  buttonIcon: ButtonIcon,
  buttonAction,
  buttonDisabled,
  buttonVariant = 'default',
  size = 'default',
}: GalleryHeroCardProps) {
  const progress = photosCount > 0 ? Math.round((selectedCount / photosCount) * 100) : 0;
  const isSmall = size === 'small';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Planning': return 'Planung';
      case 'Open': return 'Offen';
      case 'Closed': return 'Geschlossen';
      case 'Processing': return 'Bearbeitung';
      case 'Delivered': return 'Geliefert';
      default: return status;
    }
  };

  return (
    <Card className="group overflow-hidden shadow-neu-flat hover:shadow-neu-flat-sm transition-all duration-300 border-0">
      {/* Hero Image Background */}
      <div className={cn("relative overflow-hidden", isSmall ? "h-52" : "h-64")}>
        {coverImageUrl ? (
          <>
            <img
              src={coverImageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Camera className="h-16 w-16 text-primary/30" />
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          {/* Status Badge */}
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
              {getStatusLabel(status)}
            </div>
          </div>

          {/* Gallery Name */}
          <h3 className={cn("font-bold text-white mb-3 leading-tight", isSmall ? "text-xl" : "text-2xl")}>
            {name}
          </h3>

          {/* Selection Progress - Text Based */}
          <div className="flex items-center gap-2 mb-1">
            <div className={cn("font-bold text-white", isSmall ? "text-base" : "text-lg")}>
              Auswahl: {selectedCount} / {photosCount} Fotos
            </div>
          </div>
          
          {/* Mini Stats */}
          {stagingCount > 0 && (
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Home className="h-4 w-4" />
              <span>{stagingCount} Staging angefordert</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <CardContent className="p-5">
        <Button
          onClick={buttonAction}
          disabled={buttonDisabled}
          variant={buttonVariant}
          className={cn(
            "w-full rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed hover:scale-105 transition-all duration-200 gap-2 font-semibold",
            isSmall ? "h-10 text-sm" : "h-12 text-base",
            buttonVariant === 'default' && "bg-primary text-primary-foreground"
          )}
        >
          <ButtonIcon className={cn(isSmall ? "h-4 w-4" : "h-5 w-5")} />
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
