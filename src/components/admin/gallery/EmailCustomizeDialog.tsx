import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Users } from 'lucide-react';
import { Gallery, Client } from '@/types/database';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useSeoSettings } from '@/hooks/useSeoSettings';

interface EmailCustomizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gallery: Gallery;
  selectedClients: Client[];
  onSend: (subject: string, customMessage: string, salutationType: 'Du' | 'Sie') => Promise<void>;
  sending?: boolean;
}

export function EmailCustomizeDialog({
  open,
  onOpenChange,
  gallery,
  selectedClients,
  onSend,
  sending = false,
}: EmailCustomizeDialogProps) {
  const { templates } = useEmailTemplates();
  const { settings: seoSettings } = useSeoSettings();
  
  const [salutationType, setSalutationType] = useState<'Du' | 'Sie'>(gallery.salutation_type || 'Sie');
  const [subject, setSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Find the gallery_send template
  const gallerySendTemplate = templates?.find(t => t.template_key === 'gallery_send');

  useEffect(() => {
    if (gallerySendTemplate) {
      const templateSubject = salutationType === 'Du' 
        ? gallerySendTemplate.subject_du 
        : gallerySendTemplate.subject_sie;
      // Replace placeholders in subject
      const processedSubject = templateSubject
        .replace(/{gallery_name}/g, gallery.name)
        .replace(/{firma}/g, seoSettings?.site_name || 'ImmoOnPoint');
      setSubject(processedSubject);
    }
  }, [gallerySendTemplate, salutationType, gallery.name, seoSettings?.site_name]);

  const handleSend = async () => {
    await onSend(subject, customMessage, salutationType);
  };

  const firstClient = selectedClients[0];
  const previewName = firstClient 
    ? `${firstClient.anrede || ''} ${firstClient.nachname}`.trim() 
    : 'Mustermann';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            E-Mail anpassen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recipients */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Empfänger</Label>
            <div className="flex items-center gap-2 flex-wrap">
              <Users className="h-4 w-4 text-muted-foreground" />
              {selectedClients.slice(0, 3).map((client) => (
                <Badge key={client.id} variant="secondary">
                  {client.vorname} {client.nachname}
                </Badge>
              ))}
              {selectedClients.length > 3 && (
                <Badge variant="outline">
                  +{selectedClients.length - 3} weitere
                </Badge>
              )}
            </div>
          </div>

          {/* Salutation Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Anredeform</Label>
            <RadioGroup
              value={salutationType}
              onValueChange={(value) => setSalutationType(value as 'Du' | 'Sie')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Sie" id="email-sie" />
                <Label htmlFor="email-sie" className="font-normal cursor-pointer">
                  Sie (formell)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Du" id="email-du" />
                <Label htmlFor="email-du" className="font-normal cursor-pointer">
                  Du (informell)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="email-subject" className="text-sm font-medium">
              Betreff
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E-Mail-Betreff eingeben..."
            />
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message" className="text-sm font-medium">
              Zusätzlicher Text (optional)
            </Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Hier können Sie eine persönliche Nachricht eingeben, die am Anfang der E-Mail eingefügt wird..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Dieser Text wird nach der Begrüßung und vor dem Hauptinhalt eingefügt.
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vorschau</Label>
            <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
              <div className="text-sm">
                <span className="font-medium">Betreff:</span> {subject}
              </div>
              <hr className="border-border" />
              <div className="space-y-2 text-sm">
                <p className="font-medium">
                  {salutationType === 'Sie' 
                    ? `Guten Tag, ${previewName}!` 
                    : `Hallo ${firstClient?.vorname || 'Max'}!`}
                </p>
                {customMessage && (
                  <p className="text-primary bg-primary/5 p-2 rounded border-l-2 border-primary">
                    {customMessage}
                  </p>
                )}
                <p className="text-muted-foreground italic">
                  [Template-Inhalt für "{gallery.name}"...]
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim()}
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                E-Mail senden
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
