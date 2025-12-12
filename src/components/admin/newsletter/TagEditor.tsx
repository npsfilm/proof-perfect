import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCreateTag, useUpdateTag, ClientTag } from '@/hooks/useClientTags';
import { AutoConditionEditor } from './AutoConditionEditor';

const TAG_COLORS = [
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f97316', // orange
  '#eab308', // yellow
  '#ef4444', // red
  '#6366f1', // indigo
  '#ec4899', // pink
];

const tagSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  slug: z.string().min(1, 'Slug ist erforderlich').regex(/^[a-z0-9-]+$/, 'Nur Kleinbuchstaben, Zahlen und Bindestriche'),
  description: z.string().optional(),
  color: z.string(),
  tag_type: z.enum(['manual', 'auto']),
  is_active: z.boolean(),
  auto_conditions: z.object({
    field: z.string().optional(),
    operator: z.string().optional(),
    value: z.number().optional(),
  }).optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

interface TagEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: ClientTag | null;
}

export function TagEditor({ open, onOpenChange, tag }: TagEditorProps) {
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const isEditing = !!tag;

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: TAG_COLORS[0],
      tag_type: 'manual',
      is_active: true,
      auto_conditions: {},
    },
  });

  const tagType = form.watch('tag_type');

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        color: tag.color,
        tag_type: tag.tag_type,
        is_active: tag.is_active,
        auto_conditions: tag.auto_conditions || {},
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        color: TAG_COLORS[0],
        tag_type: 'manual',
        is_active: true,
        auto_conditions: {},
      });
    }
  }, [tag, form]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    if (!isEditing) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setValue('slug', slug);
    }
  };

  const onSubmit = async (data: TagFormData) => {
    try {
      if (isEditing && tag) {
        await updateTag.mutateAsync({ id: tag.id, ...data });
      } else {
        await createTag.mutateAsync({
          name: data.name,
          slug: data.slug,
          description: data.description,
          color: data.color,
          tag_type: data.tag_type,
          is_active: data.is_active,
          auto_conditions: data.auto_conditions as { field?: string; operator?: string; value?: number },
        });
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Tag bearbeiten' : 'Neuer Tag'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Tag-Einstellungen'
              : 'Erstellen Sie einen neuen Tag für die Kundensegmentierung'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                      placeholder="z.B. VIP-Kunde"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. vip-kunde" />
                  </FormControl>
                  <FormDescription>
                    Eindeutiger Bezeichner (wird automatisch generiert)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Kurze Beschreibung des Tags" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farbe</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => field.onChange(color)}
                          className={`w-8 h-8 rounded-full transition-all ${
                            field.value === color
                              ? 'ring-2 ring-offset-2 ring-primary scale-110'
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag-Typ</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual">Manuell</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto">Automatisch</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    {field.value === 'manual'
                      ? 'Tag wird manuell Kunden zugewiesen'
                      : 'Tag wird automatisch basierend auf Bedingungen zugewiesen'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {tagType === 'auto' && (
              <FormField
                control={form.control}
                name="auto_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Automatische Bedingung</FormLabel>
                    <FormControl>
                      <AutoConditionEditor
                        value={field.value || {}}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Aktiv</FormLabel>
                    <FormDescription>
                      Inaktive Tags werden nicht zugewiesen
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={createTag.isPending || updateTag.isPending}>
                {isEditing ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
