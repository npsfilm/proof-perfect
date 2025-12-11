import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X, Info } from 'lucide-react';
import { EmailTemplate, SalutationType } from './types';
import { EmailPreview } from './EmailPreview';
import { useEmailDesignSettings } from '@/hooks/useEmailDesignSettings';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailTemplateEditorProps {
  template: EmailTemplate;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
  isPending?: boolean;
  isNew?: boolean;
}

export function EmailTemplateEditor({ 
  template, 
  onSave, 
  onCancel, 
  isPending,
  isNew 
}: EmailTemplateEditorProps) {
  const [localTemplate, setLocalTemplate] = useState(template);
  const [previewSalutation, setPreviewSalutation] = useState<SalutationType>('sie');
  const { settings: designSettings } = useEmailDesignSettings();

  const handleChange = (key: keyof EmailTemplate, value: any) => {
    setLocalTemplate(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localTemplate);
  };

  const placeholders = localTemplate.available_placeholders || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor Panel */}
      <div className="space-y-4">
        {isNew && (
          <>
            <div className="space-y-2">
              <Label>Template-Name *</Label>
              <Input
                value={localTemplate.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="z.B. Willkommens-Newsletter"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input
                value={localTemplate.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Kurze Beschreibung des Templates"
              />
            </div>
            <Separator />
          </>
        )}

        <Tabs defaultValue="sie" onValueChange={(v) => setPreviewSalutation(v as SalutationType)}>
          <TabsList className="w-full">
            <TabsTrigger value="sie" className="flex-1">Sie-Form (Formal)</TabsTrigger>
            <TabsTrigger value="du" className="flex-1">Du-Form (Informal)</TabsTrigger>
          </TabsList>

          <TabsContent value="sie" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Betreff *</Label>
              <Input
                value={localTemplate.subject_sie}
                onChange={(e) => handleChange('subject_sie', e.target.value)}
                placeholder="E-Mail-Betreff"
              />
            </div>
            <div className="space-y-2">
              <Label>Preheader</Label>
              <Input
                value={localTemplate.preheader_sie || ''}
                onChange={(e) => handleChange('preheader_sie', e.target.value)}
                placeholder="Vorschau-Text im Posteingang"
              />
            </div>
            <div className="space-y-2">
              <Label>Überschrift</Label>
              <Input
                value={localTemplate.heading_sie || ''}
                onChange={(e) => handleChange('heading_sie', e.target.value)}
                placeholder="Hauptüberschrift in der E-Mail"
              />
            </div>
            <div className="space-y-2">
              <Label>Inhalt *</Label>
              <Textarea
                value={localTemplate.body_sie}
                onChange={(e) => handleChange('body_sie', e.target.value)}
                placeholder="E-Mail-Text..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Button-Text</Label>
              <Input
                value={localTemplate.cta_text_sie || ''}
                onChange={(e) => handleChange('cta_text_sie', e.target.value)}
                placeholder="z.B. Jetzt ansehen"
              />
            </div>
          </TabsContent>

          <TabsContent value="du" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Betreff *</Label>
              <Input
                value={localTemplate.subject_du}
                onChange={(e) => handleChange('subject_du', e.target.value)}
                placeholder="E-Mail-Betreff"
              />
            </div>
            <div className="space-y-2">
              <Label>Preheader</Label>
              <Input
                value={localTemplate.preheader_du || ''}
                onChange={(e) => handleChange('preheader_du', e.target.value)}
                placeholder="Vorschau-Text im Posteingang"
              />
            </div>
            <div className="space-y-2">
              <Label>Überschrift</Label>
              <Input
                value={localTemplate.heading_du || ''}
                onChange={(e) => handleChange('heading_du', e.target.value)}
                placeholder="Hauptüberschrift in der E-Mail"
              />
            </div>
            <div className="space-y-2">
              <Label>Inhalt *</Label>
              <Textarea
                value={localTemplate.body_du}
                onChange={(e) => handleChange('body_du', e.target.value)}
                placeholder="E-Mail-Text..."
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Button-Text</Label>
              <Input
                value={localTemplate.cta_text_du || ''}
                onChange={(e) => handleChange('cta_text_du', e.target.value)}
                placeholder="z.B. Jetzt ansehen"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Placeholders Reference */}
        {placeholders.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                Verfügbare Platzhalter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  {placeholders.map((p) => (
                    <Tooltip key={p.key}>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="cursor-pointer font-mono text-xs"
                          onClick={() => navigator.clipboard.writeText(`{${p.key}}`)}
                        >
                          {`{${p.key}}`}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{p.label}</p>
                        <p className="text-xs text-muted-foreground">Beispiel: {p.example}</p>
                        <p className="text-xs mt-1">Klicken zum Kopieren</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isPending} className="flex-1">
            {isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Speichern
          </Button>
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Vorschau ({previewSalutation === 'du' ? 'Du' : 'Sie'})</h4>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {designSettings && (
              <EmailPreview
                settings={designSettings}
                template={localTemplate}
                salutation={previewSalutation}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
