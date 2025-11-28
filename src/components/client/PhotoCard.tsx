import { Photo } from '@/types/database';
import { Check, RectangleVertical, RectangleHorizontal, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Orientation } from '@/hooks/usePhotoOrientations';
import watermarkLogo from '@/assets/immoonpoint-watermark.webp';

interface PhotoCardProps {
  photo: Photo;
  index: number;
  width?: number;
  signedUrl: string;
  isComparisonMode?: boolean;
  comparisonIndex?: number;
  orientation?: Orientation;
  allowedOrientation?: Orientation | null;
  onClick: () => void;
  onCheckClick: (e: React.MouseEvent, photo: Photo) => void;
  onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

export function PhotoCard({
  photo,
  index,
  width,
  signedUrl,
  isComparisonMode = false,
  comparisonIndex,
  orientation,
  allowedOrientation = null,
  onClick,
  onCheckClick,
  onImageLoad,
}: PhotoCardProps) {
  const isInComparison = comparisonIndex !== undefined && comparisonIndex !== -1;
  const isDisabled = isComparisonMode && allowedOrientation && orientation && orientation !== allowedOrientation;
  
  return (
    <div
      style={width ? { width: `${width}px`, flexShrink: 0 } : undefined}
      className={`bg-card rounded-lg overflow-hidden shadow-neu-flat transition-all ${
        photo.is_selected 
          ? 'ring-2 ring-primary shadow-lg' 
          : isInComparison
          ? 'ring-2 ring-blue-500 shadow-lg'
          : 'hover:shadow-neu-float'
      } ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {/* Image Container */}
      <div 
        className="relative bg-muted/30 cursor-pointer overflow-hidden aspect-[4/3]"
        onClick={() => !isDisabled && onClick()}
      >
        <img
          src={signedUrl}
          alt={photo.filename}
          className="w-full h-full object-contain hover:scale-105 transition-transform select-none"
          onLoad={onImageLoad}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
        
        {/* Watermark */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end pb-2 pointer-events-none">
          <img 
            src={watermarkLogo} 
            alt="" 
            className="h-12 w-auto opacity-70 select-none"
            draggable={false}
          />
        </div>
        
        {/* Comparison Badge */}
        {isInComparison && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {comparisonIndex + 1}
          </div>
        )}
        
        {/* Orientation Badge - Only show in comparison mode */}
        {isComparisonMode && orientation && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            {orientation === 'portrait' ? (
              <><RectangleVertical className="h-3 w-3" /> Hochformat</>
            ) : orientation === 'landscape' ? (
              <><RectangleHorizontal className="h-3 w-3" /> Querformat</>
            ) : (
              <><Square className="h-3 w-3" /> Quadratisch</>
            )}
          </div>
        )}
        
        {/* Other Badges */}
        {!isComparisonMode && photo.client_comment && (
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Kommentar
          </div>
        )}
        {photo.staging_requested && (
          <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
            Staging
          </div>
        )}
      </div>

      {/* Footer with Photo Number and Checkmark */}
      <div className="flex items-center justify-between p-3 bg-card">
        <span className="text-sm font-medium text-muted-foreground">
          {index + 1}
        </span>
        <Button
          size="sm"
          variant={photo.is_selected ? 'default' : 'outline'}
          onClick={(e) => onCheckClick(e, photo)}
          className="h-8 w-8 p-0 rounded-full"
          aria-label={photo.is_selected ? 'Deselektieren' : 'Auswählen'}
        >
          <Check className={`h-4 w-4 ${photo.is_selected ? '' : 'opacity-50'}`} />
        </Button>
      </div>
    </div>
  );
}

