import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookSend, setWebhookSend] = useState('');
  const [webhookDeliver, setWebhookDeliver] = useState('');

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
    }
  }, [settings]);

  const updateSettings = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('system_settings')
        .update({
          zapier_webhook_send: webhookSend || null,
          zapier_webhook_deliver: webhookDeliver || null,
        })
        .eq('id', settings!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: 'Settings saved',
        description: 'Webhook URLs have been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Zapier Webhooks</CardTitle>
          <CardDescription>
            Configure Zapier webhook URLs for sending notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-send">Send to Client Webhook</Label>
            <Input
              id="webhook-send"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookSend}
              onChange={(e) => setWebhookSend(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Triggered when gallery is sent to clients with credentials
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-deliver">Delivery Webhook</Label>
            <Input
              id="webhook-deliver"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookDeliver}
              onChange={(e) => setWebhookDeliver(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Triggered when final files are delivered to clients
            </p>
          </div>

          <Button onClick={() => updateSettings.mutate()} disabled={updateSettings.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
