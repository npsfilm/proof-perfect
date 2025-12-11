import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from './ImageUploader';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface DynamicContentSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
  onUploadImage: (file: File, path: string) => Promise<string | null>;
}

export function DynamicContentSection({ settings, onUpdate, onUploadImage }: DynamicContentSectionProps) {
  const [localHeadline, setLocalHeadline] = useState(settings.hero_headline || '');
  const [localSubheadline, setLocalSubheadline] = useState(settings.hero_subheadline || '');
  const [localCtaPrimary, setLocalCtaPrimary] = useState(settings.cta_primary_text || '');
  const [localCtaSecondary, setLocalCtaSecondary] = useState(settings.cta_secondary_text || '');
  const [localFooterTagline, setLocalFooterTagline] = useState(settings.footer_tagline || '');

  const debouncedHeadline = useDebounce(localHeadline, 500);
  const debouncedSubheadline = useDebounce(localSubheadline, 500);
  const debouncedCtaPrimary = useDebounce(localCtaPrimary, 500);
  const debouncedCtaSecondary = useDebounce(localCtaSecondary, 500);
  const debouncedFooterTagline = useDebounce(localFooterTagline, 500);

  // Sync local state when settings change from outside
  useEffect(() => { setLocalHeadline(settings.hero_headline || ''); }, [settings.hero_headline]);
  useEffect(() => { setLocalSubheadline(settings.hero_subheadline || ''); }, [settings.hero_subheadline]);
  useEffect(() => { setLocalCtaPrimary(settings.cta_primary_text || ''); }, [settings.cta_primary_text]);
  useEffect(() => { setLocalCtaSecondary(settings.cta_secondary_text || ''); }, [settings.cta_secondary_text]);
  useEffect(() => { setLocalFooterTagline(settings.footer_tagline || ''); }, [settings.footer_tagline]);

  // Save debounced values
  useEffect(() => {
    if (debouncedHeadline !== (settings.hero_headline || '')) {
      onUpdate({ hero_headline: debouncedHeadline });
    }
  }, [debouncedHeadline]);

  useEffect(() => {
    if (debouncedSubheadline !== (settings.hero_subheadline || '')) {
      onUpdate({ hero_subheadline: debouncedSubheadline });
    }
  }, [debouncedSubheadline]);

  useEffect(() => {
    if (debouncedCtaPrimary !== (settings.cta_primary_text || '')) {
      onUpdate({ cta_primary_text: debouncedCtaPrimary });
    }
  }, [debouncedCtaPrimary]);

  useEffect(() => {
    if (debouncedCtaSecondary !== (settings.cta_secondary_text || '')) {
      onUpdate({ cta_secondary_text: debouncedCtaSecondary });
    }
  }, [debouncedCtaSecondary]);

  useEffect(() => {
    if (debouncedFooterTagline !== (settings.footer_tagline || '')) {
      onUpdate({ footer_tagline: debouncedFooterTagline });
    }
  }, [debouncedFooterTagline]);

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
              value={localHeadline}
              onChange={(e) => setLocalHeadline(e.target.value)}
              placeholder="Professionelle Immobilienfotografie"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero_subheadline">Subheadline</Label>
            <Textarea
              id="hero_subheadline"
              value={localSubheadline}
              onChange={(e) => setLocalSubheadline(e.target.value)}
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
                value={localCtaPrimary}
                onChange={(e) => setLocalCtaPrimary(e.target.value)}
                placeholder="Jetzt buchen"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_secondary_text">Sekundärer Button</Label>
              <Input
                id="cta_secondary_text"
                value={localCtaSecondary}
                onChange={(e) => setLocalCtaSecondary(e.target.value)}
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
              value={localFooterTagline}
              onChange={(e) => setLocalFooterTagline(e.target.value)}
              placeholder="Immobilien ins beste Licht gerückt"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
