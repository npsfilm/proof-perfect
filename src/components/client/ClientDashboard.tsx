import { useState } from 'react';
import { RefreshCw, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading-state';
import { EmptyState } from '@/components/ui/empty-state';
import { DashboardHero } from '@/components/client/DashboardHero';
import { QuickActionsGrid } from '@/components/client/QuickActionsGrid';
import {
  ReopenModalState,
  useClientDashboardData,
  ActiveGalleriesSection,
  ClosedGalleriesSection,
  DeliveredGalleriesSection,
  DashboardModals,
} from './dashboard';

export function ClientDashboard() {
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [reopenModal, setReopenModal] = useState<ReopenModalState>({
    galleryId: null,
    galleryName: '',
  });

  const {
    clientProfile,
    stats,
    isLoading,
    refetch,
    coverPhotos,
    gallerySections,
    openStagingCount,
    isNewGallery,
    getButtonConfig,
  } = useClientDashboardData(setReopenModal);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 lg:px-6 py-8">
        <LoadingState message="Galerien werden geladen..." />
      </div>
    );
  }

  const hasNoGalleries = !stats || stats.length === 0;
  const { activeGalleries, closedGalleries, completedGalleries } = gallerySections;

  return (
    <div className="container mx-auto px-4 lg:px-6 py-8 max-w-[1920px]">
      <div className="space-y-8 pb-8">
        {/* Hero Welcome Section */}
        <DashboardHero 
          clientName={clientProfile?.nachname}
          anrede={clientProfile?.anrede}
        />

        {/* Quick Actions Grid */}
        <QuickActionsGrid
          deliveredCount={completedGalleries.length}
          stagingRequestsCount={openStagingCount}
          onOpenDownloads={() => setDownloadsOpen(true)}
        />

        {/* Refresh Button */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Meine Projekte</h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Aktualisieren"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {hasNoGalleries ? (
          <EmptyState
            icon={FolderOpen}
            title="Keine Galerien zugewiesen"
            description="Ihnen wurden noch keine Galerien zugewiesen. Buchen Sie jetzt Ihr erstes Shooting!"
          />
        ) : (
          <>
            <ActiveGalleriesSection
              galleries={activeGalleries}
              coverPhotos={coverPhotos}
              getButtonConfig={getButtonConfig}
            />

            <ClosedGalleriesSection
              galleries={closedGalleries}
              getButtonConfig={getButtonConfig}
              isNewGallery={isNewGallery}
            />

            <DeliveredGalleriesSection
              galleries={completedGalleries}
              coverPhotos={coverPhotos}
              getButtonConfig={getButtonConfig}
            />

            {activeGalleries.length === 0 && (
              <EmptyState
                icon={FolderOpen}
                title="Keine aktiven Projekte"
                description="Alle Ihre Galerien sind abgeschlossen."
              />
            )}
          </>
        )}
      </div>

      <DashboardModals
        calculatorOpen={calculatorOpen}
        setCalculatorOpen={setCalculatorOpen}
        downloadsOpen={downloadsOpen}
        setDownloadsOpen={setDownloadsOpen}
        reopenModal={reopenModal}
        setReopenModal={setReopenModal}
        deliveredGalleries={completedGalleries}
      />
    </div>
  );
}
