import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Shield, AtSign, Building, Scale, FileText } from 'lucide-react';
import { useEmailDesignSettings } from '@/hooks/useEmailDesignSettings';
import { Skeleton } from '@/components/ui/skeleton';

export function EmailGeneralSettings() {
  const { settings, isLoading, updateSettings } = useEmailDesignSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[200px]" />
      </div>
    );
  }

  if (!settings) return null;

  const handleChange = (field: string, value: string | boolean) => {
    updateSettings.mutate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Sender Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Absender-Einstellungen</CardTitle>
          </div>
          <CardDescription>
            Konfigurieren Sie den Standard-Absender für alle ausgehenden E-Mails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default_from_name">Absender-Name</Label>
              <Input
                id="default_from_name"
                value={settings.default_from_name || ''}
                onChange={(e) => handleChange('default_from_name', e.target.value)}
                placeholder="ImmoOnPoint"
              />
              <p className="text-xs text-muted-foreground">
                Angezeigter Name in E-Mail-Clients
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_from_email">Absender-E-Mail</Label>
              <Input
                id="default_from_email"
                type="email"
                value={settings.default_from_email || ''}
                onChange={(e) => handleChange('default_from_email', e.target.value)}
                placeholder="noreply@immoonpoint.de"
              />
              <p className="text-xs text-muted-foreground">
                Muss bei Resend verifiziert sein
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reply_to_email">Reply-To E-Mail</Label>
              <Input
                id="reply_to_email"
                type="email"
                value={settings.reply_to_email || ''}
                onChange={(e) => handleChange('reply_to_email', e.target.value)}
                placeholder="support@immoonpoint.de"
              />
              <p className="text-xs text-muted-foreground">
                Empfänger-Antworten gehen an diese Adresse
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply_to_name">Reply-To Name (optional)</Label>
              <Input
                id="reply_to_name"
                value={settings.reply_to_name || ''}
                onChange={(e) => handleChange('reply_to_name', e.target.value)}
                placeholder="ImmoOnPoint Support"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4 font-mono text-sm">
            <div className="text-muted-foreground">Vorschau:</div>
            <div className="mt-2 space-y-1">
              <div>
                <span className="text-muted-foreground">From: </span>
                {settings.default_from_name || 'ImmoOnPoint'} &lt;{settings.default_from_email || 'noreply@immoonpoint.de'}&gt;
              </div>
              {settings.reply_to_email && (
                <div>
                  <span className="text-muted-foreground">Reply-To: </span>
                  {settings.reply_to_name || settings.default_from_name || 'ImmoOnPoint'} &lt;{settings.reply_to_email}&gt;
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Sender Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-secondary" />
            <CardTitle className="text-lg">Newsletter-Absender</CardTitle>
          </div>
          <CardDescription>
            Separate Absender-Einstellungen für Newsletter-E-Mails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newsletter_from_name">Absender-Name</Label>
              <Input
                id="newsletter_from_name"
                value={settings.newsletter_from_name || ''}
                onChange={(e) => handleChange('newsletter_from_name', e.target.value)}
                placeholder="ImmoOnPoint Tipps"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newsletter_from_email">Absender-E-Mail</Label>
              <Input
                id="newsletter_from_email"
                type="email"
                value={settings.newsletter_from_email || ''}
                onChange={(e) => handleChange('newsletter_from_email', e.target.value)}
                placeholder="tipps@immoonpoint.de"
              />
              <p className="text-xs text-muted-foreground">
                Muss bei Resend verifiziert sein
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="newsletter_reply_to_email">Reply-To E-Mail (optional)</Label>
              <Input
                id="newsletter_reply_to_email"
                type="email"
                value={settings.newsletter_reply_to_email || ''}
                onChange={(e) => handleChange('newsletter_reply_to_email', e.target.value)}
                placeholder="tipps@immoonpoint.de"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newsletter_reply_to_name">Reply-To Name (optional)</Label>
              <Input
                id="newsletter_reply_to_name"
                value={settings.newsletter_reply_to_name || ''}
                onChange={(e) => handleChange('newsletter_reply_to_name', e.target.value)}
                placeholder="ImmoOnPoint Tipps"
              />
            </div>
          </div>

          {/* Newsletter Preview */}
          <div className="rounded-lg bg-muted p-4 font-mono text-sm">
            <div className="text-muted-foreground">Newsletter-Vorschau:</div>
            <div className="mt-2 space-y-1">
              <div>
                <span className="text-muted-foreground">From: </span>
                {settings.newsletter_from_name || 'ImmoOnPoint Tipps'} &lt;{settings.newsletter_from_email || 'tipps@immoonpoint.de'}&gt;
              </div>
              {(settings.newsletter_reply_to_email || settings.reply_to_email) && (
                <div>
                  <span className="text-muted-foreground">Reply-To: </span>
                  {settings.newsletter_reply_to_name || settings.newsletter_from_name || 'ImmoOnPoint Tipps'} &lt;{settings.newsletter_reply_to_email || settings.reply_to_email}&gt;
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Rechtliche Angaben</CardTitle>
          </div>
          <CardDescription>
            Firmendaten, die in jedem E-Mail-Footer angezeigt werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand_trademark_notice">Markenhinweis</Label>
            <Input
              id="brand_trademark_notice"
              value={settings.brand_trademark_notice || ''}
              onChange={(e) => handleChange('brand_trademark_notice', e.target.value)}
              placeholder="ImmoOnPoint ist eine Marke der NPS Media GmbH"
            />
            <p className="text-xs text-muted-foreground">
              Wird kursiv unter dem Copyright-Text angezeigt
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="legal_company_name">Firma (rechtlich)</Label>
            <Input
              id="legal_company_name"
              value={settings.legal_company_name || ''}
              onChange={(e) => handleChange('legal_company_name', e.target.value)}
              placeholder="NPS Media GmbH"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="legal_register_info">Handelsregister</Label>
              <Input
                id="legal_register_info"
                value={settings.legal_register_info || ''}
                onChange={(e) => handleChange('legal_register_info', e.target.value)}
                placeholder="HRB 38388 Amtsgericht Augsburg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legal_vat_id">USt-IdNr.</Label>
              <Input
                id="legal_vat_id"
                value={settings.legal_vat_id || ''}
                onChange={(e) => handleChange('legal_vat_id', e.target.value)}
                placeholder="DE359733225"
              />
            </div>
          </div>

          {/* Legal Preview */}
          <div className="rounded-lg bg-muted p-4 text-center text-sm">
            <div className="text-muted-foreground">Footer-Vorschau:</div>
            <div className="mt-2 italic text-xs">
              {settings.brand_trademark_notice || 'ImmoOnPoint ist eine Marke der NPS Media GmbH'}
            </div>
            <div className="mt-2">
              <span className="font-medium">{settings.legal_company_name || 'NPS Media GmbH'}</span>
              {settings.legal_register_info && (
                <span className="text-muted-foreground"> | {settings.legal_register_info}</span>
              )}
              {settings.legal_vat_id && (
                <span className="text-muted-foreground"> | USt-IdNr.: {settings.legal_vat_id}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Physical Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Physische Adresse (CAN-SPAM/DSGVO)</CardTitle>
          </div>
          <CardDescription>
            Eine physische Adresse im Footer verbessert Vertrauen und Zustellbarkeit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Adresse im E-Mail-Footer anzeigen</Label>
              <p className="text-sm text-muted-foreground">
                Empfohlen für bessere Zustellbarkeit
              </p>
            </div>
            <Switch
              checked={settings.include_physical_address ?? true}
              onCheckedChange={(checked) => handleChange('include_physical_address', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="physical_address_line1">Adresszeile 1</Label>
              <Input
                id="physical_address_line1"
                value={settings.physical_address_line1 || ''}
                onChange={(e) => handleChange('physical_address_line1', e.target.value)}
                placeholder="Klinkerberg 9"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="physical_address_line2">Adresszeile 2 (PLZ & Stadt)</Label>
                <Input
                  id="physical_address_line2"
                  value={settings.physical_address_line2 || ''}
                  onChange={(e) => handleChange('physical_address_line2', e.target.value)}
                  placeholder="86152 Augsburg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical_address_country">Land</Label>
                <Input
                  id="physical_address_country"
                  value={settings.physical_address_country || ''}
                  onChange={(e) => handleChange('physical_address_country', e.target.value)}
                  placeholder="Deutschland"
                />
              </div>
            </div>
          </div>

          {/* Address Preview */}
          {settings.include_physical_address && (
            <div className="rounded-lg bg-muted p-4 text-center text-sm">
              <div className="text-muted-foreground">Adress-Vorschau:</div>
              <div className="mt-2">
                {settings.physical_address_line1 && (
                  <span>{settings.physical_address_line1}</span>
                )}
                {settings.physical_address_line2 && (
                  <span className="text-muted-foreground"> | {settings.physical_address_line2}</span>
                )}
                {settings.physical_address_country && (
                  <span className="text-muted-foreground"> | {settings.physical_address_country}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Reason Texts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">E-Mail-Begründung</CardTitle>
          </div>
          <CardDescription>
            Erklärt dem Empfänger, warum er diese E-Mail erhält
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason_transactional">Transaktions-E-Mails (System & Kunden)</Label>
            <Textarea
              id="reason_transactional"
              value={settings.reason_transactional || ''}
              onChange={(e) => handleChange('reason_transactional', e.target.value)}
              placeholder="Sie erhalten diese E-Mail, weil Sie eine Bestellung über ImmoOnPoint aufgegeben haben."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Wird bei Bestätigungen, Statusupdates und System-Mails angezeigt
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason_newsletter">Newsletter</Label>
            <Textarea
              id="reason_newsletter"
              value={settings.reason_newsletter || ''}
              onChange={(e) => handleChange('reason_newsletter', e.target.value)}
              placeholder="Sie erhalten diese E-Mail, weil Sie in der Vergangenheit eine Marketingdienstleistung von ImmoOnPoint in Anspruch genommen oder sich für den Newsletter angemeldet haben."
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Wird bei Marketing- und Newsletter-Mails angezeigt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confidentiality Notice */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Vertraulichkeitshinweis</CardTitle>
          </div>
          <CardDescription>
            Rechtlicher Hinweis am Ende jeder E-Mail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Vertraulichkeitshinweis anzeigen</Label>
              <p className="text-sm text-muted-foreground">
                Rechtlicher Disclaimer im E-Mail-Footer
              </p>
            </div>
            <Switch
              checked={settings.include_confidentiality_notice ?? true}
              onCheckedChange={(checked) => handleChange('include_confidentiality_notice', checked)}
            />
          </div>

          {settings.include_confidentiality_notice && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="confidentiality_notice">Hinweistext</Label>
                <Textarea
                  id="confidentiality_notice"
                  value={settings.confidentiality_notice || ''}
                  onChange={(e) => handleChange('confidentiality_notice', e.target.value)}
                  placeholder="Diese E-Mail enthält vertrauliche und/oder rechtlich geschützte Informationen..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Leer lassen für Standardtext
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Anti-Spam Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AtSign className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Anti-Spam Einstellungen</CardTitle>
          </div>
          <CardDescription>
            Verbessern Sie die E-Mail-Zustellbarkeit mit korrekten Headers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unsubscribe_email">List-Unsubscribe E-Mail</Label>
              <Input
                id="unsubscribe_email"
                type="email"
                value={settings.unsubscribe_email || ''}
                onChange={(e) => handleChange('unsubscribe_email', e.target.value)}
                placeholder="unsubscribe@immoonpoint.de"
              />
              <p className="text-xs text-muted-foreground">
                Für den List-Unsubscribe Header
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unsubscribe_url">List-Unsubscribe URL (optional)</Label>
              <Input
                id="unsubscribe_url"
                type="url"
                value={settings.unsubscribe_url || ''}
                onChange={(e) => handleChange('unsubscribe_url', e.target.value)}
                placeholder="https://app.immoonpoint.de/unsubscribe"
              />
            </div>
          </div>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
            <div className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="font-medium">Hinweis zur Zustellbarkeit</div>
                <p className="mt-1 text-muted-foreground">
                  Die List-Unsubscribe Header signalisieren E-Mail-Clients, dass dies legitime Transaktionsmails sind. 
                  Dies reduziert die Wahrscheinlichkeit, dass E-Mails im Spam landen.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}