import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useClientTags } from '@/hooks/useClientTags';
import {
  useCreateCampaign,
  useUpdateCampaign,
  useCampaignWithTemplate,
  useCampaignRecipientCount,
} from '@/hooks/useNewsletterCampaigns';
import { CampaignTagPicker } from './CampaignTagPicker';

interface CampaignEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string | null;
}

export function CampaignEditor({ open, onOpenChange, campaignId }: CampaignEditorProps) {
  const { data: existingCampaign } = useCampaignWithTemplate(campaignId);
  const { templates } = useEmailTemplates('newsletter');
  const { data: tags } = useClientTags();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();

  const [name, setName] = useState('');
  const [templateId, setTemplateId] = useState<string>('');
  const [targetTags, setTargetTags] = useState<string[]>([]);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  const { data: recipientCount } = useCampaignRecipientCount(targetTags, excludeTags);

  useEffect(() => {
    if (existingCampaign) {
      setName(existingCampaign.name);
      setTemplateId(existingCampaign.template_id || '');
      setTargetTags(existingCampaign.target_tags || []);
      setExcludeTags(existingCampaign.exclude_tags || []);
      setIsScheduled(!!existingCampaign.scheduled_for);
      setScheduledFor(existingCampaign.scheduled_for || '');
    } else {
      setName('');
      setTemplateId('');
      setTargetTags([]);
      setExcludeTags([]);
      setIsScheduled(false);
      setScheduledFor('');
    }
  }, [existingCampaign, open]);

  const handleSave = () => {
    const campaignData = {
      name,
      template_id: templateId || null,
      target_tags: targetTags,
      exclude_tags: excludeTags,
      status: isScheduled ? 'scheduled' as const : 'draft' as const,
      scheduled_for: isScheduled ? scheduledFor : null,
    };

    if (campaignId) {
      updateCampaign.mutate({ id: campaignId, ...campaignData }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createCampaign.mutate(campaignData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isValid = name.trim() && templateId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaignId ? 'Kampagne bearbeiten' : 'Neue Kampagne'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Frühjahrs-Newsletter 2025"
            />
          </div>

          {/* Template */}
          <div className="space-y-2">
            <Label>E-Mail-Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Template auswählen" />
              </SelectTrigger>
              <SelectContent>
                {templates?.filter(t => t.is_active).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Tags */}
          <div className="space-y-2">
            <Label>Zielgruppe (Tags)</Label>
            <p className="text-sm text-muted-foreground">
              Nur Clients mit mindestens einem dieser Tags erhalten die E-Mail.
              Leer = alle Clients.
            </p>
            <CampaignTagPicker
              tags={tags || []}
              selectedTags={targetTags}
              onChange={setTargetTags}
            />
          </div>

          {/* Exclude Tags */}
          <div className="space-y-2">
            <Label>Ausschluss-Tags</Label>
            <p className="text-sm text-muted-foreground">
              Clients mit diesen Tags werden ausgeschlossen.
            </p>
            <CampaignTagPicker
              tags={tags || []}
              selectedTags={excludeTags}
              onChange={setExcludeTags}
            />
          </div>

          {/* Recipient Preview */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {recipientCount ?? '...'} Empfänger
              </span>
              {targetTags.length > 0 && (
                <Badge variant="secondary">
                  {targetTags.length} Tag{targetTags.length > 1 ? 's' : ''} ausgewählt
                </Badge>
              )}
              {excludeTags.length > 0 && (
                <Badge variant="outline">
                  {excludeTags.length} ausgeschlossen
                </Badge>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Zeitplanung</Label>
                <p className="text-sm text-muted-foreground">
                  Kampagne zu einem späteren Zeitpunkt senden
                </p>
              </div>
              <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
            </div>

            {isScheduled && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            {campaignId ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
