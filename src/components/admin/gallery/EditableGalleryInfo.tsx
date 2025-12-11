import { useState } from 'react';
import { Gallery } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpdateGallery } from '@/hooks/useGalleries';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Target, Camera, MessageSquare, Building2, Pencil, Save, X, Copy, Link } from 'lucide-react';

interface EditableGalleryInfoProps {
  gallery: Gallery;
  companies?: Array<{ id: string; name: string }>;
  photoCount: number;
  isDraft: boolean;
}

export function EditableGalleryInfo({ gallery, companies, photoCount, isDraft }: EditableGalleryInfoProps) {
  const { toast } = useToast();
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

  const copyGalleryUrl = () => {
    const url = `${window.location.origin}/gallery/${gallery.slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'URL kopiert', description: 'Die Galerie-URL wurde in die Zwischenablage kopiert.' });
  };

  const companyName = gallery.company_id 
    ? companies?.find(c => c.id === gallery.company_id)?.name || 'Unbekannt'
    : 'Keines';

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Galerie bearbeiten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Galerie-Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Moderne Villa am See"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-target">Ziel-Fotos *</Label>
              <Input
                id="edit-target"
                type="number"
                min={1}
                value={formData.package_target_count}
                onChange={(e) =>
                  setFormData({ ...formData, package_target_count: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-address">Adresse</Label>
            <Textarea
              id="edit-address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Musterstraße 123, 12345 Musterstadt"
              rows={2}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Anredeform *</Label>
              <RadioGroup
                value={formData.salutation_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, salutation_type: value as 'Du' | 'Sie' })
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Du" id="edit-du" />
                  <Label htmlFor="edit-du" className="font-normal cursor-pointer">Du</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sie" id="edit-sie" />
                  <Label htmlFor="edit-sie" className="font-normal cursor-pointer">Sie</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company">Unternehmen</Label>
              <Select
                value={formData.company_id || 'none'}
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
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={updateGalleryMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Abbrechen
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateGalleryMutation.isPending || !hasChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              {updateGalleryMutation.isPending ? 'Speichert...' : 'Speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">{gallery.name}</CardTitle>
            {gallery.address && (
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{gallery.address}</span>
              </p>
            )}
          </div>
          {isDraft && (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Target className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{gallery.package_target_count}</p>
              <p className="text-xs text-muted-foreground">Ziel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Camera className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{photoCount}</p>
              <p className="text-xs text-muted-foreground">Fotos</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{gallery.salutation_type}</p>
              <p className="text-xs text-muted-foreground">Anrede</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{companyName}</p>
              <p className="text-xs text-muted-foreground">Firma</p>
            </div>
          </div>
        </div>

        {/* URL Row */}
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
          <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-muted-foreground truncate flex-1">
            /gallery/{gallery.slug}
          </span>
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={copyGalleryUrl}>
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
