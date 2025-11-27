import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle2, Package, Info } from 'lucide-react';

interface EmailTemplateEditorProps {
  sendSubjectDu: string;
  sendBodyDu: string;
  reviewSubjectDu: string;
  reviewBodyDu: string;
  deliverSubjectDu: string;
  deliverBodyDu: string;
  sendSubjectSie: string;
  sendBodySie: string;
  reviewSubjectSie: string;
  reviewBodySie: string;
  deliverSubjectSie: string;
  deliverBodySie: string;
  onSendSubjectDuChange: (value: string) => void;
  onSendBodyDuChange: (value: string) => void;
  onReviewSubjectDuChange: (value: string) => void;
  onReviewBodyDuChange: (value: string) => void;
  onDeliverSubjectDuChange: (value: string) => void;
  onDeliverBodyDuChange: (value: string) => void;
  onSendSubjectSieChange: (value: string) => void;
  onSendBodySieChange: (value: string) => void;
  onReviewSubjectSieChange: (value: string) => void;
  onReviewBodySieChange: (value: string) => void;
  onDeliverSubjectSieChange: (value: string) => void;
  onDeliverBodySieChange: (value: string) => void;
}

const PlaceholderInfo = ({ type }: { type: 'send' | 'review' | 'deliver' }) => {
  const commonPlaceholders = [
    '• {gallery_name} - Name der Galerie',
    '• {gallery_address} - Adresse der Immobilie',
    '• {package_target_count} - Ziel-Anzahl der Fotos im Paket',
    '• {company_name} - Firmenname (falls zugewiesen)',
    '• {salutation} - Anrede (Du/Sie)',
    '• {timestamp} - Zeitstempel des Ereignisses',
    '• {event_id} - Eindeutige Ereignis-ID',
  ];

  const sendPlaceholders = [
    '• {gallery_url} - Link zur Galerie',
    '• {client_emails} - E-Mail-Adressen der Kunden',
    '• {client_names} - Namen der Kunden (Vorname Nachname)',
    '• {client_anrede} - Anrede der Kunden (Herr/Frau)',
    '• {new_passwords} - Temporäre Passwörter (falls neu)',
  ];

  const reviewPlaceholders = [
    '• {gallery_url} - Link zur Galerie (Admin-Ansicht)',
    '• {selected_count} - Anzahl ausgewählter Fotos',
    '• {staging_count} - Anzahl Staging-Anfragen',
    '• {photos_count} - Gesamtanzahl der Fotos',
    '• {client_names} - Namen der Kunden',
    '• {client_emails} - E-Mail-Adressen der Kunden',
    '• {admin_email} - Admin-E-Mail-Adresse',
  ];

  const deliverPlaceholders = [
    '• {download_link} - Download-Link für finale Dateien',
    '• {selected_count} - Anzahl ausgewählter Fotos',
    '• {staging_count} - Anzahl Staging-Anfragen',
    '• {client_emails} - E-Mail-Adressen der Kunden',
    '• {client_names} - Namen der Kunden',
    '• {client_anrede} - Anrede der Kunden (Herr/Frau)',
  ];

  const specificPlaceholders = 
    type === 'send' ? sendPlaceholders :
    type === 'review' ? reviewPlaceholders :
    deliverPlaceholders;

  return (
    <div className="bg-muted/50 border rounded-lg p-3 text-sm">
      <p className="font-semibold mb-2">Verfügbare Platzhalter:</p>
      <ul className="space-y-1 text-muted-foreground">
        {specificPlaceholders.map((p, i) => <li key={i}>{p}</li>)}
        {commonPlaceholders.map((p, i) => <li key={`common-${i}`}>{p}</li>)}
      </ul>
    </div>
  );
};

