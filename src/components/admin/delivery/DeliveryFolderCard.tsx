import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DELIVERY_FOLDERS, DeliveryFolderType } from '@/constants/delivery-folders';
import { DeliveryFilesList } from './DeliveryFilesList';
import { DeliveryFolderUploader } from './DeliveryFolderUploader';
import { DeliveryFile } from '@/types/database';

interface DeliveryFolderCardProps {
  folderType: DeliveryFolderType;
  files: DeliveryFile[];
  galleryId: string;
  gallerySlug: string;
  compact?: boolean;
}

export function DeliveryFolderCard({
  folderType,
  files,
  galleryId,
  gallerySlug,
  compact = false,
}: DeliveryFolderCardProps) {
  const folder = DELIVERY_FOLDERS[folderType];
  const Icon = folder.icon;
  
  const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (compact) {
    return (
      <Card className="hover:border-primary/30 transition-colors">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className={`p-1.5 rounded-md bg-muted/50 ${folder.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <DeliveryFolderUploader
              galleryId={galleryId}
              gallerySlug={gallerySlug}
              folderType={folderType}
              compact
            />
          </div>
          <h4 className="text-xs font-medium truncate">{folder.label}</h4>
          <p className="text-[10px] text-muted-foreground">
            {files.length > 0 ? `${files.length} Dateien` : 'Keine Dateien'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-muted/50 ${folder.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{folder.label}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {folder.description}
              </p>
            </div>
          </div>
          <DeliveryFolderUploader
            galleryId={galleryId}
            gallerySlug={gallerySlug}
            folderType={folderType}
          />
        </div>
      </CardHeader>
      <CardContent>
        <DeliveryFilesList files={files} galleryId={galleryId} />
        {files.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            {files.length} Datei{files.length !== 1 ? 'en' : ''} • {formatSize(totalSize)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
