import { useState } from 'react';
import { Gallery } from '@/types/database';
import { FormSection } from '@/components/admin/FormSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useUpdateGallery } from '@/hooks/useGalleries';
import { MapPin, Package, MessageSquare, Building2, Save, X } from 'lucide-react';

interface EditableGalleryInfoProps {
  gallery: Gallery;
  companies?: Array<{ id: string; name: string }>;
  photoCount: number;
  isDraft: boolean;
}

export function EditableGalleryInfo({ gallery, companies, photoCount, isDraft }: EditableGalleryInfoProps) {
  const updateGalleryMutation = useUpdateGallery();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: gallery.name,
    address: gallery.address || '',
    package_target_count: gallery.package_target_count,
    salutation_type: gallery.salutation_type,
    company_id: gallery.company_id || '',
  });

  const hasChanges = 
    formData.name !== gallery.name ||
    formData.address !== (gallery.address || '') ||
    formData.package_target_count !== gallery.package_target_count ||
    formData.salutation_type !== gallery.salutation_type ||
    formData.company_id !== (gallery.company_id || '');

  const handleSave = async () => {
    try {
      await updateGalleryMutation.mutateAsync({
        id: gallery.id,
        name: formData.name,
        address: formData.address || null,
        package_target_count: formData.package_target_count,
        salutation_type: formData.salutation_type,
        company_id: formData.company_id || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating gallery:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: gallery.name,
      address: gallery.address || '',
      package_target_count: gallery.package_target_count,
      salutation_type: gallery.salutation_type,
      company_id: gallery.company_id || '',
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    if (isDraft) {
      setIsEditing(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Objekt-Details */}
      <FormSection
        icon={<MapPin className="h-5 w-5" />}
        title="Objekt-Details"
        description={isEditing ? "Bearbeiten Sie die Grundinformationen" : "Grundinformationen zur Immobilie"}
      >
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Galerie-Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Moderne Villa am See"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Immobilien-Adresse</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Musterstraße 123, 12345 Musterstadt"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4" onClick={handleStartEdit}>
            <div className={isDraft ? 'cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors' : ''}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Galerie-Name</p>
              <p className="text-lg font-semibold mt-1">{gallery.name}</p>
            </div>

            {gallery.address && (
              <div className={isDraft ? 'cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors' : ''}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Adresse</p>
                <p className="font-medium mt-1 whitespace-pre-line leading-relaxed">{gallery.address}</p>
              </div>
            )}

            {!gallery.address && isDraft && (
              <div className="cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors">
                <p className="text-sm text-muted-foreground italic">Klicken Sie zum Hinzufügen einer Adresse</p>
              </div>
            )}
          </div>
        )}
      </FormSection>

      {/* Paket-Einstellungen */}
      <FormSection
        icon={<Package className="h-5 w-5" />}
        title="Paket-Einstellungen"
        description={isEditing ? "Passen Sie die Einstellungen an" : "Foto-Anzahl und Kommunikationsform"}
      >
        {isEditing ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-target">Ziel-Paketanzahl *</Label>
              <Input
                id="edit-target"
                type="number"
                min={1}
                value={formData.package_target_count}
                onChange={(e) =>
                  setFormData({ ...formData, package_target_count: parseInt(e.target.value) })
                }
                required
                className="text-base"
              />
            </div>

            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Anredeform *
              </Label>
              <RadioGroup
                value={formData.salutation_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, salutation_type: value as 'Du' | 'Sie' })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Du" id="edit-du" />
                  <Label htmlFor="edit-du" className="font-normal cursor-pointer">
                    Du (informell)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sie" id="edit-sie" />
                  <Label htmlFor="edit-sie" className="font-normal cursor-pointer">
                    Sie (formell)
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4" onClick={handleStartEdit}>
            <div className={isDraft ? 'cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors' : ''}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Paket-Ziel</p>
              <p className="text-2xl font-bold text-primary mt-1">{gallery.package_target_count}</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>

            <div className={isDraft ? 'cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors' : ''}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Anrede</p>
              <p className="text-lg font-semibold mt-1">{gallery.salutation_type}</p>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Hochgeladene Fotos</p>
            <p className="text-2xl font-bold mt-1">{photoCount}</p>
          </div>
        )}
      </FormSection>

      {/* Organisation */}
      <FormSection
        icon={<Building2 className="h-5 w-5" />}
        title="Organisation"
        description={isEditing ? "Unternehmenszuordnung ändern" : "Unternehmenszuordnung"}
      >
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="edit-company">Unternehmen</Label>
            <Select
              value={formData.company_id}
              onValueChange={(value) => setFormData({ ...formData, company_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger id="edit-company">
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
        ) : (
          <div className={isDraft ? 'cursor-pointer hover:bg-muted/50 p-3 rounded-xl transition-colors' : ''} onClick={handleStartEdit}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Unternehmen</p>
            <p className="font-medium mt-1">
              {gallery.company_id 
                ? companies?.find(c => c.id === gallery.company_id)?.name || 'Unbekannt'
                : 'Keines zugewiesen'}
            </p>
          </div>
        )}
      </FormSection>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex items-center justify-end gap-3 p-4 bg-muted/50 rounded-xl">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={updateGalleryMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateGalleryMutation.isPending || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            {updateGalleryMutation.isPending ? 'Speichert...' : 'Änderungen speichern'}
          </Button>
        </div>
      )}

      {isDraft && !isEditing && (
        <p className="text-sm text-muted-foreground text-center italic">
          💡 Klicken Sie auf einen Bereich, um ihn zu bearbeiten
        </p>
      )}
    </div>
  );
}
