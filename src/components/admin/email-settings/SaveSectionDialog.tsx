import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';
import { EmailTemplateSectionInstance } from './types';
import { useEmailSections } from '@/hooks/useEmailSections';

interface SaveSectionDialogProps {
  section: EmailTemplateSectionInstance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveSectionDialog({ section, open, onOpenChange }: SaveSectionDialogProps) {
  const [name, setName] = useState('');
  const { createSection } = useEmailSections();

  const handleSave = () => {
    if (!name.trim()) return;

    createSection.mutate({
      name: name.trim(),
      section_type: section.section_type,
      content_du: section.content_du,
      content_sie: section.content_sie,
      settings: section.settings,
      is_preset: false,
      sort_order: 0,
    }, {
      onSuccess: () => {
        setName('');
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Section speichern</DialogTitle>
          <DialogDescription>
            Speichern Sie diese Section als Vorlage zur Wiederverwendung in anderen E-Mails.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Name der Section</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Meine Begrüßung"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || createSection.isPending}
          >
            {createSection.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
