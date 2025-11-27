import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClient, CreateClientData } from '@/hooks/useClients';
import { useCompanies } from '@/hooks/useCompanies';
import { Loader2 } from 'lucide-react';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated?: (client: any) => void;
}

export const AddClientDialog = ({ open, onOpenChange, onClientCreated }: AddClientDialogProps) => {
  const { data: companies } = useCompanies();
  const createClient = useCreateClient();
  
  const [formData, setFormData] = useState<CreateClientData>({
    email: '',
    anrede: undefined,
    vorname: '',
    nachname: '',
    ansprache: 'Sie',
    company_id: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const client = await createClient.mutateAsync(formData);
      onClientCreated?.(client);
      onOpenChange(false);
      setFormData({
        email: '',
        anrede: undefined,
        vorname: '',
        nachname: '',
        ansprache: 'Sie',
        company_id: undefined,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Neuen Kunden hinzufügen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anrede">Anrede</Label>
                <Select
                  value={formData.anrede || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, anrede: value === 'none' ? undefined : value as any })}
                >
                  <SelectTrigger id="anrede">
                    <SelectValue placeholder="Auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine</SelectItem>
                    <SelectItem value="Herr">Herr</SelectItem>
                    <SelectItem value="Frau">Frau</SelectItem>
                    <SelectItem value="Divers">Divers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ansprache">Ansprache *</Label>
                <Select
                  value={formData.ansprache}
                  onValueChange={(value: 'Du' | 'Sie') => setFormData({ ...formData, ansprache: value })}
                  required
                >
                  <SelectTrigger id="ansprache">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Du">Du</SelectItem>
                    <SelectItem value="Sie">Sie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vorname">Vorname *</Label>
                <Input
                  id="vorname"
                  value={formData.vorname}
                  onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                  placeholder="Max"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={formData.nachname}
                  onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                  placeholder="Mustermann"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="max@beispiel.de"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Unternehmen (Optional)</Label>
              <Select
                value={formData.company_id || 'none'}
                onValueChange={(value) => setFormData({ ...formData, company_id: value === 'none' ? undefined : value })}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Unternehmen auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keines</SelectItem>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createClient.isPending}>
              {createClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kunde erstellen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
