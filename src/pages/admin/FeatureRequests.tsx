import { useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Lightbulb, 
  Search, 
  Filter, 
  Trash2, 
  ExternalLink,
  MessageSquare,
  Clock,
  User,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { useFeatureRequests, FeatureRequest } from '@/hooks/useFeatureRequests';
import { Skeleton } from '@/components/ui/skeleton';

const statusConfig = {
  new: { label: 'Neu', variant: 'default' as const },
  in_review: { label: 'In Prüfung', variant: 'secondary' as const },
  planned: { label: 'Geplant', variant: 'outline' as const },
  completed: { label: 'Umgesetzt', variant: 'default' as const },
  rejected: { label: 'Abgelehnt', variant: 'destructive' as const },
};

const priorityConfig = {
  low: { label: 'Niedrig', className: 'bg-muted text-muted-foreground' },
  normal: { label: 'Normal', className: 'bg-primary/10 text-primary' },
  high: { label: 'Hoch', className: 'bg-destructive/10 text-destructive' },
};

export default function FeatureRequests() {
  const { featureRequests, isLoading, updateFeatureRequest, deleteFeatureRequest, isDeleting } = useFeatureRequests();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<FeatureRequest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const filteredRequests = featureRequests?.filter((request) => {
    const matchesSearch = 
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase()) ||
      request.user_email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  const handleStatusChange = async (id: string, status: FeatureRequest['status']) => {
    await updateFeatureRequest({ id, status });
  };

  const handleSaveNotes = async () => {
    if (selectedRequest) {
      await updateFeatureRequest({ id: selectedRequest.id, admin_notes: adminNotes });
      setSelectedRequest({ ...selectedRequest, admin_notes: adminNotes });
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteFeatureRequest(deleteId);
      setDeleteId(null);
      if (selectedRequest?.id === deleteId) {
        setSelectedRequest(null);
      }
    }
  };

  const openDetail = (request: FeatureRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
  };

  return (
    <PageContainer>
      <PageHeader
        title="Feature-Anfragen"
        description="Feedback und Wünsche von Nutzern"
        breadcrumbs={[
          { label: 'Admin', href: '/admin' },
          { label: 'Feature-Anfragen' },
        ]}
      />

      <div className="space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Priorität" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Prioritäten</SelectItem>
                  {Object.entries(priorityConfig).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Request List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {search || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Keine Anfragen gefunden'
                  : 'Noch keine Feature-Anfragen'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <Card
                key={request.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => openDetail(request)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{request.title}</h3>
                        <Badge variant={statusConfig[request.status].variant}>
                          {statusConfig[request.status].label}
                        </Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig[request.priority].className}`}>
                          {priorityConfig[request.priority].label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {request.user_name || request.user_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(request.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </span>
                        {request.image_url && (
                          <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Bild
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedRequest.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {selectedRequest.user_email}
                  {selectedRequest.user_name && ` (${selectedRequest.user_name})`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status & Priority */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select
                      value={selectedRequest.status}
                      onValueChange={(v) => handleStatusChange(selectedRequest.id, v as FeatureRequest['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-2 block">Priorität</label>
                    <div className={`px-3 py-2 rounded-md text-sm ${priorityConfig[selectedRequest.priority].className}`}>
                      {priorityConfig[selectedRequest.priority].label}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Beschreibung</label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-md">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Image */}
                {selectedRequest.image_url && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Screenshot</label>
                    <a href={selectedRequest.image_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={selectedRequest.image_url}
                        alt="Screenshot"
                        className="rounded-lg max-h-64 object-contain bg-muted w-full"
                      />
                    </a>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Interne Notizen
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notizen für das Team..."
                    rows={3}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleSaveNotes}
                    disabled={adminNotes === (selectedRequest.admin_notes || '')}
                  >
                    Notizen speichern
                  </Button>
                </div>

                {/* Metadata */}
                <div className="text-xs text-muted-foreground border-t pt-4">
                  <p>Erstellt: {format(new Date(selectedRequest.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                  <p>Aktualisiert: {format(new Date(selectedRequest.updated_at), 'dd.MM.yyyy HH:mm', { locale: de })}</p>
                </div>

                {/* Delete */}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(selectedRequest.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Anfrage löschen
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anfrage löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
