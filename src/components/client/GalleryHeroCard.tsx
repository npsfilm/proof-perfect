import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Home, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  size?: 'default' | 'small' | 'mobile';
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
  const isSmall = size === 'small';
  const isMobile = size === 'mobile';

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
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg border">
      {/* Hero Image Background */}
      <div className={cn(
        "relative overflow-hidden",
        isMobile ? "h-36" : isSmall ? "h-52" : "h-64"
      )}>
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
            <Camera className={cn(isMobile ? "h-10 w-10" : "h-16 w-16", "text-primary/30")} />
          </div>
        )}

        {/* Content Overlay */}
        <div className={cn(
          "absolute inset-0 flex flex-col justify-end",
          isMobile ? "p-3" : "p-6"
        )}>
          {/* Status Badge */}
          <div className={cn(isMobile ? "mb-1.5" : "mb-3")}>
            <div className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30",
              isMobile ? "text-[10px] px-2 py-1" : "text-xs px-3 py-1.5"
            )}>
              {getStatusLabel(status)}
            </div>
          </div>

          {/* Gallery Name */}
          <h3 className={cn(
            "font-bold text-white leading-tight line-clamp-2",
            isMobile ? "text-sm mb-1.5" : isSmall ? "text-xl mb-3" : "text-2xl mb-3"
          )}>
            {name}
          </h3>

          {/* Selection Progress - Text Based */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "font-bold text-white",
              isMobile ? "text-xs" : isSmall ? "text-base" : "text-lg"
            )}>
              {selectedCount} / {photosCount} Fotos
            </div>
          </div>
          
          {/* Mini Stats - hidden on mobile */}
          {stagingCount > 0 && !isMobile && (
            <div className="flex items-center gap-2 text-sm text-white/80 mt-1">
              <Home className="h-4 w-4" />
              <span>{stagingCount} Staging</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <CardContent className={cn(isMobile ? "p-2.5" : "p-5")}>
        <Button
          onClick={buttonAction}
          disabled={buttonDisabled}
          variant={buttonVariant}
          className={cn(
            "w-full gap-1.5 font-semibold transition-all duration-200",
            isMobile ? "h-8 text-xs" : isSmall ? "h-10 text-sm" : "h-12 text-base",
            buttonVariant === 'default' && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <ButtonIcon className={cn(isMobile ? "h-3.5 w-3.5" : isSmall ? "h-4 w-4" : "h-5 w-5")} />
          <span className={cn(isMobile && "truncate")}>{buttonLabel}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
