import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ActionType, TriggerEvent } from '@/types/workflows';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActionConfigFormProps {
  actionType: ActionType;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  triggerEvent: TriggerEvent;
}

export function ActionConfigForm({
  actionType,
  config,
  onChange,
}: ActionConfigFormProps) {
  const { data: emailTemplates } = useQuery({
    queryKey: ['email-templates-simple'],
    queryFn: async () => {
      const { data, error } = await supabase.from('email_templates').select('id, name, template_key').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const updateConfig = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  switch (actionType) {
    case 'send_email':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>E-Mail-Template</Label>
            <Select
              value={(config.template_key as string) || ''}
              onValueChange={(v) => updateConfig('template_key', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Template wählen" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.template_key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Empfänger</Label>
            <Select
              value={(config.recipient_type as string) || 'gallery_clients'}
              onValueChange={(v) => updateConfig('recipient_type', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gallery_clients">Kunden der Galerie</SelectItem>
                <SelectItem value="booking_contact">Buchungs-Kontakt</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.recipient_type === 'custom' && (
            <div className="space-y-2">
              <Label>E-Mail-Adresse(n)</Label>
              <Input
                value={(config.custom_recipients as string) || ''}
                onChange={(e) => updateConfig('custom_recipients', e.target.value)}
                placeholder="email@example.com, email2@example.com"
              />
            </div>
          )}
        </div>
      );

    case 'send_webhook':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook-URL</Label>
            <Input
              value={(config.url as string) || ''}
              onChange={(e) => updateConfig('url', e.target.value)}
              placeholder="https://hooks.zapier.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>HTTP-Methode</Label>
            <Select
              value={(config.method as string) || 'POST'}
              onValueChange={(v) => updateConfig('method', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Benutzerdefinierter Body (optional, JSON)</Label>
            <Textarea
              value={(config.custom_body as string) || ''}
              onChange={(e) => updateConfig('custom_body', e.target.value)}
              placeholder='{"key": "{gallery_name}"}'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Leer lassen, um automatisch alle Event-Daten zu senden
            </p>
          </div>
        </div>
      );

    case 'create_calendar_event':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Titel-Template</Label>
            <Input
              value={(config.title_template as string) || ''}
              onChange={(e) => updateConfig('title_template', e.target.value)}
              placeholder="Shooting: {address}"
            />
          </div>
          <div className="space-y-2">
            <Label>Beschreibung-Template</Label>
            <Textarea
              value={(config.description_template as string) || ''}
              onChange={(e) => updateConfig('description_template', e.target.value)}
              placeholder="Kunde: {client_name}&#10;Paket: {package_type}"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Dauer (Minuten)</Label>
            <Input
              type="number"
              value={(config.duration_minutes as number) || 60}
              onChange={(e) => updateConfig('duration_minutes', parseInt(e.target.value))}
              min={15}
              step={15}
            />
          </div>
        </div>
      );

    case 'create_gallery':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Galerie-Name-Template</Label>
            <Input
              value={(config.name_template as string) || ''}
              onChange={(e) => updateConfig('name_template', e.target.value)}
              placeholder="{address}"
            />
          </div>
          <div className="space-y-2">
            <Label>Paket-Fotoanzahl</Label>
            <Input
              type="number"
              value={(config.package_target_count as number) || 25}
              onChange={(e) => updateConfig('package_target_count', parseInt(e.target.value))}
              min={1}
            />
          </div>
        </div>
      );

    case 'update_gallery_status':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Neuer Status</Label>
            <Select
              value={(config.new_status as string) || 'Open'}
              onValueChange={(v) => updateConfig('new_status', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planung</SelectItem>
                <SelectItem value="Open">Offen</SelectItem>
                <SelectItem value="Closed">Geschlossen</SelectItem>
                <SelectItem value="Processing">In Bearbeitung</SelectItem>
                <SelectItem value="Delivered">Geliefert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    case 'notify_admin':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nachricht-Template</Label>
            <Textarea
              value={(config.message_template as string) || ''}
              onChange={(e) => updateConfig('message_template', e.target.value)}
              placeholder="Neue Buchung: {address} am {scheduled_date}"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Priorität</Label>
            <Select
              value={(config.priority as string) || 'normal'}
              onValueChange={(v) => updateConfig('priority', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    default:
      return (
        <p className="text-sm text-muted-foreground">
          Keine Konfiguration für diesen Aktionstyp verfügbar.
        </p>
      );
  }
}
