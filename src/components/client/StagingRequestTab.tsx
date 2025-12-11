import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { StagingRequestFlow } from './staging/StagingRequestFlow';
import { MyStagingRequestsList } from './staging/MyStagingRequestsList';
import { useDeliveredGalleries } from '@/hooks/useDeliveredGalleries';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Separator } from '@/components/ui/separator';
import { useAnsprache } from '@/contexts/AnspracheContext';

export function StagingRequestTab() {
  const { t } = useAnsprache();
  const { data: galleries, isLoading } = useDeliveredGalleries();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        <LoadingState message="Galerien werden geladen..." />
      </div>
    );
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl">
        <Card className="shadow-neu-flat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Nachträgliches Staging anfordern
            </CardTitle>
            <CardDescription>
              {t('Fordere virtuelles Staging für bereits gelieferte Galerien an.', 'Fordern Sie virtuelles Staging für bereits gelieferte Galerien an.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={Building2}
              title="Keine gelieferten Galerien"
              description={t('Du hast noch keine gelieferten Galerien. Staging-Anfragen können nur für bereits gelieferte Galerien gestellt werden.', 'Sie haben noch keine gelieferten Galerien. Staging-Anfragen können nur für bereits gelieferte Galerien gestellt werden.')}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-4xl space-y-8">
      <StagingRequestFlow />

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Meine Staging-Anfragen</h2>
        <MyStagingRequestsList />
      </div>
    </div>
  );
}
