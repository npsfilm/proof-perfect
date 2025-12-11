import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Copy, 
  Check, 
  Clock, 
  Home, 
  Sunrise,
  Target,
  Camera,
  CheckCircle2,
  Palette,
  MessageSquare,
  Pin,
  Building2,
  User
} from 'lucide-react';
import { Gallery, Photo } from '@/types/database';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const STATUS_LABELS: Record<string, string> = {
  'Planning': 'Planung',
  'Open': 'Offen',
  'Closed': 'Geschlossen',
  'Processing': 'In Bearbeitung',
  'Delivered': 'Geliefert',
};

interface GalleryInfoSummaryProps {
  gallery: Gallery;
  selectedPhotos: Photo[];
  stagingPhotos: Photo[];
  blueHourPhotos: Photo[];
  photosWithComments: Photo[];
  photosWithAnnotations: number;
  companyName?: string;
}

export function GalleryInfoSummary({
  gallery,
  selectedPhotos,
  stagingPhotos,
  blueHourPhotos,
  photosWithComments,
  photosWithAnnotations,
  companyName,
}: GalleryInfoSummaryProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const hasServices = gallery.express_delivery_requested || stagingPhotos.length > 0 || blueHourPhotos.length > 0;
  const galleryUrl = `${window.location.origin}/gallery/${gallery.slug}`;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    toast({ title: 'URL kopiert' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className={gallery.express_delivery_requested ? 'border-2 border-service-express' : ''}>
      <CardContent className="p-4">
        {/* Header with name, status, services */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-base truncate">{gallery.name}</h3>
              {gallery.address && (
                <p className="text-xs text-muted-foreground truncate">{gallery.address}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="text-xs">
              {STATUS_LABELS[gallery.status] || gallery.status}
            </Badge>
            {gallery.express_delivery_requested && (
              <Badge className="bg-service-express hover:bg-service-express/90 text-white text-xs animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                24H
              </Badge>
            )}
            {stagingPhotos.length > 0 && (
              <Badge className="bg-service-staging hover:bg-service-staging/90 text-white text-xs">
                <Home className="h-3 w-3 mr-1" />
                {stagingPhotos.length}×
              </Badge>
            )}
            {blueHourPhotos.length > 0 && (
              <Badge className="bg-gradient-to-r from-service-bluehour-start to-service-bluehour-end text-white text-xs">
                <Sunrise className="h-3 w-3 mr-1" />
                {blueHourPhotos.length}×
              </Badge>
            )}
          </div>
        </div>

        {/* Stats as inline pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          <StatPill icon={Target} label="Ziel" value={gallery.package_target_count} />
          <StatPill icon={CheckCircle2} label="Ausgewählt" value={selectedPhotos.length} highlight />
          {stagingPhotos.length > 0 && (
            <StatPill icon={Palette} label="Staging" value={stagingPhotos.length} />
          )}
          {blueHourPhotos.length > 0 && (
            <StatPill icon={Sunrise} label="Blue Hour" value={blueHourPhotos.length} />
          )}
          {photosWithComments.length > 0 && (
            <StatPill icon={MessageSquare} label="Kommentare" value={photosWithComments.length} />
          )}
          {photosWithAnnotations > 0 && (
            <StatPill icon={Pin} label="Markierungen" value={photosWithAnnotations} />
          )}
          <StatPill 
            icon={User} 
            label="Anrede" 
            value={gallery.salutation_type === 'Du' ? 'Du' : 'Sie'} 
          />
          {companyName && (
            <StatPill icon={Building2} label="Firma" value={companyName} />
          )}
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
          <span className="text-muted-foreground truncate flex-1">
            /gallery/{gallery.slug}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleCopyUrl}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatPillProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatPill({ icon: Icon, label, value, highlight }: StatPillProps) {
  return (
    <div className={`
      inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs
      ${highlight ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-muted-foreground'}
    `}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{value}</span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
