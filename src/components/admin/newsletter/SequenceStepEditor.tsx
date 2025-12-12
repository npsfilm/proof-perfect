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
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { 
  EmailSequenceStep, 
  useAddSequenceStep, 
  useUpdateSequenceStep 
} from '@/hooks/useEmailSequences';

const DELAY_PRESETS = [
  { value: 0, label: 'Sofort' },
  { value: 30, label: '30 Minuten' },
  { value: 60, label: '1 Stunde' },
  { value: 180, label: '3 Stunden' },
  { value: 360, label: '6 Stunden' },
  { value: 720, label: '12 Stunden' },
  { value: 1440, label: '1 Tag' },
  { value: 2880, label: '2 Tage' },
  { value: 4320, label: '3 Tage' },
  { value: 7200, label: '5 Tage' },
  { value: 10080, label: '1 Woche' },
  { value: 20160, label: '2 Wochen' },
  { value: 43200, label: '1 Monat' },
];

interface SequenceStepEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceId: string;
  step: EmailSequenceStep | null;
  nextOrder: number;
}

export function SequenceStepEditor({ 
  open, 
  onOpenChange, 
  sequenceId, 
  step, 
  nextOrder 
}: SequenceStepEditorProps) {
  const { templates } = useEmailTemplates();
  const addStep = useAddSequenceStep();
  const updateStep = useUpdateSequenceStep();
  
  const [templateId, setTemplateId] = useState('');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [subjectOverride, setSubjectOverride] = useState('');
  
  const isEditing = !!step;

  useEffect(() => {
    if (step) {
      setTemplateId(step.template_id);
      setDelayMinutes(step.delay_from_previous_minutes);
      setSubjectOverride(step.subject_override || '');
    } else {
      setTemplateId('');
      setDelayMinutes(nextOrder === 1 ? 0 : 1440); // First step: immediate, others: 1 day
      setSubjectOverride('');
    }
  }, [step, open, nextOrder]);

  const handleSubmit = () => {
    const data = {
      sequence_id: sequenceId,
      template_id: templateId,
      step_order: isEditing ? step.step_order : nextOrder,
      delay_from_previous_minutes: delayMinutes,
      subject_override: subjectOverride || null,
      skip_conditions: {},
    };
    
    if (isEditing) {
      updateStep.mutate({ id: step.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      addStep.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const selectedTemplate = templates?.find(t => t.id === templateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Schritt bearbeiten' : 'Neuen Schritt hinzufügen'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>E-Mail-Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Template auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.filter(t => t.is_active).map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTemplate && (
              <p className="text-xs text-muted-foreground">
                Betreff: {selectedTemplate.subject_du} / {selectedTemplate.subject_sie}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Verzögerung</Label>
            <Select 
              value={delayMinutes.toString()} 
              onValueChange={v => setDelayMinutes(parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DELAY_PRESETS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value.toString()}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {nextOrder === 1 || (isEditing && step?.step_order === 1)
                ? 'Wartezeit nach dem Trigger-Ereignis'
                : 'Wartezeit nach dem vorherigen Schritt'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Betreff überschreiben (optional)</Label>
            <Input
              id="subject"
              value={subjectOverride}
              onChange={e => setSubjectOverride(e.target.value)}
              placeholder="Leer lassen für Template-Betreff"
            />
            <p className="text-xs text-muted-foreground">
              Überschreibt den Betreff aus dem Template
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!templateId || addStep.isPending || updateStep.isPending}
          >
            {isEditing ? 'Speichern' : 'Hinzufügen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
