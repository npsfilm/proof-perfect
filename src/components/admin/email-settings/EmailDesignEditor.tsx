import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, Palette, Type, Layout, MousePointer, FileText } from 'lucide-react';
import { useEmailDesignSettings } from '@/hooks/useEmailDesignSettings';
import { EmailDesignSettings, FONT_OPTIONS } from './types';
import { EmailPreview } from './EmailPreview';

export function EmailDesignEditor() {
  const { settings, isLoading, updateSettings } = useEmailDesignSettings();
  const [localSettings, setLocalSettings] = useState<Partial<EmailDesignSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof EmailDesignSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings.mutate(localSettings, {
      onSuccess: () => setHasChanges(false),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Panel */}
      <div className="space-y-6">
        {/* Farben */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Farben
            </CardTitle>
            <CardDescription>Farbschema für alle E-Mails</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Primärfarbe</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.primary_color || '#233c63'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.primary_color || '#233c63'}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sekundärfarbe</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.secondary_color || '#4f7942'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.secondary_color || '#4f7942'}
                  onChange={(e) => handleChange('secondary_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Hintergrund</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.background_color || '#f4f4f5'}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.background_color || '#f4f4f5'}
                  onChange={(e) => handleChange('background_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Container</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.container_bg_color || '#ffffff'}
                  onChange={(e) => handleChange('container_bg_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.container_bg_color || '#ffffff'}
                  onChange={(e) => handleChange('container_bg_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Text</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.text_color || '#18181b'}
                  onChange={(e) => handleChange('text_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.text_color || '#18181b'}
                  onChange={(e) => handleChange('text_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Gedämpfter Text</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={localSettings.text_muted_color || '#71717a'}
                  onChange={(e) => handleChange('text_muted_color', e.target.value)}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={localSettings.text_muted_color || '#71717a'}
                  onChange={(e) => handleChange('text_muted_color', e.target.value)}
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Branding
            </CardTitle>
            <CardDescription>Logo und Firmenname</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Firmenname</Label>
              <Input
                value={localSettings.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Logo-URL</Label>
              <Input
                value={localSettings.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Logo-Breite: {localSettings.logo_width || 150}px</Label>
              <Slider
                value={[localSettings.logo_width || 150]}
                onValueChange={([value]) => handleChange('logo_width', value)}
                min={50}
                max={300}
                step={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Typografie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Type className="h-4 w-4" />
              Typografie
            </CardTitle>
            <CardDescription>Schriftarten und -größen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Schriftart</Label>
              <Select
                value={localSettings.font_family || FONT_OPTIONS[0].value}
                onValueChange={(value) => handleChange('font_family', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Überschrift: {localSettings.heading_font_size || 24}px</Label>
                <Slider
                  value={[localSettings.heading_font_size || 24]}
                  onValueChange={([value]) => handleChange('heading_font_size', value)}
                  min={18}
                  max={36}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Fließtext: {localSettings.body_font_size || 16}px</Label>
                <Slider
                  value={[localSettings.body_font_size || 16]}
                  onValueChange={([value]) => handleChange('body_font_size', value)}
                  min={12}
                  max={20}
                  step={1}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Buttons
            </CardTitle>
            <CardDescription>CTA-Button-Styling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Button-Farbe</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localSettings.button_bg_color || '#233c63'}
                    onChange={(e) => handleChange('button_bg_color', e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={localSettings.button_bg_color || '#233c63'}
                    onChange={(e) => handleChange('button_bg_color', e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Button-Textfarbe</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={localSettings.button_text_color || '#ffffff'}
                    onChange={(e) => handleChange('button_text_color', e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={localSettings.button_text_color || '#ffffff'}
                    onChange={(e) => handleChange('button_text_color', e.target.value)}
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Eckenrundung: {localSettings.button_border_radius || 8}px</Label>
              <Slider
                value={[localSettings.button_border_radius || 8]}
                onValueChange={([value]) => handleChange('button_border_radius', value)}
                min={0}
                max={50}
                step={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Padding X: {localSettings.button_padding_x || 32}px</Label>
                <Slider
                  value={[localSettings.button_padding_x || 32]}
                  onValueChange={([value]) => handleChange('button_padding_x', value)}
                  min={16}
                  max={64}
                  step={4}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Padding Y: {localSettings.button_padding_y || 16}px</Label>
                <Slider
                  value={[localSettings.button_padding_y || 16]}
                  onValueChange={([value]) => handleChange('button_padding_y', value)}
                  min={8}
                  max={32}
                  step={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Layout */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Layout
            </CardTitle>
            <CardDescription>Container und Abstände</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Max. Breite: {localSettings.container_max_width || 600}px</Label>
              <Slider
                value={[localSettings.container_max_width || 600]}
                onValueChange={([value]) => handleChange('container_max_width', value)}
                min={400}
                max={800}
                step={20}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Container-Rundung: {localSettings.container_border_radius || 12}px</Label>
                <Slider
                  value={[localSettings.container_border_radius || 12]}
                  onValueChange={([value]) => handleChange('container_border_radius', value)}
                  min={0}
                  max={24}
                  step={2}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Innenabstand: {localSettings.content_padding || 40}px</Label>
                <Slider
                  value={[localSettings.content_padding || 40]}
                  onValueChange={([value]) => handleChange('content_padding', value)}
                  min={16}
                  max={64}
                  step={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Footer</CardTitle>
            <CardDescription>Fußzeile und Social Links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs">Footer-Text</Label>
              <Input
                value={localSettings.footer_text || ''}
                onChange={(e) => handleChange('footer_text', e.target.value)}
                placeholder="© {year} Firmenname..."
              />
              <p className="text-xs text-muted-foreground">{'{year}'} wird durch das aktuelle Jahr ersetzt</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="text-xs">Social-Media-Links anzeigen</Label>
              <Switch
                checked={localSettings.show_social_links || false}
                onCheckedChange={(checked) => handleChange('show_social_links', checked)}
              />
            </div>
            {localSettings.show_social_links && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Facebook</Label>
                  <Input
                    value={localSettings.social_facebook || ''}
                    onChange={(e) => handleChange('social_facebook', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Instagram</Label>
                  <Input
                    value={localSettings.social_instagram || ''}
                    onChange={(e) => handleChange('social_instagram', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">LinkedIn</Label>
                  <Input
                    value={localSettings.social_linkedin || ''}
                    onChange={(e) => handleChange('social_linkedin', e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="sticky bottom-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            className="w-full"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Änderungen speichern
          </Button>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="lg:sticky lg:top-4 h-fit">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live-Vorschau</CardTitle>
            <CardDescription>So sehen Ihre E-Mails aus</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <EmailPreview settings={localSettings as EmailDesignSettings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
