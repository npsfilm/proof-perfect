import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle2, Package, Info } from 'lucide-react';

interface EmailTemplateEditorProps {
  sendSubject: string;
  sendBody: string;
  reviewSubject: string;
  reviewBody: string;
  deliverSubject: string;
  deliverBody: string;
  onSendSubjectChange: (value: string) => void;
  onSendBodyChange: (value: string) => void;
  onReviewSubjectChange: (value: string) => void;
  onReviewBodyChange: (value: string) => void;
  onDeliverSubjectChange: (value: string) => void;
  onDeliverBodyChange: (value: string) => void;
}

export function EmailTemplateEditor({
  sendSubject,
  sendBody,
  reviewSubject,
  reviewBody,
  deliverSubject,
  deliverBody,
  onSendSubjectChange,
  onSendBodyChange,
  onReviewSubjectChange,
  onReviewBodyChange,
  onDeliverSubjectChange,
  onDeliverBodyChange,
}: EmailTemplateEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-Mail-Templates
        </CardTitle>
        <CardDescription>
          Bearbeite die E-Mail-Templates für Zapier-Webhooks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Verwende Platzhalter wie {'{'}gallery_name{'}'}, {'{'}gallery_url{'}'}, {'{'}client_emails{'}'}, {'{'}download_link{'}'}. Diese werden von Zapier ersetzt.
          </AlertDescription>
        </Alert>

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

          {/* Send to Client Template */}
          <TabsContent value="send" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="send-subject">Betreff</Label>
                <Input
                  id="send-subject"
                  placeholder="Ihre Galerie ist bereit: {gallery_name}"
                  value={sendSubject}
                  onChange={(e) => onSendSubjectChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="send-body">E-Mail-Text</Label>
                <Textarea
                  id="send-body"
                  placeholder="Hallo,&#10;&#10;Ihre Galerie '{gallery_name}' ist jetzt bereit zur Ansicht.&#10;&#10;Galerie-Link: {gallery_url}&#10;&#10;Viele Grüße"
                  value={sendBody}
                  onChange={(e) => onSendBodyChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="bg-muted/50 border rounded-lg p-3 text-sm">
                <p className="font-semibold mb-2">Verfügbare Platzhalter:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {'{'}gallery_name{'}'} - Name der Galerie</li>
                  <li>• {'{'}gallery_url{'}'} - Link zur Galerie</li>
                  <li>• {'{'}client_emails{'}'} - E-Mail-Adressen der Kunden</li>
                  <li>• {'{'}new_passwords{'}'} - Temporäre Passwörter (falls neu)</li>
                  <li>• {'{'}salutation{'}'} - Anrede (Du/Sie)</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Review Notification Template */}
          <TabsContent value="review" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-subject">Betreff</Label>
                <Input
                  id="review-subject"
                  placeholder="Kunde hat Galerie überprüft: {gallery_name}"
                  value={reviewSubject}
                  onChange={(e) => onReviewSubjectChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-body">E-Mail-Text</Label>
                <Textarea
                  id="review-body"
                  placeholder="Hallo,&#10;&#10;Der Kunde hat die Galerie '{gallery_name}' überprüft.&#10;&#10;Ausgewählte Fotos: {selected_count}&#10;Staging-Anfragen: {staging_count}&#10;&#10;Viele Grüße"
                  value={reviewBody}
                  onChange={(e) => onReviewBodyChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="bg-muted/50 border rounded-lg p-3 text-sm">
                <p className="font-semibold mb-2">Verfügbare Platzhalter:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {'{'}gallery_name{'}'} - Name der Galerie</li>
                  <li>• {'{'}selected_count{'}'} - Anzahl ausgewählter Fotos</li>
                  <li>• {'{'}staging_count{'}'} - Anzahl Staging-Anfragen</li>
                  <li>• {'{'}admin_email{'}'} - Admin-E-Mail-Adresse</li>
                  <li>• {'{'}salutation{'}'} - Anrede (Du/Sie)</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Final Delivery Template */}
          <TabsContent value="delivery" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliver-subject">Betreff</Label>
                <Input
                  id="deliver-subject"
                  placeholder="Ihre finalen Fotos sind bereit: {gallery_name}"
                  value={deliverSubject}
                  onChange={(e) => onDeliverSubjectChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliver-body">E-Mail-Text</Label>
                <Textarea
                  id="deliver-body"
                  placeholder="Hallo,&#10;&#10;Ihre finalen bearbeiteten Fotos für '{gallery_name}' sind jetzt bereit.&#10;&#10;Download-Link: {download_link}&#10;&#10;Viele Grüße"
                  value={deliverBody}
                  onChange={(e) => onDeliverBodyChange(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
              <div className="bg-muted/50 border rounded-lg p-3 text-sm">
                <p className="font-semibold mb-2">Verfügbare Platzhalter:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• {'{'}gallery_name{'}'} - Name der Galerie</li>
                  <li>• {'{'}download_link{'}'} - Download-Link für finale Dateien</li>
                  <li>• {'{'}client_emails{'}'} - E-Mail-Adressen der Kunden</li>
                  <li>• {'{'}salutation{'}'} - Anrede (Du/Sie)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
