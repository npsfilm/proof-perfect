import { useState, useCallback } from 'react';
import { Photo } from '@/types/database';
import { FinalizeStep, FinalizeFlowState, FinalizeFlowActions, FinalizeData } from './types';

export function useFinalizeFlow(
  selectedPhotos: Photo[],
  onFinalize: (data: FinalizeData) => Promise<void>,
  onClose: () => void
): FinalizeFlowState & FinalizeFlowActions {
  const [step, setStep] = useState<FinalizeStep>('feedback');
  const [feedback, setFeedback] = useState('');
  const [selectedServices, setSelectedServices] = useState({
    expressDelivery: false,
    virtualStaging: false,
    blueHour: false,
  });
  const [stagingSelections, setStagingSelections] = useState<Record<string, boolean>>({});
  const [blueHourSelections, setBlueHourSelections] = useState<Record<string, boolean>>({});
  const [stagingStyle, setStagingStyle] = useState<string>('Modern');
  const [stagingComment, setStagingComment] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBlueHourInfoExpanded, setIsBlueHourInfoExpanded] = useState(false);

  const toggleService = useCallback((service: 'expressDelivery' | 'virtualStaging' | 'blueHour') => {
    setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }));
  }, []);

  const handleStagingToggle = useCallback((photoId: string, checked: boolean) => {
    setStagingSelections(prev => ({ ...prev, [photoId]: checked }));
  }, []);

  const handleBlueHourToggle = useCallback((photoId: string, checked: boolean) => {
    setBlueHourSelections(prev => ({ ...prev, [photoId]: checked }));
  }, []);

  const selectAllStaging = useCallback(() => {
    const allSelected = selectedPhotos.reduce((acc, photo) => {
      acc[photo.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setStagingSelections(allSelected);
  }, [selectedPhotos]);

  const deselectAllStaging = useCallback(() => {
    setStagingSelections({});
  }, []);

  const selectAllBlueHour = useCallback(() => {
    const allSelected = selectedPhotos.reduce((acc, photo) => {
      acc[photo.id] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setBlueHourSelections(allSelected);
  }, [selectedPhotos]);

  const deselectAllBlueHour = useCallback(() => {
    setBlueHourSelections({});
  }, []);

  const handleFeedbackNext = useCallback(() => {
    setStep('services');
  }, []);

  const handleServicesNext = useCallback(() => {
    if (selectedServices.virtualStaging) {
      setStep('staging');
    } else if (selectedServices.blueHour) {
      setStep('blueHour');
    } else {
      setStep('summary');
    }
  }, [selectedServices]);

  const handleStagingNext = useCallback(() => {
    if (selectedServices.blueHour) {
      setStep('blueHour');
    } else {
      setStep('summary');
    }
  }, [selectedServices.blueHour]);

  const handleBlueHourNext = useCallback(() => {
    setStep('summary');
  }, []);

  const reset = useCallback(() => {
    setStep('feedback');
    setFeedback('');
    setSelectedServices({ expressDelivery: false, virtualStaging: false, blueHour: false });
    setStagingSelections({});
    setBlueHourSelections({});
    setStagingStyle('Modern');
    setStagingComment('');
    setReferenceFile(undefined);
    setIsBlueHourInfoExpanded(false);
  }, []);

  const handleFinalSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const stagingData = selectedPhotos.map(photo => ({
        photoId: photo.id,
        staging: stagingSelections[photo.id] || false,
        style: stagingSelections[photo.id] ? stagingStyle : undefined,
      }));

      const blueHourData = Object.keys(blueHourSelections)
        .filter(photoId => blueHourSelections[photoId]);

      await onFinalize({
        feedback,
        services: selectedServices,
        stagingSelections: stagingData,
        blueHourSelections: blueHourData,
        referenceFile,
        stagingComment,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Finalization error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedPhotos, stagingSelections, blueHourSelections, stagingStyle, feedback, selectedServices, referenceFile, stagingComment, onFinalize, reset, onClose]);

  return {
    // State
    step,
    feedback,
    selectedServices,
    stagingSelections,
    blueHourSelections,
    stagingStyle,
    stagingComment,
    referenceFile,
    isSubmitting,
    isBlueHourInfoExpanded,
    // Actions
    setStep,
    setFeedback,
    toggleService,
    handleStagingToggle,
    handleBlueHourToggle,
    selectAllStaging,
    deselectAllStaging,
    selectAllBlueHour,
    deselectAllBlueHour,
    setStagingStyle,
    setStagingComment,
    setReferenceFile,
    setIsBlueHourInfoExpanded,
    handleFeedbackNext,
    handleServicesNext,
    handleStagingNext,
    handleBlueHourNext,
    handleFinalSubmit,
    reset,
  };
}
