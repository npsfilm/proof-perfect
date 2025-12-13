import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PropertyBooking {
  address: string;
  lat?: number;
  lng?: number;
  packageType: 'foto' | 'drohne' | 'kombi';
  photoCount: number;
  propertyType?: 'bewohnt' | 'unbewohnt' | 'gestaged';
  squareMeters?: number;
  durationMinutes: number;
}

export interface SlotSelection {
  date: string;
  start: string;
  end: string;
  isWeekendRequest: boolean;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}

interface BookingState {
  currentStep: number;
  scheduleType: 'single_day' | 'multiple_days' | null;
  propertyCount: number;
  currentPropertyIndex: number;
  properties: PropertyBooking[];
  selectedSlots: SlotSelection[];
  contact: ContactDetails;
  batchId: string | null;
  isSubmitting: boolean;
  isComplete: boolean;
}

interface BookingContextType extends BookingState {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setScheduleType: (type: 'single_day' | 'multiple_days') => void;
  setPropertyCount: (count: number) => void;
  setCurrentPropertyIndex: (index: number) => void;
  updateProperty: (index: number, property: Partial<PropertyBooking>) => void;
  addProperty: (property: PropertyBooking) => void;
  setSelectedSlots: (slots: SlotSelection[]) => void;
  setContact: (contact: ContactDetails) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setBookingComplete: (batchId: string) => void;
  resetBooking: () => void;
}

const initialState: BookingState = {
  currentStep: 1,
  scheduleType: null,
  propertyCount: 1,
  currentPropertyIndex: 0,
  properties: [],
  selectedSlots: [],
  contact: { name: '', email: '' },
  batchId: null,
  isSubmitting: false,
  isComplete: false,
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  const setStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  }, []);

  const setScheduleType = useCallback((type: 'single_day' | 'multiple_days') => {
    setState(prev => ({ ...prev, scheduleType: type }));
  }, []);

  const setPropertyCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, propertyCount: count }));
  }, []);

  const setCurrentPropertyIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentPropertyIndex: index }));
  }, []);

  const updateProperty = useCallback((index: number, property: Partial<PropertyBooking>) => {
    setState(prev => {
      const newProperties = [...prev.properties];
      if (newProperties[index]) {
        newProperties[index] = { ...newProperties[index], ...property };
      }
      return { ...prev, properties: newProperties };
    });
  }, []);

  const addProperty = useCallback((property: PropertyBooking) => {
    setState(prev => ({
      ...prev,
      properties: [...prev.properties, property],
    }));
  }, []);

  const setSelectedSlots = useCallback((slots: SlotSelection[]) => {
    setState(prev => ({ ...prev, selectedSlots: slots }));
  }, []);

  const setContact = useCallback((contact: ContactDetails) => {
    setState(prev => ({ ...prev, contact }));
  }, []);

  const setIsSubmitting = useCallback((isSubmitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting }));
  }, []);

  const setBookingComplete = useCallback((batchId: string) => {
    setState(prev => ({ ...prev, batchId, isSubmitting: false, isComplete: true }));
  }, []);

  const resetBooking = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <BookingContext.Provider
      value={{
        ...state,
        setStep,
        nextStep,
        prevStep,
        setScheduleType,
        setPropertyCount,
        setCurrentPropertyIndex,
        updateProperty,
        addProperty,
        setSelectedSlots,
        setContact,
        setIsSubmitting,
        setBookingComplete,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
