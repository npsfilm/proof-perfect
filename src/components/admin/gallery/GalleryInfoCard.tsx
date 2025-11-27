import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Gallery } from '@/types/database';

interface GalleryInfoCardProps {
  gallery: Gallery;
  photoCount: number;
  companies?: Array<{ id: string; name: string }>;
  onCompanyChange: (companyId: string) => Promise<void>;
}

export function GalleryInfoCard({ gallery, photoCount, companies, onCompanyChange }: GalleryInfoCardProps) {
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Galerie-Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Galerie-URL</p>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
              {window.location.origin}/gallery/{gallery.slug}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`);
                toast({ title: 'Kopiert!', description: 'Galerie-URL in Zwischenablage kopiert' });
              }}
            >
              Kopieren
            </Button>
          </div>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Paket-Ziel</p>
          <p className="font-medium">{gallery.package_target_count} Fotos</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Anrede</p>
          <p className="font-medium">{gallery.salutation_type}</p>
        </div>
        {gallery.address && (
          <div>
            <p className="text-sm text-muted-foreground">Adresse</p>
            <p className="font-medium whitespace-pre-line">{gallery.address}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Hochgeladene Fotos</p>
          <p className="font-medium">{photoCount} Fotos</p>
        </div>
        <div className="pt-4 border-t">
          <Label htmlFor="company-select" className="text-sm text-muted-foreground">
            Unternehmen
          </Label>
          <Select
            value={gallery.company_id || 'none'}
            onValueChange={(value) => onCompanyChange(value === 'none' ? '' : value)}
            disabled={gallery.status !== 'Draft'}
          >
            <SelectTrigger id="company-select" className="mt-2">
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
      </CardContent>
    </Card>
  );
}
