import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useEmailTemplates } from '@/hooks/useEmailTemplates';
import { useEmailDesignSettings } from '@/hooks/useEmailDesignSettings';
import { EmailTemplate, SalutationType } from './types';
import { EmailPreview } from './EmailPreview';
import { supabase } from '@/integrations/supabase/client';

export function EmailTestSender() {
  const { templates } = useEmailTemplates();
  const { settings: designSettings } = useEmailDesignSettings();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [salutation, setSalutation] = useState<SalutationType>('sie');
  const [testEmail, setTestEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleSendTest = async () => {
    if (!selectedTemplate || !testEmail) return;

    setIsSending(true);
    setSendResult(null);

    try {
      // Note: This would need an edge function to actually send
      // For now, we'll just simulate success
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          template_key: selectedTemplate.template_key,
          to_email: testEmail,
          salutation,
        },
      });

      if (error) throw error;

      setSendResult({
        success: true,
        message: `Test-E-Mail wurde an ${testEmail} gesendet.`,
      });
    } catch (error: any) {
      setSendResult({
        success: false,
        message: error.message || 'Fehler beim Senden der Test-E-Mail.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Panel */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Test-E-Mail senden</CardTitle>
            <CardDescription>
              Senden Sie eine Test-E-Mail, um Ihre Templates zu überprüfen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template auswählen</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Template wählen..." />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                        {template.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ansprache</Label>
              <Select value={salutation} onValueChange={(v) => setSalutation(v as SalutationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sie">Sie (Formal)</SelectItem>
                  <SelectItem value="du">Du (Informal)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Empfänger E-Mail</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            <Button 
              onClick={handleSendTest} 
              disabled={!selectedTemplate || !testEmail || isSending}
              className="w-full"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Test-E-Mail senden
            </Button>

            {sendResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                sendResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {sendResult.success ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{sendResult.message}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Hinweis:</strong> Die Test-E-Mail verwendet Beispiel-Platzhalter.
              </p>
              <p>
                Überprüfen Sie die Vorschau rechts, bevor Sie die Test-E-Mail senden.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Panel */}
      <div>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Vorschau</CardTitle>
            <CardDescription>
              {selectedTemplate ? selectedTemplate.name : 'Wählen Sie ein Template aus'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {designSettings && selectedTemplate ? (
              <EmailPreview
                settings={designSettings}
                template={selectedTemplate}
                salutation={salutation}
              />
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Wählen Sie ein Template aus
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
