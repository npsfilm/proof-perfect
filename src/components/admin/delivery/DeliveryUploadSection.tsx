import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeliveryFolderCard } from './DeliveryFolderCard';
import { useDeliveryFiles, useDeliveryFolderStats } from '@/hooks/useDeliveryFiles';
import { DELIVERY_FOLDERS, DeliveryFolderType } from '@/constants/delivery-folders';
import { LoadingState } from '@/components/ui/loading-state';

interface DeliveryUploadSectionProps {
  galleryId: string;
  gallerySlug: string;
}

export function DeliveryUploadSection({ galleryId, gallerySlug }: DeliveryUploadSectionProps) {
  const { data: files, isLoading } = useDeliveryFiles(galleryId);
  const { data: stats } = useDeliveryFolderStats(galleryId);

  if (isLoading) {
    return (
      <Card className="shadow-neu-flat">
        <CardContent className="py-6">
          <LoadingState message="Lädt Lieferdateien..." />
        </CardContent>
      </Card>
    );
  }

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
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <Card className="shadow-neu-flat border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Finale Dateien hochladen</CardTitle>
            <CardDescription>
              Laden Sie die finalen Bilder in verschiedenen Formaten hoch
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {folderTypes.map((folderType) => {
            const folderFiles = files?.filter((f) => f.folder_type === folderType) || [];
            return (
              <DeliveryFolderCard
                key={folderType}
                folderType={folderType}
                files={folderFiles}
                galleryId={galleryId}
                gallerySlug={gallerySlug}
              />
            );
          })}
        </div>
        
        {totalFiles > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Gesamt</span>
              <span className="text-muted-foreground">
                {totalFiles} Datei{totalFiles !== 1 ? 'en' : ''} • {formatSize(totalSize)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
