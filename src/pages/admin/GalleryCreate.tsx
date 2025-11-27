import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleries } from '@/hooks/useGalleries';
import { useCompanies } from '@/hooks/useCompanies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function GalleryCreate() {
  const navigate = useNavigate();
  const { createGallery } = useGalleries();
  const { data: companies } = useCompanies();
  const [formData, setFormData] = useState({
    name: '',
    package_target_count: 20,
    salutation_type: 'Du' as 'Du' | 'Sie',
    company_id: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      company_id: formData.company_id || null,
    };
    const result = await createGallery.mutateAsync(submitData);
    if (result) {
      navigate(`/admin/galleries/${result.id}`);
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
              <Label htmlFor="name">Galerie-Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Sonnenuntergang Villa Shooting"
                required
                disabled={createGallery.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Ein URL-freundlicher Slug wird automatisch generiert
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Ziel-Paketanzahl</Label>
              <Input
                id="target"
                type="number"
                min={1}
                value={formData.package_target_count}
                onChange={(e) =>
                  setFormData({ ...formData, package_target_count: parseInt(e.target.value) })
                }
                required
                disabled={createGallery.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Anzahl der Fotos im Kundenpaket
              </p>
            </div>

            <div className="space-y-3">
              <Label>Anredeform</Label>
              <RadioGroup
                value={formData.salutation_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, salutation_type: value as 'Du' | 'Sie' })
                }
                disabled={createGallery.isPending}
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
                disabled={createGallery.isPending}
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
                disabled={createGallery.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={createGallery.isPending}>
                {createGallery.isPending ? 'Wird erstellt...' : 'Galerie erstellen'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
