import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface StructuredDataSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function StructuredDataSection({ settings, onUpdate }: StructuredDataSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Geschäftsinformationen</CardTitle>
          <CardDescription>
            Diese Daten werden für Google-Suchergebnisse und das Knowledge Panel verwendet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schema_org_type">Geschäftstyp</Label>
              <Select
                value={settings.schema_org_type || 'LocalBusiness'}
                onValueChange={(value) => onUpdate({ schema_org_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LocalBusiness">Lokales Geschäft</SelectItem>
                  <SelectItem value="ProfessionalService">Professionelle Dienstleistung</SelectItem>
                  <SelectItem value="Photographer">Fotograf</SelectItem>
                  <SelectItem value="RealEstateAgent">Immobilienmakler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_name">Firmenname</Label>
              <Input
                id="business_name"
                value={settings.business_name || ''}
                onChange={(e) => onUpdate({ business_name: e.target.value })}
                placeholder="ImmoOnPoint"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description">Firmenbeschreibung</Label>
            <Textarea
              id="business_description"
              value={settings.business_description || ''}
              onChange={(e) => onUpdate({ business_description: e.target.value })}
              placeholder="Professionelle Immobilienfotografie..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Telefon</Label>
              <Input
                id="business_phone"
                value={settings.business_phone || ''}
                onChange={(e) => onUpdate({ business_phone: e.target.value })}
                placeholder="+49 821 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">E-Mail</Label>
              <Input
                id="business_email"
                type="email"
                value={settings.business_email || ''}
                onChange={(e) => onUpdate({ business_email: e.target.value })}
                placeholder="info@immoonpoint.de"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Adresse</CardTitle>
          <CardDescription>Für lokale SEO und Google Maps Integration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_address_street">Straße & Hausnummer</Label>
            <Input
              id="business_address_street"
              value={settings.business_address_street || ''}
              onChange={(e) => onUpdate({ business_address_street: e.target.value })}
              placeholder="Musterstraße 123"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="business_address_zip">PLZ</Label>
              <Input
                id="business_address_zip"
                value={settings.business_address_zip || ''}
                onChange={(e) => onUpdate({ business_address_zip: e.target.value })}
                placeholder="86150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address_city">Stadt</Label>
              <Input
                id="business_address_city"
                value={settings.business_address_city || ''}
                onChange={(e) => onUpdate({ business_address_city: e.target.value })}
                placeholder="Augsburg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address_country">Land</Label>
              <Input
                id="business_address_country"
                value={settings.business_address_country || ''}
                onChange={(e) => onUpdate({ business_address_country: e.target.value })}
                placeholder="Deutschland"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_geo_lat">Breitengrad (Lat)</Label>
              <Input
                id="business_geo_lat"
                type="number"
                step="any"
                value={settings.business_geo_lat || ''}
                onChange={(e) => onUpdate({ business_geo_lat: parseFloat(e.target.value) || null })}
                placeholder="48.3705"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_geo_lng">Längengrad (Lng)</Label>
              <Input
                id="business_geo_lng"
                type="number"
                step="any"
                value={settings.business_geo_lng || ''}
                onChange={(e) => onUpdate({ business_geo_lng: parseFloat(e.target.value) || null })}
                placeholder="10.8978"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* JSON-LD Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Schema.org Vorschau</CardTitle>
          <CardDescription>Strukturierte Daten für Suchmaschinen</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": settings.schema_org_type || "LocalBusiness",
  "name": settings.business_name || "ImmoOnPoint",
  "description": settings.business_description || "",
  "telephone": settings.business_phone || "",
  "email": settings.business_email || "",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": settings.business_address_street || "",
    "addressLocality": settings.business_address_city || "",
    "postalCode": settings.business_address_zip || "",
    "addressCountry": settings.business_address_country || "DE"
  },
  ...(settings.business_geo_lat && settings.business_geo_lng ? {
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": settings.business_geo_lat,
      "longitude": settings.business_geo_lng
    }
  } : {})
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
