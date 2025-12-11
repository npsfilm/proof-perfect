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
  // Step tracking
  currentStep: number;
  scheduleType: 'single_day' | 'multiple_days' | null;
  propertyCount: number;
  currentPropertyIndex: number;
  
  // Property data
  properties: PropertyBooking[];
  
  // Slot selection
  selectedSlots: SlotSelection[];
  
  // Contact
  contact: ContactDetails;
  
  // Booking result
  batchId: string | null;
  isSubmitting: boolean;
  isComplete: boolean;
}

interface BookingContextType extends BookingState {
  // Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Schedule type
  setScheduleType: (type: 'single_day' | 'multiple_days') => void;
  
  // Properties
  setPropertyCount: (count: number) => void;
  setCurrentPropertyIndex: (index: number) => void;
  updateProperty: (index: number, property: Partial<PropertyBooking>) => void;
  addProperty: (property: PropertyBooking) => void;
  
  // Slots
  setSelectedSlots: (slots: SlotSelection[]) => void;
  
  // Contact
  setContact: (contact: ContactDetails) => void;
  
  // Actions
  submitBooking: () => Promise<void>;
  resetBooking: () => void;
  
  // Computed
  totalDuration: number;
  totalPrice: number;
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

// Package prices in cents
const PACKAGE_PRICES: Record<string, Record<number, number>> = {
  foto: { 6: 14900, 10: 19900, 15: 24900, 20: 29900 },
  drohne: { 4: 14900, 6: 19900, 10: 24900 },
  kombi: { 15: 29900, 20: 34900, 25: 39900, 30: 44900 },
};

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

  const submitBooking = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const batchId = crypto.randomUUID();

      // Create bookings for each property
      for (let i = 0; i < state.properties.length; i++) {
        const property = state.properties[i];
        const slot = state.selectedSlots[i] || state.selectedSlots[0];

        const { error } = await supabase.from('bookings').insert({
          batch_id: batchId,
          property_index: i + 1,
          contact_name: state.contact.name,
          contact_email: state.contact.email,
          contact_phone: state.contact.phone,
          company_name: state.contact.companyName,
          address: property.address,
          latitude: property.lat,
          longitude: property.lng,
          package_type: property.packageType,
          photo_count: property.photoCount,
          property_type: property.propertyType,
          square_meters: property.squareMeters,
          scheduled_date: slot.date,
          scheduled_start: slot.start,
          scheduled_end: slot.end,
          estimated_duration_minutes: property.durationMinutes,
          status: slot.isWeekendRequest ? 'request' : 'confirmed',
          is_weekend_request: slot.isWeekendRequest,
          source: 'web',
        });

        if (error) throw error;
      }

      setState(prev => ({
        ...prev,
        batchId,
        isSubmitting: false,
        isComplete: true,
      }));
    } catch (error) {
      console.error('Booking submission error:', error);
      setState(prev => ({ ...prev, isSubmitting: false }));
      throw error;
    }
  }, [state.properties, state.selectedSlots, state.contact]);

  const resetBooking = useCallback(() => {
    setState(initialState);
  }, []);

  // Computed values
  const totalDuration = state.properties.reduce((sum, p) => sum + (p.durationMinutes || 0), 0);
  
  const totalPrice = state.properties.reduce((sum, p) => {
    const prices = PACKAGE_PRICES[p.packageType];
    return sum + (prices?.[p.photoCount] || 0);
  }, 0);

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
        submitBooking,
        resetBooking,
        totalDuration,
        totalPrice,
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
