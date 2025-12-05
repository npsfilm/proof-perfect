import { useState } from 'react';
import { PageContainer } from '@/components/admin/PageContainer';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAdminStagingRequests, useUpdateStagingRequestStatus } from '@/hooks/useAdminStagingRequests';
import { useStagingRequestPhotos } from '@/hooks/useStagingRequests';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { Building2, Clock, Settings, CheckCircle2, Eye, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const statusConfig = {
  pending: {
    label: 'Ausstehend',
    icon: Clock,
    variant: 'default' as const,
    color: 'text-yellow-600',
  },
  processing: {
    label: 'In Bearbeitung',
    icon: Settings,
    variant: 'secondary' as const,
    color: 'text-blue-600',
  },
  delivered: {
    label: 'Geliefert',
    icon: CheckCircle2,
    variant: 'default' as const,
    color: 'text-green-600',
  },
};

export default function StagingRequests() {
  const { data: requests, isLoading } = useAdminStagingRequests();
  const updateStatus = useUpdateStagingRequestStatus();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const selectedRequest = requests?.find((r) => r.id === selectedRequestId);
  const { data: requestPhotos } = useStagingRequestPhotos(selectedRequestId || undefined);
  const photos = requestPhotos?.map((rp) => ({
    ...rp.photos,
    upload_order: 0,
    is_selected: false,
    staging_requested: false,
    blue_hour_requested: false,
    created_at: rp.created_at,
    updated_at: rp.created_at,
  })) || [];
  const { signedUrls } = useSignedPhotoUrls(photos);

  const handleStatusChange = (requestId: string, newStatus: 'pending' | 'processing' | 'delivered') => {
    updateStatus.mutate({ requestId, status: newStatus });
  };

  const filteredRequests = requests?.filter((request) => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const pendingCount = requests?.filter((r) => r.status === 'pending').length || 0;
  const processingCount = requests?.filter((r) => r.status === 'processing').length || 0;
  const deliveredCount = requests?.filter((r) => r.status === 'delivered').length || 0;

  return (
    <PageContainer size="xl">
      <PageHeader
        title="Staging-Anfragen"
        description="Verwalten Sie nachträgliche Staging-Anfragen von Kunden"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Staging-Anfragen' },
        ]}
      />

      {isLoading ? (
        <LoadingState message="Anfragen werden geladen..." />
      ) : !requests || requests.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Keine Staging-Anfragen"
          description="Es wurden noch keine nachträglichen Staging-Anfragen gestellt."
        />
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-neu-flat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold">{pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Ausstehend</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-neu-flat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Settings className="h-8 w-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{processingCount}</div>
                    <div className="text-sm text-muted-foreground">In Bearbeitung</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-neu-flat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold">{deliveredCount}</div>
                    <div className="text-sm text-muted-foreground">Geliefert</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 shadow-neu-pressed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle ({requests.length})</SelectItem>
                <SelectItem value="pending">Ausstehend ({pendingCount})</SelectItem>
                <SelectItem value="processing">In Bearbeitung ({processingCount})</SelectItem>
                <SelectItem value="delivered">Geliefert ({deliveredCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests List */}
          <div className="space-y-3">
            {filteredRequests?.map((request) => {
              const config = statusConfig[request.status];
              const Icon = config.icon;
              const photoCount = requestPhotos?.filter((rp) => rp.staging_request_id === request.id).length || 0;

              return (
                <Card key={request.id} className="shadow-neu-flat hover:shadow-neu-float transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-1 ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{request.galleries.name}</h3>
                            <Badge variant={config.variant}>{config.label}</Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {(request as any).user_email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              {request.staging_style}
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Erstellt am {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                          </div>

                          {request.notes && (
                            <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm">{request.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Select
                          value={request.status}
                          onValueChange={(value) =>
                            handleStatusChange(request.id, value as 'pending' | 'processing' | 'delivered')
                          }
                          disabled={updateStatus.isPending}
                        >
                          <SelectTrigger className="w-full md:w-48 shadow-neu-pressed">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ausstehend</SelectItem>
                            <SelectItem value="processing">In Bearbeitung</SelectItem>
                            <SelectItem value="delivered">Geliefert</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRequestId(request.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Fotos ansehen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo Preview Dialog */}
      <Dialog open={!!selectedRequestId} onOpenChange={() => setSelectedRequestId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.galleries.name} - Staging Fotos
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Kunde:</span> {(selectedRequest as any).user_email}
                </div>
                <div>
                  <span className="font-medium">Stil:</span> {selectedRequest.staging_style}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{' '}
                  <Badge variant={statusConfig[selectedRequest.status].variant}>
                    {statusConfig[selectedRequest.status].label}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Fotos:</span> {photos.length}
                </div>
              </div>

              {selectedRequest.notes && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Anmerkungen:</p>
                  <p className="text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.reference_image_urls && selectedRequest.reference_image_urls.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-3">Referenzbilder ({selectedRequest.reference_image_urls.length}):</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedRequest.reference_image_urls.map((url, index) => (
                      <div
                        key={url}
                        className="relative rounded-xl overflow-hidden shadow-neu-flat aspect-[4/3] bg-muted/30"
                      >
                        <img
                          src={url}
                          alt={`Referenzbild ${index + 1}`}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo, index) => {
                  const signedUrl = signedUrls[photo.id];

                  return (
                    <div
                      key={photo.id}
                      className="relative rounded-xl overflow-hidden shadow-neu-flat aspect-[4/3] bg-muted/30"
                    >
                      {signedUrl && (
                        <img
                          src={signedUrl}
                          alt={photo.filename}
                          className="w-full h-full object-contain"
                          draggable={false}
                        />
                      )}
                      <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                        {index + 1}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
