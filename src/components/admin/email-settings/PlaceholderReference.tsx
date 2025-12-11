import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PlaceholderInfo {
  key: string;
  label: string;
  example: string;
  availableIn: string[];
}

const ALL_PLACEHOLDERS: PlaceholderInfo[] = [
  // Allgemein
  { key: 'vorname', label: 'Vorname', example: 'Max', availableIn: ['all'] },
  { key: 'nachname', label: 'Nachname', example: 'Mustermann', availableIn: ['all'] },
  { key: 'anrede', label: 'Anrede', example: 'Herr', availableIn: ['all'] },
  { key: 'email', label: 'E-Mail-Adresse', example: 'max@example.com', availableIn: ['all'] },
  { key: 'company_name', label: 'Firmenname', example: 'ImmoOnPoint', availableIn: ['all'] },
  { key: 'year', label: 'Aktuelles Jahr', example: '2024', availableIn: ['all'] },
  
  // System
  { key: 'action_url', label: 'Aktions-Link', example: 'https://app.immoonpoint.de/...', availableIn: ['system'] },
  { key: 'temp_password', label: 'Temporäres Passwort', example: 'TempPass123', availableIn: ['gallery_send'] },
  
  // Galerie
  { key: 'gallery_name', label: 'Galerie-Name', example: 'Musterstraße 123', availableIn: ['customer'] },
  { key: 'gallery_address', label: 'Immobilien-Adresse', example: 'Musterstraße 123, 12345 Berlin', availableIn: ['customer'] },
  { key: 'gallery_url', label: 'Galerie-Link', example: 'https://app.immoonpoint.de/gallery/...', availableIn: ['customer'] },
  { key: 'photo_count', label: 'Anzahl Fotos', example: '45', availableIn: ['gallery_send'] },
  { key: 'selected_count', label: 'Ausgewählte Fotos', example: '25', availableIn: ['gallery_review'] },
  { key: 'staging_count', label: 'Staging-Anfragen', example: '3', availableIn: ['customer'] },
  { key: 'download_url', label: 'Download-Link', example: 'https://app.immoonpoint.de/...', availableIn: ['gallery_deliver'] },
  
  // Newsletter
  { key: 'cta_url', label: 'CTA-Link', example: 'https://immoonpoint.de/...', availableIn: ['newsletter'] },
  { key: 'unsubscribe_url', label: 'Abmelde-Link', example: 'https://app.immoonpoint.de/unsubscribe/...', availableIn: ['newsletter'] },
];

export function PlaceholderReference() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`{${key}}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const groupedPlaceholders = {
    allgemein: ALL_PLACEHOLDERS.filter(p => p.availableIn.includes('all')),
    system: ALL_PLACEHOLDERS.filter(p => p.availableIn.includes('system')),
    kunde: ALL_PLACEHOLDERS.filter(p => 
      p.availableIn.includes('customer') || 
      p.availableIn.includes('gallery_send') || 
      p.availableIn.includes('gallery_review') ||
      p.availableIn.includes('gallery_deliver')
    ),
    newsletter: ALL_PLACEHOLDERS.filter(p => p.availableIn.includes('newsletter')),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <Info className="h-5 w-5 text-primary mt-0.5" />
        <div className="text-sm">
          <p className="font-medium mb-1">So verwenden Sie Platzhalter</p>
          <p className="text-muted-foreground">
            Platzhalter werden automatisch durch die tatsächlichen Werte ersetzt, wenn eine E-Mail gesendet wird. 
            Klicken Sie auf einen Platzhalter, um ihn zu kopieren, und fügen Sie ihn dann in Ihr Template ein.
          </p>
        </div>
      </div>

      {Object.entries(groupedPlaceholders).map(([group, placeholders]) => (
        <Card key={group}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base capitalize">
              {group === 'kunde' ? 'Kunden-E-Mails' : 
               group === 'allgemein' ? 'Allgemein (in allen E-Mails)' : 
               group}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Platzhalter</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Beispiel</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholders.map((p) => (
                  <TableRow key={p.key}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {`{${p.key}}`}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.label}</TableCell>
                    <TableCell className="text-muted-foreground">{p.example}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(p.key)}
                        className="h-8 w-8"
                      >
                        {copiedKey === p.key ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
