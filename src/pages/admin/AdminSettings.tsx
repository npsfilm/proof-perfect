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
  
  // Du templates
  const [sendSubjectDu, setSendSubjectDu] = useState('');
  const [sendBodyDu, setSendBodyDu] = useState('');
  const [reviewSubjectDu, setReviewSubjectDu] = useState('');
  const [reviewBodyDu, setReviewBodyDu] = useState('');
  const [deliverSubjectDu, setDeliverSubjectDu] = useState('');
  const [deliverBodyDu, setDeliverBodyDu] = useState('');
  
  // Sie templates
  const [sendSubjectSie, setSendSubjectSie] = useState('');
  const [sendBodySie, setSendBodySie] = useState('');
  const [reviewSubjectSie, setReviewSubjectSie] = useState('');
  const [reviewBodySie, setReviewBodySie] = useState('');
  const [deliverSubjectSie, setDeliverSubjectSie] = useState('');
  const [deliverBodySie, setDeliverBodySie] = useState('');

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
      
      // Du templates
      setSendSubjectDu(settings.email_send_subject_du || '');
      setSendBodyDu(settings.email_send_body_du || '');
      setReviewSubjectDu(settings.email_review_subject_du || '');
      setReviewBodyDu(settings.email_review_body_du || '');
      setDeliverSubjectDu(settings.email_deliver_subject_du || '');
      setDeliverBodyDu(settings.email_deliver_body_du || '');
      
      // Sie templates
      setSendSubjectSie(settings.email_send_subject_sie || '');
      setSendBodySie(settings.email_send_body_sie || '');
      setReviewSubjectSie(settings.email_review_subject_sie || '');
      setReviewBodySie(settings.email_review_body_sie || '');
      setDeliverSubjectSie(settings.email_deliver_subject_sie || '');
      setDeliverBodySie(settings.email_deliver_body_sie || '');
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          zapier_webhook_send: webhookSend || null,
          zapier_webhook_deliver: webhookDeliver || null,
          email_send_subject_du: sendSubjectDu || null,
          email_send_body_du: sendBodyDu || null,
          email_review_subject_du: reviewSubjectDu || null,
          email_review_body_du: reviewBodyDu || null,
          email_deliver_subject_du: deliverSubjectDu || null,
          email_deliver_body_du: deliverBodyDu || null,
          email_send_subject_sie: sendSubjectSie || null,
          email_send_body_sie: sendBodySie || null,
          email_review_subject_sie: reviewSubjectSie || null,
          email_review_body_sie: reviewBodySie || null,
          email_deliver_subject_sie: deliverSubjectSie || null,
          email_deliver_body_sie: deliverBodySie || null,
        })
        .eq('id', settings!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Webhook-URLs und E-Mail-Templates wurden erfolgreich aktualisiert.',
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
        sendSubjectDu={sendSubjectDu}
        sendBodyDu={sendBodyDu}
        reviewSubjectDu={reviewSubjectDu}
        reviewBodyDu={reviewBodyDu}
        deliverSubjectDu={deliverSubjectDu}
        deliverBodyDu={deliverBodyDu}
        sendSubjectSie={sendSubjectSie}
        sendBodySie={sendBodySie}
        reviewSubjectSie={reviewSubjectSie}
        reviewBodySie={reviewBodySie}
        deliverSubjectSie={deliverSubjectSie}
        deliverBodySie={deliverBodySie}
        onSendSubjectDuChange={setSendSubjectDu}
        onSendBodyDuChange={setSendBodyDu}
        onReviewSubjectDuChange={setReviewSubjectDu}
        onReviewBodyDuChange={setReviewBodyDu}
        onDeliverSubjectDuChange={setDeliverSubjectDu}
        onDeliverBodyDuChange={setDeliverBodyDu}
        onSendSubjectSieChange={setSendSubjectSie}
        onSendBodySieChange={setSendBodySie}
        onReviewSubjectSieChange={setReviewSubjectSie}
        onReviewBodySieChange={setReviewBodySie}
        onDeliverSubjectSieChange={setDeliverSubjectSie}
        onDeliverBodySieChange={setDeliverBodySie}
      />
    </div>
  );
}