export function EmailTemplateEditor(props: EmailTemplateEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-Mail-Templates
        </CardTitle>
        <CardDescription>
          Bearbeite die E-Mail-Templates für Zapier-Webhooks - jeweils für "Du" und "Sie" Ansprache
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Verwende Platzhalter wie {'{'}gallery_name{'}'}, {'{'}gallery_url{'}'}, {'{'}client_emails{'}'}. Diese werden von Zapier ersetzt.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="du" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="du">Du-Ansprache</TabsTrigger>
            <TabsTrigger value="sie">Sie-Ansprache</TabsTrigger>
          </TabsList>

          {/* Du Templates */}
          <TabsContent value="du" className="space-y-6">
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="send">
                  <Send className="h-4 w-4 mr-2" />
                  An Kunde senden
                </TabsTrigger>
                <TabsTrigger value="review">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Überprüfung
                </TabsTrigger>
                <TabsTrigger value="delivery">
                  <Package className="h-4 w-4 mr-2" />
                  Lieferung
                </TabsTrigger>
              </TabsList>

              <TabsContent value="send" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="send-subject-du">Betreff</Label>
                  <Input
                    id="send-subject-du"
                    placeholder="Deine Galerie ist bereit: {gallery_name}"
                    value={props.sendSubjectDu}
                    onChange={(e) => props.onSendSubjectDuChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="send-body-du">E-Mail-Text</Label>
                  <Textarea
                    id="send-body-du"
                    placeholder="Hallo,&#10;&#10;Deine Galerie '{gallery_name}' ist jetzt bereit zur Ansicht..."
                    value={props.sendBodyDu}
                    onChange={(e) => props.onSendBodyDuChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="send" />
              </TabsContent>

              <TabsContent value="review" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="review-subject-du">Betreff</Label>
                  <Input
                    id="review-subject-du"
                    placeholder="Kunde hat Galerie überprüft: {gallery_name}"
                    value={props.reviewSubjectDu}
                    onChange={(e) => props.onReviewSubjectDuChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-body-du">E-Mail-Text</Label>
                  <Textarea
                    id="review-body-du"
                    placeholder="Hallo,&#10;&#10;Der Kunde hat die Galerie '{gallery_name}' überprüft..."
                    value={props.reviewBodyDu}
                    onChange={(e) => props.onReviewBodyDuChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="review" />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="deliver-subject-du">Betreff</Label>
                  <Input
                    id="deliver-subject-du"
                    placeholder="Deine finalen Fotos sind bereit: {gallery_name}"
                    value={props.deliverSubjectDu}
                    onChange={(e) => props.onDeliverSubjectDuChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliver-body-du">E-Mail-Text</Label>
                  <Textarea
                    id="deliver-body-du"
                    placeholder="Hallo,&#10;&#10;Deine finalen bearbeiteten Fotos für '{gallery_name}' sind jetzt bereit..."
                    value={props.deliverBodyDu}
                    onChange={(e) => props.onDeliverBodyDuChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="deliver" />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Sie Templates */}
          <TabsContent value="sie" className="space-y-6">
            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="send">
                  <Send className="h-4 w-4 mr-2" />
                  An Kunde senden
                </TabsTrigger>
                <TabsTrigger value="review">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Überprüfung
                </TabsTrigger>
                <TabsTrigger value="delivery">
                  <Package className="h-4 w-4 mr-2" />
                  Lieferung
                </TabsTrigger>
              </TabsList>

              <TabsContent value="send" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="send-subject-sie">Betreff</Label>
                  <Input
                    id="send-subject-sie"
                    placeholder="Ihre Galerie ist bereit: {gallery_name}"
                    value={props.sendSubjectSie}
                    onChange={(e) => props.onSendSubjectSieChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="send-body-sie">E-Mail-Text</Label>
                  <Textarea
                    id="send-body-sie"
                    placeholder="Sehr geehrte Damen und Herren,&#10;&#10;Ihre Galerie '{gallery_name}' ist jetzt bereit zur Ansicht..."
                    value={props.sendBodySie}
                    onChange={(e) => props.onSendBodySieChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="send" />
              </TabsContent>

              <TabsContent value="review" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="review-subject-sie">Betreff</Label>
                  <Input
                    id="review-subject-sie"
                    placeholder="Kunde hat Galerie überprüft: {gallery_name}"
                    value={props.reviewSubjectSie}
                    onChange={(e) => props.onReviewSubjectSieChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-body-sie">E-Mail-Text</Label>
                  <Textarea
                    id="review-body-sie"
                    placeholder="Sehr geehrte Damen und Herren,&#10;&#10;Der Kunde hat die Galerie '{gallery_name}' überprüft..."
                    value={props.reviewBodySie}
                    onChange={(e) => props.onReviewBodySieChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="review" />
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="deliver-subject-sie">Betreff</Label>
                  <Input
                    id="deliver-subject-sie"
                    placeholder="Ihre finalen Fotos sind bereit: {gallery_name}"
                    value={props.deliverSubjectSie}
                    onChange={(e) => props.onDeliverSubjectSieChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliver-body-sie">E-Mail-Text</Label>
                  <Textarea
                    id="deliver-body-sie"
                    placeholder="Sehr geehrte Damen und Herren,&#10;&#10;Ihre finalen bearbeiteten Fotos für '{gallery_name}' sind jetzt bereit..."
                    value={props.deliverBodySie}
                    onChange={(e) => props.onDeliverBodySieChange(e.target.value)}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <PlaceholderInfo type="deliver" />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
