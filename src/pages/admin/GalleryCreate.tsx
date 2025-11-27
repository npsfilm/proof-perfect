import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGalleries } from '@/hooks/useGalleries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft } from 'lucide-react';

export default function GalleryCreate() {
  const navigate = useNavigate();
  const { createGallery } = useGalleries();
  const [formData, setFormData] = useState({
    name: '',
    package_target_count: 20,
    salutation_type: 'Du' as 'Du' | 'Sie',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createGallery.mutateAsync(formData);
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
        <h1 className="text-3xl font-bold text-foreground">Create Gallery</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Gallery Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Sunset Villa Shoot"
                required
                disabled={createGallery.isPending}
              />
              <p className="text-xs text-muted-foreground">
                A URL-friendly slug will be automatically generated
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target">Target Package Count</Label>
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
                Number of photos included in the client's package
              </p>
            </div>

            <div className="space-y-3">
              <Label>Salutation Type</Label>
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
                    Du (informal)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Sie" id="sie" />
                  <Label htmlFor="sie" className="font-normal cursor-pointer">
                    Sie (formal)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/galleries')}
                disabled={createGallery.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createGallery.isPending}>
                {createGallery.isPending ? 'Creating...' : 'Create Gallery'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
