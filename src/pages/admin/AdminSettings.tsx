import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookSend, setWebhookSend] = useState('');
  const [webhookDeliver, setWebhookDeliver] = useState('');
  const [sendSubject, setSendSubject] = useState('');
  const [sendBody, setSendBody] = useState('');
  const [reviewSubject, setReviewSubject] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [deliverSubject, setDeliverSubject] = useState('');
  const [deliverBody, setDeliverBody] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings) {
      setWebhookSend(settings.zapier_webhook_send || '');
      setWebhookDeliver(settings.zapier_webhook_deliver || '');
      setSendSubject(settings.email_send_subject || '');
      setSendBody(settings.email_send_body || '');
      setReviewSubject(settings.email_review_subject || '');
      setReviewBody(settings.email_review_body || '');
      setDeliverSubject(settings.email_deliver_subject || '');
      setDeliverBody(settings.email_deliver_body || '');
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          zapier_webhook_send: webhookSend || null,
          zapier_webhook_deliver: webhookDeliver || null,
          email_send_subject: sendSubject || null,
          email_send_body: sendBody || null,
          email_review_subject: reviewSubject || null,
          email_review_body: reviewBody || null,
          email_deliver_subject: deliverSubject || null,
          email_deliver_body: deliverBody || null,
        })
        .eq('id', settings!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Webhook-URLs wurden erfolgreich aktualisiert.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Zapier Webhooks</CardTitle>
          <CardDescription>
            Zapier-Webhook-URLs für Benachrichtigungen konfigurieren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-send">An Kunde senden Webhook</Label>
            <Input
              id="webhook-send"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookSend}
              onChange={(e) => setWebhookSend(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Wird ausgelöst, wenn Galerie mit Zugangsdaten an Kunden gesendet wird
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-deliver">Lieferungs-Webhook</Label>
            <Input
              id="webhook-deliver"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookDeliver}
              onChange={(e) => setWebhookDeliver(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Wird ausgelöst, wenn finale Dateien an Kunden geliefert werden
            </p>
          </div>

          <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? 'Wird gespeichert...' : 'Einstellungen speichern'}
          </Button>
        </CardContent>
      </Card>

      <EmailTemplateEditor
        sendSubject={sendSubject}
        sendBody={sendBody}
        reviewSubject={reviewSubject}
        reviewBody={reviewBody}
        deliverSubject={deliverSubject}
        deliverBody={deliverBody}
        onSendSubjectChange={setSendSubject}
        onSendBodyChange={setSendBody}
        onReviewSubjectChange={setReviewSubject}
        onReviewBodyChange={setReviewBody}
        onDeliverSubjectChange={setDeliverSubject}
        onDeliverBodyChange={setDeliverBody}
      />
    </div>
  );
}
