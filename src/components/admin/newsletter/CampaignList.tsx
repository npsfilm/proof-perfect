import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Mail, 
  Calendar, 
  Send, 
  Edit2, 
  Trash2, 
  XCircle,
  Users,
  Eye,
  MousePointer,
  Clock
} from 'lucide-react';
import { 
  useNewsletterCampaigns, 
  useDeleteCampaign, 
  useSendCampaign,
  useCancelCampaign 
} from '@/hooks/useNewsletterCampaigns';
import { CampaignEditor } from './CampaignEditor';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
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
import { LoadingState } from '@/components/ui/loading-state';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Entwurf', variant: 'secondary' },
  scheduled: { label: 'Geplant', variant: 'outline' },
  sending: { label: 'Wird gesendet', variant: 'default' },
  sent: { label: 'Gesendet', variant: 'default' },
  cancelled: { label: 'Abgebrochen', variant: 'destructive' },
};

export function CampaignList() {
  const { data: campaigns, isLoading } = useNewsletterCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const sendCampaign = useSendCampaign();
  const cancelCampaign = useCancelCampaign();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sendId, setSendId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingCampaign(id);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingCampaign(null);
    setIsEditorOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCampaign.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleSend = () => {
    if (sendId) {
      sendCampaign.mutate(sendId);
      setSendId(null);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Kampagne
        </Button>
      </div>

      {campaigns?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Kampagnen erstellt</p>
            <Button variant="outline" className="mt-4" onClick={handleCreate}>
              Erste Kampagne erstellen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns?.map((campaign) => {
            const status = statusConfig[campaign.status];
            const canEdit = campaign.status === 'draft' || campaign.status === 'scheduled';
            const canSend = campaign.status === 'draft';
            const canCancel = campaign.status === 'scheduled';

            return (
              <Card key={campaign.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {campaign.name}
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Erstellt am {format(new Date(campaign.created_at), 'dd.MM.yyyy', { locale: de })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(campaign.id)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {canSend && (
                        <Button variant="ghost" size="icon" onClick={() => setSendId(campaign.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {canCancel && (
                        <Button variant="ghost" size="icon" onClick={() => cancelCampaign.mutate(campaign.id)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(campaign.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {campaign.recipient_count !== null && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{campaign.recipient_count} Empfänger</span>
                      </div>
                    )}
                    {campaign.scheduled_for && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Geplant für {format(new Date(campaign.scheduled_for), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                      </div>
                    )}
                    {campaign.sent_at && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Gesendet am {format(new Date(campaign.sent_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                      </div>
                    )}
                    {campaign.status === 'sent' && (
                      <>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>{campaign.open_count} Öffnungen</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MousePointer className="h-4 w-4" />
                          <span>{campaign.click_count} Klicks</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CampaignEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        campaignId={editingCampaign}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampagne löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!sendId} onOpenChange={() => setSendId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kampagne jetzt senden?</AlertDialogTitle>
            <AlertDialogDescription>
              Die E-Mails werden sofort an alle Empfänger versendet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend}>Jetzt senden</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
