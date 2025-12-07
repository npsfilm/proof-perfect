import { Photo } from '@/types/database';

export type FinalizeStep = 'feedback' | 'services' | 'staging' | 'blueHour' | 'summary';

export interface FinalizeModalsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotos: Photo[];
  onFinalize: (data: FinalizeData) => Promise<void>;
}

export interface FinalizeData {
  feedback: string;
  services: {
    expressDelivery: boolean;
    virtualStaging: boolean;
    blueHour: boolean;
  };
  stagingSelections: { photoId: string; staging: boolean; style?: string }[];
  blueHourSelections: string[];
  referenceFile?: File;
  stagingComment?: string;
}

export interface FinalizeFlowState {
  step: FinalizeStep;
  feedback: string;
  selectedServices: {
    expressDelivery: boolean;
    virtualStaging: boolean;
    blueHour: boolean;
  };
  stagingSelections: Record<string, boolean>;
  blueHourSelections: Record<string, boolean>;
  stagingStyle: string;
  stagingComment: string;
  referenceFile: File | undefined;
  isSubmitting: boolean;
  isBlueHourInfoExpanded: boolean;
}

export interface FinalizeFlowActions {
  setStep: (step: FinalizeStep) => void;
  setFeedback: (feedback: string) => void;
  toggleService: (service: 'expressDelivery' | 'virtualStaging' | 'blueHour') => void;
  handleStagingToggle: (photoId: string, checked: boolean) => void;
  handleBlueHourToggle: (photoId: string, checked: boolean) => void;
  selectAllStaging: () => void;
  deselectAllStaging: () => void;
  selectAllBlueHour: () => void;
  deselectAllBlueHour: () => void;
  setStagingStyle: (style: string) => void;
  setStagingComment: (comment: string) => void;
  setReferenceFile: (file: File | undefined) => void;
  setIsBlueHourInfoExpanded: (expanded: boolean) => void;
  handleFeedbackNext: () => void;
  handleServicesNext: () => void;
  handleStagingNext: () => void;
  handleBlueHourNext: () => void;
  handleFinalSubmit: () => Promise<void>;
  reset: () => void;
}
