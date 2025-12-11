import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploader } from './ImageUploader';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface BrandingSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
  onUploadImage: (file: File, path: string) => Promise<string | null>;
}

export function BrandingSection({ settings, onUpdate, onUploadImage }: BrandingSectionProps) {
  const [localSiteName, setLocalSiteName] = useState(settings.site_name || '');
  const [localSupportEmail, setLocalSupportEmail] = useState(settings.support_email || '');

  const debouncedSiteName = useDebounce(localSiteName, 500);
  const debouncedSupportEmail = useDebounce(localSupportEmail, 500);

  // Sync local state when settings change from outside
  useEffect(() => {
    setLocalSiteName(settings.site_name || '');
  }, [settings.site_name]);

  useEffect(() => {
    setLocalSupportEmail(settings.support_email || '');
  }, [settings.support_email]);

  // Save debounced values
  useEffect(() => {
    if (debouncedSiteName !== (settings.site_name || '')) {
      onUpdate({ site_name: debouncedSiteName });
    }
  }, [debouncedSiteName]);

  useEffect(() => {
    if (debouncedSupportEmail !== (settings.support_email || '')) {
      onUpdate({ support_email: debouncedSupportEmail });
    }
  }, [debouncedSupportEmail]);

  const handleLogoUpload = async (file: File) => {
    const url = await onUploadImage(file, 'logo');
    if (url) onUpdate({ logo_url: url });
    return url;
  };

  const handleLogoDarkUpload = async (file: File) => {
    const url = await onUploadImage(file, 'logo-dark');
    if (url) onUpdate({ logo_dark_url: url });
    return url;
  };

  const handleLogoIconUpload = async (file: File) => {
    const url = await onUploadImage(file, 'logo-icon');
    if (url) onUpdate({ logo_icon_url: url });
    return url;
  };

  const handleFaviconUpload = async (file: File) => {
    const url = await onUploadImage(file, 'favicon');
    if (url) onUpdate({ favicon_url: url });
    return url;
  };

  const handleWatermarkUpload = async (file: File) => {
    const url = await onUploadImage(file, 'watermark');
    if (url) onUpdate({ watermark_url: url });
    return url;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Markenname</CardTitle>
          <CardDescription>Der Name Ihrer Marke, der überall angezeigt wird</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Website-Name</Label>
              <Input
                id="site_name"
                value={localSiteName}
                onChange={(e) => setLocalSiteName(e.target.value)}
                placeholder="ImmoOnPoint"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Support E-Mail</Label>
              <Input
                id="support_email"
                type="email"
                value={localSupportEmail}
                onChange={(e) => setLocalSupportEmail(e.target.value)}
                placeholder="support@immoonpoint.de"
              />
              <p className="text-xs text-muted-foreground">
                Diese E-Mail wird für Hilfe-Links und Kontaktanfragen verwendet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Ihr Hauptlogo in verschiedenen Varianten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <ImageUploader
              label="Hauptlogo (Hell)"
              description="Für helle Hintergründe, empfohlen: PNG mit Transparenz"
              currentUrl={settings.logo_url}
              onUpload={handleLogoUpload}
              onRemove={() => onUpdate({ logo_url: null })}
              aspectRatio="aspect-[3/1]"
            />
            
            <ImageUploader
              label="Logo (Dunkel)"
              description="Für dunkle Hintergründe / Dark Mode"
              currentUrl={settings.logo_dark_url}
              onUpload={handleLogoDarkUpload}
              onRemove={() => onUpdate({ logo_dark_url: null })}
              aspectRatio="aspect-[3/1]"
            />
            
            <ImageUploader
              label="Logo-Icon"
              description="Quadratisches Icon, z.B. für App-Icons"
              currentUrl={settings.logo_icon_url}
              onUpload={handleLogoIconUpload}
              onRemove={() => onUpdate({ logo_icon_url: null })}
              aspectRatio="aspect-square"
            />
            
            <ImageUploader
              label="Favicon"
              description="Kleines Icon für Browser-Tab (ICO, PNG, SVG)"
              currentUrl={settings.favicon_url}
              onUpload={handleFaviconUpload}
              onRemove={() => onUpdate({ favicon_url: null })}
              accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
              aspectRatio="aspect-square"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wasserzeichen</CardTitle>
          <CardDescription>Standard-Wasserzeichen für Kundenvorschauen</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader
            label="Wasserzeichen"
            description="PNG mit Transparenz empfohlen"
            currentUrl={settings.watermark_url}
            onUpload={handleWatermarkUpload}
            onRemove={() => onUpdate({ watermark_url: null })}
            aspectRatio="aspect-[3/1]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
