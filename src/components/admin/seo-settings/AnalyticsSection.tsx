import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface AnalyticsSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function AnalyticsSection({ settings, onUpdate }: AnalyticsSectionProps) {
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
              value={settings.google_analytics_id || ''}
              onChange={(e) => onUpdate({ google_analytics_id: e.target.value })}
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
              value={settings.google_tag_manager_id || ''}
              onChange={(e) => onUpdate({ google_tag_manager_id: e.target.value })}
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
              value={settings.facebook_pixel_id || ''}
              onChange={(e) => onUpdate({ facebook_pixel_id: e.target.value })}
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
