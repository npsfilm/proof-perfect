import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { CalendarIcon, Trash2, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CalendarEvent, CreateEventData } from '@/hooks/useEvents';

const EVENT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  defaultDate?: Date;
  onSave: (data: CreateEventData) => void;
  onUpdate: (id: string, data: Partial<CreateEventData>) => void;
  onDelete: (id: string) => void;
  isSaving?: boolean;
}

interface FormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  location: string;
  color: string;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  defaultDate,
  onSave,
  onUpdate,
  onDelete,
  isSaving,
}: EventModalProps) {
  const isEditing = !!event;

  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      start_time: '09:00',
      end_date: format(new Date(), 'yyyy-MM-dd'),
      end_time: '10:00',
      location: '',
      color: EVENT_COLORS[0],
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (event) {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      reset({
        title: event.title,
        description: event.description || '',
        start_date: format(start, 'yyyy-MM-dd'),
        start_time: format(start, 'HH:mm'),
        end_date: format(end, 'yyyy-MM-dd'),
        end_time: format(end, 'HH:mm'),
        location: event.location || '',
        color: event.color,
      });
    } else if (defaultDate) {
      reset({
        title: '',
        description: '',
        start_date: format(defaultDate, 'yyyy-MM-dd'),
        start_time: '09:00',
        end_date: format(defaultDate, 'yyyy-MM-dd'),
        end_time: '10:00',
        location: '',
        color: EVENT_COLORS[0],
      });
    }
  }, [event, defaultDate, reset]);

  const onSubmit = (data: FormData) => {
    const startTime = new Date(`${data.start_date}T${data.start_time}`);
    const endTime = new Date(`${data.end_date}T${data.end_time}`);

    const eventData: CreateEventData = {
      title: data.title,
      description: data.description || undefined,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: data.location || undefined,
      color: data.color,
    };

    if (isEditing && event) {
      onUpdate(event.id, eventData);
    } else {
      onSave(eventData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {isEditing ? 'Termin bearbeiten' : 'Neuer Termin'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              placeholder="Terminname eingeben"
              {...register('title', { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start</Label>
              <div className="flex gap-2">
                <Input type="date" {...register('start_date')} className="flex-1" />
                <Input type="time" {...register('start_time')} className="w-[100px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ende</Label>
              <div className="flex gap-2">
                <Input type="date" {...register('end_date')} className="flex-1" />
                <Input type="time" {...register('end_time')} className="w-[100px]" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ort</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="Ort hinzufügen"
                className="pl-9"
                {...register('location')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              placeholder="Beschreibung hinzufügen"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label>Farbe</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {isEditing && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive" size="sm" className="w-full sm:w-auto">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Termin löschen?</AlertDialogTitle>
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
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-initial">
                {isSaving ? 'Speichern...' : isEditing ? 'Aktualisieren' : 'Erstellen'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
