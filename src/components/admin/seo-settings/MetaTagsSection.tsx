import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface MetaTagsSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function MetaTagsSection({ settings, onUpdate }: MetaTagsSectionProps) {
  const [localTitleSuffix, setLocalTitleSuffix] = useState(settings.meta_title_suffix || '');
  const [localDescription, setLocalDescription] = useState(settings.meta_description || '');
  const [localKeywords, setLocalKeywords] = useState(settings.meta_keywords || '');

  const debouncedTitleSuffix = useDebounce(localTitleSuffix, 500);
  const debouncedDescription = useDebounce(localDescription, 500);
  const debouncedKeywords = useDebounce(localKeywords, 500);

  // Sync local state when settings change from outside
  useEffect(() => {
    setLocalTitleSuffix(settings.meta_title_suffix || '');
  }, [settings.meta_title_suffix]);

  useEffect(() => {
    setLocalDescription(settings.meta_description || '');
  }, [settings.meta_description]);

  useEffect(() => {
    setLocalKeywords(settings.meta_keywords || '');
  }, [settings.meta_keywords]);

  // Save debounced values
  useEffect(() => {
    if (debouncedTitleSuffix !== (settings.meta_title_suffix || '')) {
      onUpdate({ meta_title_suffix: debouncedTitleSuffix });
    }
  }, [debouncedTitleSuffix]);

  useEffect(() => {
    if (debouncedDescription !== (settings.meta_description || '')) {
      onUpdate({ meta_description: debouncedDescription });
    }
  }, [debouncedDescription]);

  useEffect(() => {
    if (debouncedKeywords !== (settings.meta_keywords || '')) {
      onUpdate({ meta_keywords: debouncedKeywords });
    }
  }, [debouncedKeywords]);

  const descriptionLength = localDescription.length;

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
              value={localTitleSuffix}
              onChange={(e) => setLocalTitleSuffix(e.target.value)}
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
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
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
              value={localKeywords}
              onChange={(e) => setLocalKeywords(e.target.value)}
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
              {settings.site_name || 'ImmoOnPoint'}{localTitleSuffix || ''}
            </div>
            <div className="text-sm text-muted-foreground line-clamp-2">
              {localDescription || 'Keine Beschreibung hinterlegt...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
