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
}: GalleryHeroCardProps) {
  const progress = photosCount > 0 ? Math.round((selectedCount / photosCount) * 100) : 0;

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
      <div className="relative h-64 overflow-hidden">
        {coverImageUrl ? (
          <>
            <img
              src={coverImageUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
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
          <h3 className="text-2xl font-bold text-white mb-3 leading-tight">
            {name}
          </h3>

          {/* Mini Stats */}
          <div className="flex items-center gap-4 text-sm text-white/90 mb-4">
            <div className="flex items-center gap-1.5">
              <Camera className="h-4 w-4" />
              <span>{photosCount}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white">
              <Heart className="h-4 w-4 fill-white" />
              <span className="font-medium">{selectedCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>{stagingCount}</span>
            </div>
          </div>

          {/* Gallery Status Progress */}
          <div className="mt-1">
            <GalleryProgressBar 
              currentStatus={status as GalleryStatus}
              compact={true}
              className="scale-90 origin-left"
            />
          </div>
        </div>
      </div>

      {/* Action Section */}
      <CardContent className="p-4">
        <Button
          onClick={buttonAction}
          disabled={buttonDisabled}
          variant={buttonVariant}
          className={cn(
            "w-full rounded-full shadow-neu-flat-sm hover:shadow-neu-pressed gap-2",
            buttonVariant === 'default' && "bg-primary text-primary-foreground"
          )}
          size="lg"
        >
          <ButtonIcon className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
