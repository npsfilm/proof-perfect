import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from './ImageUploader';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface SocialMediaSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
  onUploadImage: (file: File, path: string) => Promise<string | null>;
}

export function SocialMediaSection({ settings, onUpdate, onUploadImage }: SocialMediaSectionProps) {
  const handleOgImageUpload = async (file: File) => {
    const url = await onUploadImage(file, 'og-image');
    if (url) onUpdate({ og_image_url: url });
    return url;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Open Graph</CardTitle>
          <CardDescription>Einstellungen für Facebook, LinkedIn und andere soziale Netzwerke</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader
            label="OG Image"
            description="Bild für Social Media Shares (1200x630px empfohlen)"
            currentUrl={settings.og_image_url}
            onUpload={handleOgImageUpload}
            onRemove={() => onUpdate({ og_image_url: null })}
            aspectRatio="aspect-[1200/630]"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="og_type">OG Type</Label>
              <Select
                value={settings.og_type || 'website'}
                onValueChange={(value) => onUpdate({ og_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="business.business">Business</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_locale">Sprache</Label>
              <Select
                value={settings.og_locale || 'de_DE'}
                onValueChange={(value) => onUpdate({ og_locale: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de_DE">Deutsch (Deutschland)</SelectItem>
                  <SelectItem value="de_AT">Deutsch (Österreich)</SelectItem>
                  <SelectItem value="de_CH">Deutsch (Schweiz)</SelectItem>
                  <SelectItem value="en_US">English (US)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Twitter Card</CardTitle>
          <CardDescription>Einstellungen für Twitter/X Shares</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="twitter_card_type">Card Type</Label>
              <Select
                value={settings.twitter_card_type || 'summary_large_image'}
                onValueChange={(value) => onUpdate({ twitter_card_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter_handle">Twitter Handle</Label>
              <Input
                id="twitter_handle"
                value={settings.twitter_handle || ''}
                onChange={(e) => onUpdate({ twitter_handle: e.target.value })}
                placeholder="@immoonpoint"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media Vorschau</CardTitle>
          <CardDescription>So erscheint Ihre Seite beim Teilen auf Facebook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md border rounded-lg overflow-hidden bg-card">
            {settings.og_image_url ? (
              <img
                src={settings.og_image_url}
                alt="OG Preview"
                className="w-full aspect-[1200/630] object-cover"
              />
            ) : (
              <div className="w-full aspect-[1200/630] bg-muted flex items-center justify-center text-muted-foreground">
                Kein Bild
              </div>
            )}
            <div className="p-3 space-y-1">
              <div className="text-xs text-muted-foreground uppercase">
                app.immoonpoint.de
              </div>
              <div className="font-semibold">
                {settings.site_name || 'ImmoOnPoint'}
              </div>
              <div className="text-sm text-muted-foreground line-clamp-2">
                {settings.meta_description || 'Keine Beschreibung'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
