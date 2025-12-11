import { Package, ExternalLink, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DeliveryFolderCard } from '../delivery/DeliveryFolderCard';
import { useDeliveryFiles } from '@/hooks/useDeliveryFiles';
import { DeliveryFolderType } from '@/constants/delivery-folders';
import { Skeleton } from '@/components/ui/skeleton';

interface CompactDeliverySectionProps {
  galleryId: string;
  gallerySlug: string;
  useExternalLink: boolean;
  setUseExternalLink: (value: boolean) => void;
  externalLink: string;
  setExternalLink: (value: string) => void;
  isDelivered?: boolean;
}

export function CompactDeliverySection({
  galleryId,
  gallerySlug,
  useExternalLink,
  setUseExternalLink,
  externalLink,
  setExternalLink,
  isDelivered,
}: CompactDeliverySectionProps) {
  const { data: files, isLoading } = useDeliveryFiles(galleryId);

  const folderTypes: DeliveryFolderType[] = [
    'full_resolution',
    'web_version',
    'virtual_staging',
    'blue_hour',
  ];

  const totalFiles = files?.length || 0;
  const totalSize = files?.reduce((sum, file) => sum + (file.file_size || 0), 0) || 0;
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1000 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Lieferung</CardTitle>
          </div>
          {totalFiles > 0 && (
            <span className="text-xs text-muted-foreground">
              {totalFiles} Dateien • {formatSize(totalSize)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Delivery method selection - only show if not delivered */}
        {!isDelivered && (
          <RadioGroup
            value={useExternalLink ? 'external' : 'inapp'}
            onValueChange={(v) => setUseExternalLink(v === 'external')}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="inapp" id="inapp" />
              <Label htmlFor="inapp" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" />
                In-App Downloads
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="external" id="external" />
              <Label htmlFor="external" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Externer Link
              </Label>
            </div>
          </RadioGroup>
        )}

        {/* External link input */}
        {useExternalLink && !isDelivered && (
          <Input
            placeholder="https://drive.google.com/... oder transfernow.net/..."
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            className="text-sm"
          />
        )}

        {/* Folder grid */}
        {isLoading ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            {folderTypes.map((folderType) => {
              const folderFiles = files?.filter((f) => f.folder_type === folderType) || [];
              return (
                <DeliveryFolderCard
                  key={folderType}
                  folderType={folderType}
                  files={folderFiles}
                  galleryId={galleryId}
                  gallerySlug={gallerySlug}
                  compact
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
