import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface MetaTagsSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function MetaTagsSection({ settings, onUpdate }: MetaTagsSectionProps) {
  const titleLength = (settings.meta_description || '').length;
  const descriptionLength = (settings.meta_description || '').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meta-Tags</CardTitle>
          <CardDescription>SEO-relevante Einstellungen für Suchmaschinen</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title_suffix">Title-Suffix</Label>
            <Input
              id="meta_title_suffix"
              value={settings.meta_title_suffix || ''}
              onChange={(e) => onUpdate({ meta_title_suffix: e.target.value })}
              placeholder=" | ImmoOnPoint"
            />
            <p className="text-xs text-muted-foreground">
              Wird an jeden Seitentitel angehängt (z.B. "Galerie | ImmoOnPoint")
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="meta_description">Meta-Beschreibung</Label>
              <span className={`text-xs ${descriptionLength > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {descriptionLength}/160
              </span>
            </div>
            <Textarea
              id="meta_description"
              value={settings.meta_description || ''}
              onChange={(e) => onUpdate({ meta_description: e.target.value })}
              placeholder="Professionelle Immobilienfotografie für Makler..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Erscheint in Google-Suchergebnissen. Optimal: 150-160 Zeichen.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Keywords</Label>
            <Input
              id="meta_keywords"
              value={settings.meta_keywords || ''}
              onChange={(e) => onUpdate({ meta_keywords: e.target.value })}
              placeholder="Immobilienfotografie, Makler, Augsburg, Drohne"
            />
            <p className="text-xs text-muted-foreground">
              Kommagetrennte Schlüsselwörter (weniger relevant für Google, aber für andere Suchmaschinen)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Google Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Google Vorschau</CardTitle>
          <CardDescription>So könnte Ihre Seite in den Suchergebnissen erscheinen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-background border rounded-lg space-y-1">
            <div className="text-sm text-muted-foreground">
              app.immoonpoint.de
            </div>
            <div className="text-lg text-primary hover:underline cursor-pointer">
              {settings.site_name || 'ImmoOnPoint'}{settings.meta_title_suffix || ''}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {settings.meta_description || 'Keine Beschreibung hinterlegt...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
