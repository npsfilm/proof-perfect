import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClientPicker } from '@/components/admin/ClientPicker';
import { Client } from '@/types/database';

interface GalleryClientsCardProps {
  selectedClients: Client[];
  onClientsChange: (clients: Client[]) => void;
  disabled: boolean;
}

export function GalleryClientsCard({ selectedClients, onClientsChange, disabled }: GalleryClientsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kunden</CardTitle>
        <CardDescription>Wählen Sie die Kunden aus, die Zugriff auf diese Galerie haben sollen</CardDescription>
      </CardHeader>
      <CardContent>
        <ClientPicker
          selectedClients={selectedClients}
          onClientsChange={onClientsChange}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
