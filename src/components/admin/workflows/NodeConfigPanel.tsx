import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import {
  TRIGGER_DEFINITIONS,
  ACTION_DEFINITIONS,
  DELAY_UNITS,
  CONDITION_OPERATORS,
  getTriggerDefinition,
  type NodeType,
  type TriggerEvent,
  type ActionType,
  type DelayUnit,
  type ConditionOperator,
} from '@/types/workflows';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NodeConfigPanelProps {
  node: {
    id: string;
    type?: string;
    data: Record<string, unknown>;
  } | null;
  triggerEvent?: TriggerEvent;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, triggerEvent, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const { data: emailTemplates } = useQuery({
    queryKey: ['email-templates-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, template_key, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  if (!node) return null;

  const nodeType = node.type as NodeType;
  const nodeData = node.data as Record<string, unknown>;
  const nodeConfig = (nodeData.node_config as Record<string, unknown>) || {};

  const updateConfig = (key: string, value: unknown) => {
    onUpdate(node.id, {
      ...nodeData,
      node_config: { ...nodeConfig, [key]: value },
    });
  };

  const updateData = (key: string, value: unknown) => {
    onUpdate(node.id, { ...nodeData, [key]: value });
  };

  // Get available data fields from trigger
  const triggerDef = triggerEvent ? getTriggerDefinition(triggerEvent) : null;
  const availableFields = triggerDef?.availableData || [];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b">
        <CardTitle className="text-sm font-medium">Konfiguration</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-auto space-y-4">
        {/* Trigger Node Config */}
        {nodeType === 'trigger' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Trigger-Event</Label>
              <Select
                value={(nodeData.trigger_event as string) || ''}
                onValueChange={(v) => updateData('trigger_event', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Event auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGER_DEFINITIONS.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {triggerDef && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Verfügbare Daten:</p>
                <div className="flex flex-wrap gap-1">
                  {triggerDef.availableData.map((field) => (
                    <span
                      key={field}
                      className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono"
                    >
                      {'{' + field + '}'}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Node Config */}
        {nodeType === 'action' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Aktionstyp</Label>
              <Select
                value={(nodeData.action_type as string) || ''}
                onValueChange={(v) => updateData('action_type', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Aktion auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_DEFINITIONS.map((a) => (
                    <SelectItem key={a.key} value={a.key}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email Action Config */}
            {nodeData.action_type === 'send_email' && (
              <>
                <div>
                  <Label className="text-xs">E-Mail-Template</Label>
                  <Select
                    value={(nodeConfig.template_key as string) || ''}
                    onValueChange={(v) => updateConfig('template_key', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Template auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {emailTemplates?.map((t) => (
                        <SelectItem key={t.id} value={t.template_key}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Empfänger</Label>
                  <Select
                    value={(nodeConfig.recipient_type as string) || 'gallery_clients'}
                    onValueChange={(v) => updateConfig('recipient_type', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gallery_clients">Galerie-Kunden</SelectItem>
                      <SelectItem value="booking_contact">Buchungskontakt</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {nodeConfig.recipient_type === 'custom' && (
                  <div>
                    <Label className="text-xs">E-Mail-Adressen (kommagetrennt)</Label>
                    <Input
                      className="mt-1"
                      value={(nodeConfig.custom_recipients as string) || ''}
                      onChange={(e) => updateConfig('custom_recipients', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                )}
              </>
            )}

            {/* Webhook Action Config */}
            {nodeData.action_type === 'send_webhook' && (
              <>
                <div>
                  <Label className="text-xs">Webhook URL</Label>
                  <Input
                    className="mt-1"
                    value={(nodeConfig.url as string) || ''}
                    onChange={(e) => updateConfig('url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-xs">HTTP-Methode</Label>
                  <Select
                    value={(nodeConfig.method as string) || 'POST'}
                    onValueChange={(v) => updateConfig('method', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Gallery Status Action Config */}
            {nodeData.action_type === 'update_gallery_status' && (
              <div>
                <Label className="text-xs">Neuer Status</Label>
                <Select
                  value={(nodeConfig.new_status as string) || ''}
                  onValueChange={(v) => updateConfig('new_status', v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Status auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notify Admin Config */}
            {nodeData.action_type === 'notify_admin' && (
              <>
                <div>
                  <Label className="text-xs">Nachricht</Label>
                  <Input
                    className="mt-1"
                    value={(nodeConfig.message_template as string) || ''}
                    onChange={(e) => updateConfig('message_template', e.target.value)}
                    placeholder="z.B. Neue Buchung von {contact_name}"
                  />
                </div>
                <div>
                  <Label className="text-xs">Priorität</Label>
                  <Select
                    value={(nodeConfig.priority as string) || 'normal'}
                    onValueChange={(v) => updateConfig('priority', v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Niedrig</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        )}

        {/* Delay Node Config */}
        {nodeType === 'delay' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Wartezeit</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  min={1}
                  className="flex-1"
                  value={(nodeConfig.delay_value as number) || 1}
                  onChange={(e) => updateConfig('delay_value', parseInt(e.target.value) || 1)}
                />
                <Select
                  value={(nodeConfig.delay_unit as DelayUnit) || 'hours'}
                  onValueChange={(v) => updateConfig('delay_unit', v)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELAY_UNITS.map((u) => (
                      <SelectItem key={u.value} value={u.value}>
                        {u.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Condition Node Config */}
        {nodeType === 'condition' && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Variable</Label>
              <Select
                value={(nodeConfig.field as string) || ''}
                onValueChange={(v) => updateConfig('field', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Variable auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                  <SelectItem value="gallery_status">gallery_status</SelectItem>
                  <SelectItem value="selected_count">selected_count</SelectItem>
                  <SelectItem value="staging_count">staging_count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Operator</Label>
              <Select
                value={(nodeConfig.operator as ConditionOperator) || 'equals'}
                onValueChange={(v) => updateConfig('operator', v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!['is_empty', 'is_not_empty', 'is_true', 'is_false'].includes(
              (nodeConfig.operator as string) || ''
            ) && (
              <div>
                <Label className="text-xs">Wert</Label>
                <Input
                  className="mt-1"
                  value={(nodeConfig.value as string) || ''}
                  onChange={(e) => updateConfig('value', e.target.value)}
                  placeholder="Vergleichswert"
                />
              </div>
            )}
          </div>
        )}

        {/* End Node - no config needed */}
        {nodeType === 'end' && (
          <p className="text-sm text-muted-foreground">
            Der End-Knoten beendet diesen Pfad des Workflows.
          </p>
        )}
      </CardContent>

      {/* Delete Button - not for trigger */}
      {nodeType !== 'trigger' && (
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Knoten löschen
          </Button>
        </div>
      )}
    </Card>
  );
}
