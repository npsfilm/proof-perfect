import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/useDebounce';
import type { SeoSettings, SeoSettingsUpdate } from './types';

interface StructuredDataSectionProps {
  settings: SeoSettings;
  onUpdate: (updates: SeoSettingsUpdate) => void;
}

export function StructuredDataSection({ settings, onUpdate }: StructuredDataSectionProps) {
  const [localBusinessName, setLocalBusinessName] = useState(settings.business_name || '');
  const [localBusinessDescription, setLocalBusinessDescription] = useState(settings.business_description || '');
  const [localBusinessPhone, setLocalBusinessPhone] = useState(settings.business_phone || '');
  const [localBusinessEmail, setLocalBusinessEmail] = useState(settings.business_email || '');
  const [localAddressStreet, setLocalAddressStreet] = useState(settings.business_address_street || '');
  const [localAddressZip, setLocalAddressZip] = useState(settings.business_address_zip || '');
  const [localAddressCity, setLocalAddressCity] = useState(settings.business_address_city || '');
  const [localAddressCountry, setLocalAddressCountry] = useState(settings.business_address_country || '');
  const [localGeoLat, setLocalGeoLat] = useState(settings.business_geo_lat?.toString() || '');
  const [localGeoLng, setLocalGeoLng] = useState(settings.business_geo_lng?.toString() || '');

  const debouncedBusinessName = useDebounce(localBusinessName, 500);
  const debouncedBusinessDescription = useDebounce(localBusinessDescription, 500);
  const debouncedBusinessPhone = useDebounce(localBusinessPhone, 500);
  const debouncedBusinessEmail = useDebounce(localBusinessEmail, 500);
  const debouncedAddressStreet = useDebounce(localAddressStreet, 500);
  const debouncedAddressZip = useDebounce(localAddressZip, 500);
  const debouncedAddressCity = useDebounce(localAddressCity, 500);
  const debouncedAddressCountry = useDebounce(localAddressCountry, 500);
  const debouncedGeoLat = useDebounce(localGeoLat, 500);
  const debouncedGeoLng = useDebounce(localGeoLng, 500);

  // Sync local state when settings change from outside
  useEffect(() => { setLocalBusinessName(settings.business_name || ''); }, [settings.business_name]);
  useEffect(() => { setLocalBusinessDescription(settings.business_description || ''); }, [settings.business_description]);
  useEffect(() => { setLocalBusinessPhone(settings.business_phone || ''); }, [settings.business_phone]);
  useEffect(() => { setLocalBusinessEmail(settings.business_email || ''); }, [settings.business_email]);
  useEffect(() => { setLocalAddressStreet(settings.business_address_street || ''); }, [settings.business_address_street]);
  useEffect(() => { setLocalAddressZip(settings.business_address_zip || ''); }, [settings.business_address_zip]);
  useEffect(() => { setLocalAddressCity(settings.business_address_city || ''); }, [settings.business_address_city]);
  useEffect(() => { setLocalAddressCountry(settings.business_address_country || ''); }, [settings.business_address_country]);
  useEffect(() => { setLocalGeoLat(settings.business_geo_lat?.toString() || ''); }, [settings.business_geo_lat]);
  useEffect(() => { setLocalGeoLng(settings.business_geo_lng?.toString() || ''); }, [settings.business_geo_lng]);

  // Save debounced values
  useEffect(() => {
    if (debouncedBusinessName !== (settings.business_name || '')) {
      onUpdate({ business_name: debouncedBusinessName });
    }
  }, [debouncedBusinessName]);

  useEffect(() => {
    if (debouncedBusinessDescription !== (settings.business_description || '')) {
      onUpdate({ business_description: debouncedBusinessDescription });
    }
  }, [debouncedBusinessDescription]);

  useEffect(() => {
    if (debouncedBusinessPhone !== (settings.business_phone || '')) {
      onUpdate({ business_phone: debouncedBusinessPhone });
    }
  }, [debouncedBusinessPhone]);

  useEffect(() => {
    if (debouncedBusinessEmail !== (settings.business_email || '')) {
      onUpdate({ business_email: debouncedBusinessEmail });
    }
  }, [debouncedBusinessEmail]);

  useEffect(() => {
    if (debouncedAddressStreet !== (settings.business_address_street || '')) {
      onUpdate({ business_address_street: debouncedAddressStreet });
    }
  }, [debouncedAddressStreet]);

  useEffect(() => {
    if (debouncedAddressZip !== (settings.business_address_zip || '')) {
      onUpdate({ business_address_zip: debouncedAddressZip });
    }
  }, [debouncedAddressZip]);

  useEffect(() => {
    if (debouncedAddressCity !== (settings.business_address_city || '')) {
      onUpdate({ business_address_city: debouncedAddressCity });
    }
  }, [debouncedAddressCity]);

  useEffect(() => {
    if (debouncedAddressCountry !== (settings.business_address_country || '')) {
      onUpdate({ business_address_country: debouncedAddressCountry });
    }
  }, [debouncedAddressCountry]);

  useEffect(() => {
    const newLat = debouncedGeoLat ? parseFloat(debouncedGeoLat) : null;
    if (newLat !== settings.business_geo_lat) {
      onUpdate({ business_geo_lat: newLat });
    }
  }, [debouncedGeoLat]);

  useEffect(() => {
    const newLng = debouncedGeoLng ? parseFloat(debouncedGeoLng) : null;
    if (newLng !== settings.business_geo_lng) {
      onUpdate({ business_geo_lng: newLng });
    }
  }, [debouncedGeoLng]);

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
                value={localBusinessName}
                onChange={(e) => setLocalBusinessName(e.target.value)}
                placeholder="ImmoOnPoint"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description">Firmenbeschreibung</Label>
            <Textarea
              id="business_description"
              value={localBusinessDescription}
              onChange={(e) => setLocalBusinessDescription(e.target.value)}
              placeholder="Professionelle Immobilienfotografie..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Telefon</Label>
              <Input
                id="business_phone"
                value={localBusinessPhone}
                onChange={(e) => setLocalBusinessPhone(e.target.value)}
                placeholder="+49 821 12345678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_email">E-Mail</Label>
              <Input
                id="business_email"
                type="email"
                value={localBusinessEmail}
                onChange={(e) => setLocalBusinessEmail(e.target.value)}
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
              value={localAddressStreet}
              onChange={(e) => setLocalAddressStreet(e.target.value)}
              placeholder="Musterstraße 123"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="business_address_zip">PLZ</Label>
              <Input
                id="business_address_zip"
                value={localAddressZip}
                onChange={(e) => setLocalAddressZip(e.target.value)}
                placeholder="86150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address_city">Stadt</Label>
              <Input
                id="business_address_city"
                value={localAddressCity}
                onChange={(e) => setLocalAddressCity(e.target.value)}
                placeholder="Augsburg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_address_country">Land</Label>
              <Input
                id="business_address_country"
                value={localAddressCountry}
                onChange={(e) => setLocalAddressCountry(e.target.value)}
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
                value={localGeoLat}
                onChange={(e) => setLocalGeoLat(e.target.value)}
                placeholder="48.3705"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_geo_lng">Längengrad (Lng)</Label>
              <Input
                id="business_geo_lng"
                type="number"
                step="any"
                value={localGeoLng}
                onChange={(e) => setLocalGeoLng(e.target.value)}
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
  "name": localBusinessName || "ImmoOnPoint",
  "description": localBusinessDescription || "",
  "telephone": localBusinessPhone || "",
  "email": localBusinessEmail || "",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": localAddressStreet || "",
    "addressLocality": localAddressCity || "",
    "postalCode": localAddressZip || "",
    "addressCountry": localAddressCountry || "DE"
  },
  ...(localGeoLat && localGeoLng ? {
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": parseFloat(localGeoLat),
      "longitude": parseFloat(localGeoLng)
    }
  } : {})
}, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
