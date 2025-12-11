import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EmailTemplateEditor } from '@/components/admin/EmailTemplateEditor';
import { EmailTemplates } from '@/types/email-templates';
import { Save, Webhook, Mail, Clock, Palette } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { AvailabilitySettings } from '@/components/admin/availability';
import { ColorPaletteEditor } from '@/components/admin/theme';
export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookSend, setWebhookSend] = useState('');
  const [webhookDeliver, setWebhookDeliver] = useState('');
  
  const [templates, setTemplates] = useState<EmailTemplates>({
    du: {
      send: { subject: '', body: '' },
      review: { subject: '', body: '' },
      deliver: { subject: '', body: '' },
    },
    sie: {
      send: { subject: '', body: '' },
      review: { subject: '', body: '' },
      deliver: { subject: '', body: '' },
    },
  });

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
      
      setTemplates({
        du: {
          send: {
            subject: settings.email_send_subject_du || '',
            body: settings.email_send_body_du || '',
          },
          review: {
            subject: settings.email_review_subject_du || '',
            body: settings.email_review_body_du || '',
          },
          deliver: {
            subject: settings.email_deliver_subject_du || '',
            body: settings.email_deliver_body_du || '',
          },
        },
        sie: {
          send: {
            subject: settings.email_send_subject_sie || '',
            body: settings.email_send_body_sie || '',
          },
          review: {
            subject: settings.email_review_subject_sie || '',
            body: settings.email_review_body_sie || '',
          },
          deliver: {
            subject: settings.email_deliver_subject_sie || '',
            body: settings.email_deliver_body_sie || '',
          },
        },
      });
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          zapier_webhook_send: webhookSend || null,
          zapier_webhook_deliver: webhookDeliver || null,
          email_send_subject_du: templates.du.send.subject || null,
          email_send_body_du: templates.du.send.body || null,
          email_review_subject_du: templates.du.review.subject || null,
          email_review_body_du: templates.du.review.body || null,
          email_deliver_subject_du: templates.du.deliver.subject || null,
          email_deliver_body_du: templates.du.deliver.body || null,
          email_send_subject_sie: templates.sie.send.subject || null,
          email_send_body_sie: templates.sie.send.body || null,
          email_review_subject_sie: templates.sie.review.subject || null,
          email_review_body_sie: templates.sie.review.body || null,
          email_deliver_subject_sie: templates.sie.deliver.subject || null,
          email_deliver_body_sie: templates.sie.deliver.body || null,
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
    <PageContainer size="lg">
      <div className="space-y-4 md:space-y-6">
        <PageHeader
          title="Einstellungen"
          description="System-Konfiguration und E-Mail-Templates"
          breadcrumbs={[{ label: 'Einstellungen' }]}
        />

        <Tabs defaultValue="availability" className="space-y-4 md:space-y-6">
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="availability" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Verfügbarkeit
            </TabsTrigger>
            <TabsTrigger value="design" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Palette className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Webhook className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm px-2 md:px-3">
              <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">E-Mail-Templates</span>
              <span className="sm:hidden">E-Mails</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="availability">
            <AvailabilitySettings />
          </TabsContent>

          <TabsContent value="design">
            <ColorPaletteEditor />
          </TabsContent>

          <TabsContent value="webhooks">
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
          </TabsContent>

          <TabsContent value="emails">
            <EmailTemplateEditor
              templates={templates}
              onTemplatesChange={setTemplates}
            />
            <div className="mt-4">
              <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Wird gespeichert...' : 'Templates speichern'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
