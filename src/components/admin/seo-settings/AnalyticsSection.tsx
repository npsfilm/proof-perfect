import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface AnalyticsSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function AnalyticsSection({ settings, onUpdate }: AnalyticsSectionProps) {
  const [localGaId, setLocalGaId] = useState(settings.google_analytics_id || '');
  const [localGtmId, setLocalGtmId] = useState(settings.google_tag_manager_id || '');
  const [localFbPixelId, setLocalFbPixelId] = useState(settings.facebook_pixel_id || '');

  const debouncedGaId = useDebounce(localGaId, 500);
  const debouncedGtmId = useDebounce(localGtmId, 500);
  const debouncedFbPixelId = useDebounce(localFbPixelId, 500);

  // Sync local state when settings change from outside
  useEffect(() => { setLocalGaId(settings.google_analytics_id || ''); }, [settings.google_analytics_id]);
  useEffect(() => { setLocalGtmId(settings.google_tag_manager_id || ''); }, [settings.google_tag_manager_id]);
  useEffect(() => { setLocalFbPixelId(settings.facebook_pixel_id || ''); }, [settings.facebook_pixel_id]);

  // Save debounced values
  useEffect(() => {
    if (debouncedGaId !== (settings.google_analytics_id || '')) {
      onUpdate({ google_analytics_id: debouncedGaId });
    }
  }, [debouncedGaId]);

  useEffect(() => {
    if (debouncedGtmId !== (settings.google_tag_manager_id || '')) {
      onUpdate({ google_tag_manager_id: debouncedGtmId });
    }
  }, [debouncedGtmId]);

  useEffect(() => {
    if (debouncedFbPixelId !== (settings.facebook_pixel_id || '')) {
      onUpdate({ facebook_pixel_id: debouncedFbPixelId });
    }
  }, [debouncedFbPixelId]);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Analytics-Tracking wird erst aktiviert, wenn Sie die entsprechenden IDs hinterlegen.
          Stellen Sie sicher, dass Sie die DSGVO-Anforderungen erfüllen (Cookie-Consent).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Google Analytics</CardTitle>
          <CardDescription>Website-Analyse und Besucherstatistiken</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
            <Input
              id="google_analytics_id"
              value={localGaId}
              onChange={(e) => setLocalGaId(e.target.value)}
              placeholder="G-XXXXXXXXXX oder UA-XXXXXXXXX-X"
            />
            <p className="text-xs text-muted-foreground">
              Ihre Mess-ID aus Google Analytics 4 (GA4) oder Universal Analytics
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Tag Manager</CardTitle>
          <CardDescription>Zentrale Verwaltung aller Tracking-Tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_tag_manager_id">GTM Container ID</Label>
            <Input
              id="google_tag_manager_id"
              value={localGtmId}
              onChange={(e) => setLocalGtmId(e.target.value)}
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Falls Sie GTM nutzen, können Sie dort alle Tags zentral verwalten
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Facebook Pixel</CardTitle>
          <CardDescription>Für Facebook/Meta Ads Conversion Tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facebook_pixel_id">Pixel ID</Label>
            <Input
              id="facebook_pixel_id"
              value={localFbPixelId}
              onChange={(e) => setLocalFbPixelId(e.target.value)}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              Ihre Facebook Pixel ID für Conversion-Tracking und Retargeting
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
