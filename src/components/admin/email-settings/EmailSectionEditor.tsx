import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';
import { EmailTemplateSectionInstance, SalutationType, SECTION_TYPE_LABELS } from './types';
import { EmailImageUploader } from './EmailImageUploader';

interface EmailSectionEditorProps {
  section: EmailTemplateSectionInstance;
  salutation: SalutationType;
  onUpdate: (updates: Partial<EmailTemplateSectionInstance>) => void;
  onClose: () => void;
}

export function EmailSectionEditor({ 
  section, 
  salutation,
  onUpdate, 
  onClose 
}: EmailSectionEditorProps) {
  const handleContentChange = (value: string) => {
    if (salutation === 'du') {
      onUpdate({ content_du: value });
    } else {
      onUpdate({ content_sie: value });
    }
  };

  const handleSettingsChange = (key: string, value: any) => {
    onUpdate({
      settings: { ...section.settings, [key]: value },
    });
  };

  const content = salutation === 'du' ? section.content_du : section.content_sie;

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          {SECTION_TYPE_LABELS[section.section_type]} bearbeiten
        </CardTitle>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content editing based on section type */}
        {(section.section_type === 'text' || section.section_type === 'footer' || section.section_type === 'custom') && (
          <div className="space-y-2">
            <Label className="text-xs">Inhalt ({salutation === 'du' ? 'Du-Form' : 'Sie-Form'})</Label>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              rows={4}
              placeholder="Text eingeben... Verwenden Sie {platzhalter} für dynamische Inhalte"
            />
          </div>
        )}

        {section.section_type === 'cta' && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Button-Text ({salutation === 'du' ? 'Du' : 'Sie'})</Label>
              <Input
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="z.B. Jetzt ansehen"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Button-Link (Platzhalter)</Label>
              <Input
                value={section.settings.buttonUrl || ''}
                onChange={(e) => handleSettingsChange('buttonUrl', e.target.value)}
                placeholder="{action_url}"
              />
            </div>
          </>
        )}

        {section.section_type === 'image' && (
          <div className="space-y-2">
            <Label className="text-xs">Bild</Label>
            <EmailImageUploader
              value={section.settings.imageUrl || ''}
              onChange={(url) => handleSettingsChange('imageUrl', url)}
            />
          </div>
        )}

        {section.section_type === 'spacer' && (
          <div className="space-y-2">
            <Label className="text-xs">Höhe: {parseInt(section.settings.height || '24') || 24}px</Label>
            <Slider
              value={[parseInt(section.settings.height || '24') || 24]}
              onValueChange={([value]) => handleSettingsChange('height', `${value}px`)}
              min={8}
              max={80}
              step={4}
            />
          </div>
        )}

        {section.section_type === 'divider' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Farbe</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={section.settings.color || '#e4e4e7'}
                  onChange={(e) => handleSettingsChange('color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={section.settings.color || '#e4e4e7'}
                  onChange={(e) => handleSettingsChange('color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Common settings */}
        <div className="space-y-2">
          <Label className="text-xs">Ausrichtung</Label>
          <Select
            value={section.settings.alignment || 'left'}
            onValueChange={(value) => handleSettingsChange('alignment', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Links</SelectItem>
              <SelectItem value="center">Zentriert</SelectItem>
              <SelectItem value="right">Rechts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {section.section_type !== 'header' && section.section_type !== 'divider' && section.section_type !== 'spacer' && (
          <div className="space-y-2">
            <Label className="text-xs">Hintergrundfarbe (optional)</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={section.settings.backgroundColor || '#ffffff'}
                onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                className="w-12 h-9 p-1 cursor-pointer"
              />
              <Input
                value={section.settings.backgroundColor || ''}
                onChange={(e) => handleSettingsChange('backgroundColor', e.target.value)}
                placeholder="transparent"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
