import { Download, Archive, File } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDownloadLogs } from '@/hooks/useDownloadLogs';
import { LoadingState } from '@/components/ui/loading-state';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface DownloadHistoryCardProps {
  galleryId: string;
}

export function DownloadHistoryCard({ galleryId }: DownloadHistoryCardProps) {
  const { data: logs, isLoading } = useDownloadLogs(galleryId);

  const getDownloadIcon = (type: string) => {
    switch (type) {
      case 'single_file':
        return <File className="h-4 w-4" />;
      case 'folder_zip':
      case 'gallery_zip':
        return <Archive className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getDownloadLabel = (type: string, folderType?: string, fileCount?: number) => {
    if (type === 'single_file') return 'Einzelne Datei';
    if (type === 'gallery_zip') return `Gesamte Galerie (${fileCount} Dateien)`;
    if (type === 'folder_zip' && folderType) {
      const labels: Record<string, string> = {
        full_resolution: 'Volle Auflösung',
        web_version: 'Web-Version',
        virtual_staging: 'Virtuelles Staging',
        blue_hour: 'Virtuelle Blaue Stunde',
      };
      return `${labels[folderType] || folderType} (${fileCount} Dateien)`;
    }
    return 'Download';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return ` • ${mb.toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <Card className="shadow-neu-flat">
        <CardContent className="py-6">
          <LoadingState message="Lädt Download-Historie..." />
        </CardContent>
      </Card>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <Card className="shadow-neu-flat">
        <CardHeader>
          <CardTitle className="text-base">Download-Historie</CardTitle>
          <CardDescription>Keine Downloads aufgezeichnet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate statistics
  const totalDownloads = logs.length;
  const uniqueUsers = new Set(logs.map(log => log.user_id)).size;
  const totalFiles = logs.reduce((sum, log) => sum + log.file_count, 0);

  return (
    <Card className="shadow-neu-flat">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Download-Historie</CardTitle>
            <CardDescription className="text-xs">
              {totalDownloads} Downloads • {uniqueUsers} Benutzer • {totalFiles} Dateien
            </CardDescription>
          </div>
          <Download className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map((log: any) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="p-1.5 rounded-lg bg-background">
                {getDownloadIcon(log.download_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {getDownloadLabel(log.download_type, log.folder_type, log.file_count)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {log.profiles?.email || 'Unbekannt'}
                  {formatFileSize(log.total_size_bytes)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true,
                    locale: de 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
