import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StagingReference } from '@/types/database';

interface ReviewReferencesCardProps {
  stagingReferences: StagingReference[];
}

export function ReviewReferencesCard({ stagingReferences }: ReviewReferencesCardProps) {
  if (!stagingReferences || stagingReferences.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Referenzbilder ({stagingReferences.length})</CardTitle>
        <CardDescription className="text-xs">Staging-Referenzen</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {stagingReferences.map((ref) => (
            <div key={ref.id} className="space-y-1">
              <div className="aspect-square rounded-md overflow-hidden border border-primary">
                <img
                  src={ref.file_url}
                  alt="Staging Referenz"
                  className="w-full h-full object-cover"
                />
              </div>
              {ref.notes && (
                <p className="text-[10px] text-muted-foreground line-clamp-1">{ref.notes}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
