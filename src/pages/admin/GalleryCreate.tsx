import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGallery } from '@/hooks/useGalleries';
import { useCompanies } from '@/hooks/useCompanies';
import { Client } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ClientPicker } from '@/components/admin/ClientPicker';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

export default function GalleryCreate() {
  const navigate = useNavigate();
  const createGalleryMutation = useCreateGallery();
  const { data: companies } = useCompanies();
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    package_target_count: 20,
    salutation_type: 'Du' as 'Du' | 'Sie',
    company_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClients.length === 0) {
      toast({
        title: 'Keine Kunden ausgewählt',
        description: 'Bitte wählen Sie mindestens einen Kunden für die Galerie aus.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const submitData = {
        name: formData.name,
        address: formData.address || null,
        package_target_count: formData.package_target_count,
        salutation_type: formData.salutation_type,
        company_id: formData.company_id || null,
      };
      
      const result = await createGalleryMutation.mutateAsync(submitData);
      
      if (result) {
        // Link clients to gallery
        const galleryClients = selectedClients.map(client => ({
          gallery_id: result.id,
          client_id: client.id,
        }));

        const { error: linkError } = await supabase
          .from('gallery_clients')
          .insert(galleryClients);

        if (linkError) {
          console.error('Error linking clients:', linkError);
          toast({
            title: 'Warnung',
            description: 'Galerie erstellt, aber Kunden konnten nicht verknüpft werden.',
            variant: 'destructive',
          });
        }

        navigate(`/admin/galleries/${result.id}`);
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/galleries')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Galerie erstellen</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Galerie-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Galerie-Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Sonnenuntergang Villa Shooting"
                required
                disabled={createGalleryMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Ein URL-freundlicher Slug wird automatisch generiert
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse (Optional)</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Musterstraße 123, 12345 Musterstadt"
                rows={2}
                disabled={createGalleryMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Die Adresse der Immobilie oder des Shooting-Ortes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Ziel-Paketanzahl *</Label>
              <Input
                id="target"
                type="number"
                min={1}
                value={formData.package_target_count}
                onChange={(e) =>
                  setFormData({ ...formData, package_target_count: parseInt(e.target.value) })
                }
                required
                disabled={createGalleryMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Anzahl der Fotos im Kundenpaket
              </p>
            </div>

            <ClientPicker
              selectedClients={selectedClients}
              onClientsChange={setSelectedClients}
              disabled={createGalleryMutation.isPending}
            />

            <div className="space-y-3">
              <Label>Anredeform (Standard für Kunden-Kommunikation) *</Label>
              <RadioGroup
                value={formData.salutation_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, salutation_type: value as 'Du' | 'Sie' })
                }
                disabled={createGalleryMutation.isPending}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Du" id="du" />
                  <Label htmlFor="du" className="font-normal cursor-pointer">
                    Du (informell)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sie" id="sie" />
                  <Label htmlFor="sie" className="font-normal cursor-pointer">
                    Sie (formell)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Unternehmen (Optional)</Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value === 'none' ? '' : value })}
                disabled={createGalleryMutation.isPending}
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
              <p className="text-xs text-muted-foreground">
                Diese Galerie einem Unternehmen zur Organisation zuweisen
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/galleries')}
                disabled={createGalleryMutation.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createGalleryMutation.isPending}>
                {createGalleryMutation.isPending ? 'Wird erstellt...' : 'Galerie erstellen'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
