import { GallerySelectionStats } from '@/types/database';
import { CostCalculatorModal } from '@/components/client/CostCalculatorModal';
import { QuickDownloadsModal } from '@/components/client/QuickDownloadsModal';
import { ReopenRequestModal } from '@/components/client/ReopenRequestModal';
import { ReopenModalState } from './types';

interface DashboardModalsProps {
  calculatorOpen: boolean;
  setCalculatorOpen: (open: boolean) => void;
  downloadsOpen: boolean;
  setDownloadsOpen: (open: boolean) => void;
  reopenModal: ReopenModalState;
  setReopenModal: (state: ReopenModalState) => void;
  deliveredGalleries: GallerySelectionStats[];
}

export function DashboardModals({
  calculatorOpen,
  setCalculatorOpen,
  downloadsOpen,
  setDownloadsOpen,
  reopenModal,
  setReopenModal,
  deliveredGalleries,
}: DashboardModalsProps) {
  return (
    <>
      <CostCalculatorModal
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
      />

      <QuickDownloadsModal
        open={downloadsOpen}
        onOpenChange={setDownloadsOpen}
        deliveredGalleries={deliveredGalleries}
      />

      <ReopenRequestModal
        open={!!reopenModal.galleryId}
        onOpenChange={(open) => {
          if (!open) {
            setReopenModal({ galleryId: null, galleryName: '' });
          }
        }}
        galleryId={reopenModal.galleryId || ''}
        galleryName={reopenModal.galleryName}
      />
    </>
  );
}
