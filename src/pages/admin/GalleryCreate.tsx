import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateGallery } from '@/hooks/useGalleries';
import { useCompanies } from '@/hooks/useCompanies';
import { Client } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ClientPicker } from '@/components/admin/ClientPicker';
import { FormSection } from '@/components/admin/FormSection';
import { PageHeader } from '@/components/admin/PageHeader';
import { PageContainer } from '@/components/admin/PageContainer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MapPin, MessageSquare, Building2, GraduationCap } from 'lucide-react';

export default function GalleryCreate() {
  const navigate = useNavigate();
  const createGalleryMutation = useCreateGallery();
  const { data: companies } = useCompanies();
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    package_target_count: 20,
    salutation_type: 'Du' as 'Du' | 'Sie',
    company_id: '',
    show_onboarding: false,
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
        package_target_count: formData.package_target_count,
        salutation_type: formData.salutation_type,
        company_id: formData.company_id || null,
        show_onboarding: formData.show_onboarding,
      };
      
      const result = await createGalleryMutation.mutateAsync(submitData);
      
      if (result) {
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
    <PageContainer size="full">
      <PageHeader
        title="Neue Galerie erstellen"
        breadcrumbs={[
          { label: 'Galerien', href: '/admin/galleries' },
          { label: 'Neue Galerie' },
        ]}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Objekt-Details */}
            <FormSection
              icon={<MapPin className="h-5 w-5" />}
              title="Objekt-Details"
              description="Grundinformationen zur Immobilie"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  Galerie-Name
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Moderne Villa am See"
                  required
                  disabled={createGalleryMutation.isPending}
                  className="text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Ein URL-freundlicher Slug wird automatisch generiert
                </p>
              </div>
            </FormSection>

            {/* Paket-Einstellungen */}
            <FormSection
              icon={<MessageSquare className="h-5 w-5" />}
              title="Kommunikationsform"
              description="Anredeform für E-Mails und Benachrichtigungen"
            >
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  Anredeform
                  <span className="text-destructive">*</span>
                </Label>
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
            </FormSection>

            {/* Onboarding */}
            <FormSection
              icon={<GraduationCap className="h-5 w-5" />}
              title="Onboarding"
              description="Optionales Tutorial beim ersten Galeriebesuch"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="onboarding" className="text-base">
                    Tutorial anzeigen
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Zeigt beim ersten Besuch ein Tutorial-Popup für Kunden
                  </p>
                </div>
                <Switch
                  id="onboarding"
                  checked={formData.show_onboarding}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, show_onboarding: checked })
                  }
                  disabled={createGalleryMutation.isPending}
                />
              </div>
            </FormSection>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Kunden */}
            <FormSection
              title="Kunden"
              description="Wer erhält Zugriff auf diese Galerie?"
              className="border-primary/20"
            >
              <ClientPicker
                selectedClients={selectedClients}
                onClientsChange={setSelectedClients}
                disabled={createGalleryMutation.isPending}
              />
              {selectedClients.length > 0 && (
                <div className="pt-2 text-xs text-muted-foreground">
                  ✓ {selectedClients.length} {selectedClients.length === 1 ? 'Kunde' : 'Kunden'} ausgewählt
                </div>
              )}
              {selectedClients.length === 0 && (
                <div className="pt-2 text-xs text-destructive">
                  Mindestens 1 Kunde erforderlich
                </div>
              )}
            </FormSection>

            {/* Organisation */}
            <FormSection
              icon={<Building2 className="h-5 w-5" />}
              title="Organisation"
              description="Optional einem Unternehmen zuweisen"
            >
              <div className="space-y-2">
                <Label htmlFor="company">Unternehmen</Label>
                <Select
                  value={formData.company_id}
                  onValueChange={(value) => setFormData({ ...formData, company_id: value === 'none' ? '' : value })}
                  disabled={createGalleryMutation.isPending}
                >
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Keines" />
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
            </FormSection>
          </div>
        </div>

        {/* Sticky Footer with Actions */}
        <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t shadow-neu-float p-4 -mx-4 rounded-t-[2rem]">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/galleries')}
              disabled={createGalleryMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button 
              type="submit" 
              disabled={createGalleryMutation.isPending || selectedClients.length === 0}
              size="lg"
            >
              {createGalleryMutation.isPending ? 'Wird erstellt...' : 'Galerie erstellen →'}
            </Button>
          </div>
        </div>
      </form>
    </PageContainer>
  );
}
