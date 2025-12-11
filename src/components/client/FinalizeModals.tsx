import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Photo } from '@/types/database';
import { useSignedPhotoUrls } from '@/hooks/useSignedPhotoUrls';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useAnsprache } from '@/contexts/AnspracheContext';

import {
  FinalizeStepIndicator,
  FinalizeStepFeedback,
  FinalizeStepServices,
  FinalizeStepStaging,
  FinalizeStepBlueHour,
  FinalizeStepSummary,
  FinalizeFooterButtons,
  useFinalizeFlow,
  FinalizeModalsProps,
} from './finalize';

export type { FinalizeModalsProps } from './finalize';

function getStepInfo(step: string, selectedPhotosCount: number, t: (du: string, sie: string) => string) {
  switch (step) {
    case 'feedback':
      return { 
        title: t('Teile dein Feedback', 'Teilen Sie Ihr Feedback'), 
        description: t(`Du hast ${selectedPhotosCount} Fotos ausgewählt`, `Sie haben ${selectedPhotosCount} Fotos ausgewählt`) 
      };
    case 'services':
      return { 
        title: 'Zusatzleistungen wählen', 
        description: t('Wähle die gewünschten Zusatzleistungen für deine Fotos', 'Wählen Sie die gewünschten Zusatzleistungen für Ihre Fotos') 
      };
    case 'staging':
      return { 
        title: 'Virtuelles Staging', 
        description: t('Wähle die Fotos für virtuelles Staging aus', 'Wählen Sie die Fotos für virtuelles Staging aus') 
      };
    case 'blueHour':
      return { 
        title: 'Virtuelle Blaue Stunde', 
        description: t('Wähle die Fotos für die virtuelle blaue Stunde aus', 'Wählen Sie die Fotos für die virtuelle blaue Stunde aus') 
      };
    case 'summary':
      return { 
        title: t('Zusammenfassung deiner Auswahl', 'Zusammenfassung Ihrer Auswahl'), 
        description: t('Bitte überprüfe deine Auswahl vor der Finalisierung', 'Bitte überprüfen Sie Ihre Auswahl vor der Finalisierung') 
      };
    default:
      return { title: '', description: '' };
  }
}

export function FinalizeModals({ isOpen, onClose, selectedPhotos, onFinalize }: FinalizeModalsProps) {
  const isMobile = useIsMobile();
  const { signedUrls } = useSignedPhotoUrls(selectedPhotos);
  const { t } = useAnsprache();
  
  const flow = useFinalizeFlow(selectedPhotos, onFinalize, onClose);

  // Photo numbering map
  const photoNumberMap = useMemo(() => 
    selectedPhotos.reduce((acc, photo, index) => {
      acc[photo.id] = index + 1;
      return acc;
    }, {} as Record<string, number>),
    [selectedPhotos]
  );

  const stagingCount = Object.values(flow.stagingSelections).filter(v => v).length;
  const blueHourCount = Object.values(flow.blueHourSelections).filter(v => v).length;

  const { title, description } = getStepInfo(flow.step, selectedPhotos.length, t);

  // Render step content
  const renderStepContent = () => {
    switch (flow.step) {
      case 'feedback':
        return (
          <FinalizeStepFeedback
            selectedPhotos={selectedPhotos}
            signedUrls={signedUrls}
            photoNumberMap={photoNumberMap}
            feedback={flow.feedback}
            onFeedbackChange={flow.setFeedback}
            isMobile={isMobile}
          />
        );
      case 'services':
        return (
          <FinalizeStepServices
            selectedServices={flow.selectedServices}
            onToggleService={flow.toggleService}
            isBlueHourInfoExpanded={flow.isBlueHourInfoExpanded}
            onToggleBlueHourInfo={flow.setIsBlueHourInfoExpanded}
            isMobile={isMobile}
          />
        );
      case 'staging':
        return (
          <FinalizeStepStaging
            selectedPhotos={selectedPhotos}
            signedUrls={signedUrls}
            photoNumberMap={photoNumberMap}
            stagingSelections={flow.stagingSelections}
            stagingStyle={flow.stagingStyle}
            stagingComment={flow.stagingComment}
            referenceFile={flow.referenceFile}
            expressDelivery={flow.selectedServices.expressDelivery}
            blueHourCount={blueHourCount}
            onStagingToggle={flow.handleStagingToggle}
            onSelectAll={flow.selectAllStaging}
            onDeselectAll={flow.deselectAllStaging}
            onStyleChange={flow.setStagingStyle}
            onCommentChange={flow.setStagingComment}
            onFileChange={flow.setReferenceFile}
            isMobile={isMobile}
          />
        );
      case 'blueHour':
        return (
          <FinalizeStepBlueHour
            selectedPhotos={selectedPhotos}
            signedUrls={signedUrls}
            photoNumberMap={photoNumberMap}
            blueHourSelections={flow.blueHourSelections}
            expressDelivery={flow.selectedServices.expressDelivery}
            stagingCount={stagingCount}
            onBlueHourToggle={flow.handleBlueHourToggle}
            onSelectAll={flow.selectAllBlueHour}
            onDeselectAll={flow.deselectAllBlueHour}
            isMobile={isMobile}
          />
        );
      case 'summary':
        return (
          <FinalizeStepSummary
            selectedPhotos={selectedPhotos}
            selectedServices={flow.selectedServices}
            stagingCount={stagingCount}
            blueHourCount={blueHourCount}
            stagingStyle={flow.stagingStyle}
            feedback={flow.feedback}
            referenceFile={flow.referenceFile}
            stagingComment={flow.stagingComment}
          />
        );
      default:
        return null;
    }
  };

  const footerButtons = (
    <FinalizeFooterButtons
      step={flow.step}
      selectedServices={flow.selectedServices}
      isSubmitting={flow.isSubmitting}
      isMobile={isMobile}
      onClose={onClose}
      onSetStep={flow.setStep}
      onFeedbackNext={flow.handleFeedbackNext}
      onServicesNext={flow.handleServicesNext}
      onStagingNext={flow.handleStagingNext}
      onBlueHourNext={flow.handleBlueHourNext}
      onFinalSubmit={flow.handleFinalSubmit}
    />
  );

  // Render mobile version with Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[95vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-2xl">{title}</DrawerTitle>
            <DrawerDescription className="text-base">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            <FinalizeStepIndicator currentStep={flow.step} />
            {renderStepContent()}
          </div>
          <DrawerFooter className={cn("gap-2", isMobile && "flex flex-col pt-4")}>
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Render desktop version with Dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] overflow-y-auto transition-all duration-500",
        flow.step === 'services' ? "max-w-4xl" : flow.step === 'summary' ? "max-w-3xl" : "max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base">{description}</DialogDescription>
        </DialogHeader>
        <div>
          <FinalizeStepIndicator currentStep={flow.step} />
          {renderStepContent()}
        </div>
        <DialogFooter className="gap-2">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
