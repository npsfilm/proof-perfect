import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Code } from 'lucide-react';
import { SalutationType } from './types';

interface EmailHtmlEditorProps {
  htmlContentDu: string;
  htmlContentSie: string;
  onChangeDu: (value: string) => void;
  onChangeSie: (value: string) => void;
  salutation: SalutationType;
}

export function EmailHtmlEditor({
  htmlContentDu,
  htmlContentSie,
  onChangeDu,
  onChangeSie,
  salutation,
}: EmailHtmlEditorProps) {
  const isShowingDu = salutation === 'du';
  const currentContent = isShowingDu ? htmlContentDu : htmlContentSie;
  const onChange = isShowingDu ? onChangeDu : onChangeSie;

  return (
    <div className="space-y-4">
      <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>HTML-Modus</AlertTitle>
        <AlertDescription>
          Der HTML-Code überschreibt den Baukasten-Inhalt. Änderungen hier werden nicht im 
          Baukasten-Modus sichtbar sein. Verwenden Sie diesen Modus nur, wenn Sie volle 
          Kontrolle über das HTML benötigen.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML-Code
            </CardTitle>
            <Badge variant="outline">
              {isShowingDu ? 'Du-Form' : 'Sie-Form'}
            </Badge>
          </div>
          <CardDescription>
            Fügen Sie hier Ihren vollständigen HTML-Code ein. Platzhalter wie {'{vorname}'} 
            funktionieren auch im HTML-Modus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={currentContent}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>E-Mail</title>
</head>
<body>
  <h1>Guten Tag, {anrede} {nachname}</h1>
  <p>Ihr E-Mail-Inhalt hier...</p>
</body>
</html>`}
            className="font-mono text-sm min-h-[400px]"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Verfügbare Platzhalter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              '{vorname}', '{nachname}', '{anrede}', '{vollständige_anrede}',
              '{gruss_formal}', '{gruss_informal}', '{firma}', '{email}',
              '{gallery_name}', '{gallery_url}', '{action_url}', '{year}'
            ].map((placeholder) => (
              <Badge
                key={placeholder}
                variant="outline"
                className="font-mono text-xs cursor-pointer hover:bg-accent"
                onClick={() => navigator.clipboard.writeText(placeholder)}
              >
                {placeholder}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Klicken zum Kopieren
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
