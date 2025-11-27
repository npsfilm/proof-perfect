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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Galerie-URL</p>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-muted/50 px-3 py-2 rounded-xl flex-1 overflow-x-auto font-mono">
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

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Paket-Ziel</p>
            <p className="text-2xl font-bold text-primary">{gallery.package_target_count}</p>
            <p className="text-xs text-muted-foreground">Fotos</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Hochgeladen</p>
            <p className="text-2xl font-bold">{photoCount}</p>
            <p className="text-xs text-muted-foreground">Fotos</p>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Anrede</p>
          <p className="text-lg font-semibold">{gallery.salutation_type}</p>
        </div>

        {gallery.address && (
          <div className="space-y-1 pt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Adresse</p>
            <p className="font-medium whitespace-pre-line leading-relaxed">{gallery.address}</p>
          </div>
        )}
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
