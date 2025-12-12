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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  UserPlus, 
  Calendar, 
  Package, 
  AlertCircle, 
  Zap 
} from 'lucide-react';
import { 
  EmailSequence, 
  useCreateSequence, 
  useUpdateSequence 
} from '@/hooks/useEmailSequences';

const TRIGGER_EVENTS = [
  { value: 'client_created', label: 'Neuer Kunde', icon: UserPlus, description: 'Wird ausgelöst wenn ein neuer Kunde angelegt wird' },
  { value: 'booking_completed', label: 'Buchung abgeschlossen', icon: Calendar, description: 'Wird ausgelöst wenn eine Buchung bestätigt wird' },
  { value: 'gallery_delivered', label: 'Galerie ausgeliefert', icon: Package, description: 'Wird ausgelöst wenn eine Galerie ausgeliefert wird' },
  { value: 'inactivity_30d', label: '30 Tage inaktiv', icon: AlertCircle, description: 'Wird täglich für Kunden ohne Buchung seit 30 Tagen geprüft' },
  { value: 'inactivity_90d', label: '90 Tage inaktiv', icon: AlertCircle, description: 'Wird täglich für Kunden ohne Buchung seit 90 Tagen geprüft' },
  { value: 'manual', label: 'Manuell', icon: Zap, description: 'Wird manuell vom Admin gestartet' },
];

const DELAY_PRESETS = [
  { value: 0, label: 'Sofort' },
  { value: 30, label: '30 Minuten' },
  { value: 60, label: '1 Stunde' },
  { value: 180, label: '3 Stunden' },
  { value: 1440, label: '1 Tag' },
  { value: 2880, label: '2 Tage' },
  { value: 4320, label: '3 Tage' },
  { value: 10080, label: '1 Woche' },
];

interface SequenceEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequence: EmailSequence | null;
}

export function SequenceEditor({ open, onOpenChange, sequence }: SequenceEditorProps) {
  const createSequence = useCreateSequence();
  const updateSequence = useUpdateSequence();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('client_created');
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [isActive, setIsActive] = useState(true);
  
  const isEditing = !!sequence;

  useEffect(() => {
    if (sequence) {
      setName(sequence.name);
      setDescription(sequence.description || '');
      setTriggerEvent(sequence.trigger_event);
      setDelayMinutes(sequence.delay_after_trigger_minutes);
      setIsActive(sequence.is_active);
    } else {
      setName('');
      setDescription('');
      setTriggerEvent('client_created');
      setDelayMinutes(0);
      setIsActive(true);
    }
  }, [sequence, open]);

  const handleSubmit = () => {
    const data = {
      name,
      description: description || null,
      trigger_event: triggerEvent,
      trigger_conditions: {},
      delay_after_trigger_minutes: delayMinutes,
      is_active: isActive,
    };
    
    if (isEditing) {
      updateSequence.mutate({ id: sequence.id, ...data }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createSequence.mutate(data, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const selectedTrigger = TRIGGER_EVENTS.find(t => t.value === triggerEvent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Sequenz bearbeiten' : 'Neue Sequenz erstellen'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="z.B. Willkommens-Serie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung der Sequenz..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Trigger-Ereignis</Label>
            <Select value={triggerEvent} onValueChange={setTriggerEvent}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_EVENTS.map(event => {
                  const Icon = event.icon;
                  return (
                    <SelectItem key={event.value} value={event.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{event.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedTrigger && (
              <p className="text-xs text-muted-foreground">
                {selectedTrigger.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Verzögerung nach Trigger</Label>
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
              Wartezeit zwischen Trigger-Ereignis und erster E-Mail
            </p>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label>Aktiv</Label>
              <p className="text-xs text-muted-foreground">
                Inaktive Sequenzen werden nicht ausgelöst
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!name || createSequence.isPending || updateSequence.isPending}
          >
            {isEditing ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
