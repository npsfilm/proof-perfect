import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { StagingRequestFlow } from './staging/StagingRequestFlow';
import { MyStagingRequestsList } from './staging/MyStagingRequestsList';
import { useDeliveredGalleries } from '@/hooks/useDeliveredGalleries';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { useAnsprache } from '@/contexts/AnspracheContext';

export function StagingRequestTab() {
  const { t } = useAnsprache();
  const { data: galleries, isLoading } = useDeliveredGalleries();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl">
        <LoadingState message="Galerien werden geladen..." />
      </div>
    );
  }

  if (!galleries || galleries.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl">
        <div className="text-center mb-10 md:mb-14 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Building2 className="h-3 w-3 mr-1" />
            Nachträgliches Staging
          </Badge>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            Staging für gelieferte Galerien
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            {t('Fordere virtuelles Staging für bereits gelieferte Galerien an.', 'Fordern Sie virtuelles Staging für bereits gelieferte Galerien an.')}
          </p>
        </div>
        <EmptyState
          icon={Building2}
          title="Keine gelieferten Galerien"
          description={t('Du hast noch keine gelieferten Galerien. Staging-Anfragen können nur für bereits gelieferte Galerien gestellt werden.', 'Sie haben noch keine gelieferten Galerien. Staging-Anfragen können nur für bereits gelieferte Galerien gestellt werden.')}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-5xl space-y-12">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14 animate-fade-in">
        <Badge variant="secondary" className="mb-4">
          <Building2 className="h-3 w-3 mr-1" />
          Nachträgliches Staging
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
          Staging für gelieferte Galerien
        </h1>
        <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
          {t('Fordere virtuelles Staging für bereits gelieferte Galerien an.', 'Fordern Sie virtuelles Staging für bereits gelieferte Galerien an.')}
        </p>
      </div>

      {/* Request Flow */}
      <StagingRequestFlow />

      {/* My Requests Section */}
      <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-semibold">Meine Staging-Anfragen</h2>
        <MyStagingRequestsList />
      </div>
    </div>
  );
}
