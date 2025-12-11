import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface DynamicContentSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
  onUploadImage: (file: File, path: string) => Promise<string | null>;
}

export function DynamicContentSection({ settings, onUpdate, onUploadImage }: DynamicContentSectionProps) {
  const handleHeroImageUpload = async (file: File) => {
    const url = await onUploadImage(file, 'hero');
    if (url) onUpdate({ hero_image_url: url });
    return url;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero-Bereich</CardTitle>
          <CardDescription>Texte und Bilder für den Hauptbereich auf Landing Pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero_headline">Headline</Label>
            <Input
              id="hero_headline"
              value={settings.hero_headline || ''}
              onChange={(e) => onUpdate({ hero_headline: e.target.value })}
              placeholder="Professionelle Immobilienfotografie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subheadline">Subheadline</Label>
            <Textarea
              id="hero_subheadline"
              value={settings.hero_subheadline || ''}
              onChange={(e) => onUpdate({ hero_subheadline: e.target.value })}
              placeholder="Hochwertige Fotos, die Ihre Immobilien zum Strahlen bringen"
              rows={2}
            />
          </div>

          <ImageUploader
            label="Hero-Bild"
            description="Hauptbild für Landing Pages (1920x1080px empfohlen)"
            currentUrl={settings.hero_image_url}
            onUpload={handleHeroImageUpload}
            onRemove={() => onUpdate({ hero_image_url: null })}
            aspectRatio="aspect-video"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call-to-Action Buttons</CardTitle>
          <CardDescription>Standard-Texte für Buttons auf der Website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cta_primary_text">Primärer Button</Label>
              <Input
                id="cta_primary_text"
                value={settings.cta_primary_text || ''}
                onChange={(e) => onUpdate({ cta_primary_text: e.target.value })}
                placeholder="Jetzt buchen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_secondary_text">Sekundärer Button</Label>
              <Input
                id="cta_secondary_text"
                value={settings.cta_secondary_text || ''}
                onChange={(e) => onUpdate({ cta_secondary_text: e.target.value })}
                placeholder="Mehr erfahren"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Footer</CardTitle>
          <CardDescription>Texte für den Fußbereich der Website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footer_tagline">Tagline / Slogan</Label>
            <Input
              id="footer_tagline"
              value={settings.footer_tagline || ''}
              onChange={(e) => onUpdate({ footer_tagline: e.target.value })}
              placeholder="Immobilien ins beste Licht gerückt"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
