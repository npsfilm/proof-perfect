import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ServiceType, PackageOption, UpgradeOption, SERVICES } from '@/constants/booking';

interface PropertyDetails {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  serviceType: ServiceType | null;
  package: PackageOption | null;
  upgrades: UpgradeOption[];
  duration: number;
  scheduledTime: string | null;
  scheduledDate: Date | null;
}

interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  company?: string;
}

interface BookingState {
  batchId: string;
  totalProperties: number;
  bookingsCompleted: number;
  currentStep: number;
  currentProperty: PropertyDetails;
  contactDetails: ContactDetails;
  completedBookings: PropertyDetails[];
}

interface BookingContextType extends BookingState {
  // Step navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Property count
  setTotalProperties: (count: number) => void;
  
  // Address
  setAddress: (address: string, coordinates: { lat: number; lng: number }) => void;
  
  // Service selection
  setServiceType: (type: ServiceType) => void;
  
  // Package selection
  setPackage: (pkg: PackageOption) => void;
  
  // Upgrades
  toggleUpgrade: (upgrade: UpgradeOption) => void;
  
  // Scheduling
  setScheduledTime: (time: string, date: Date) => void;
  
  // Contact
  setContactDetails: (details: ContactDetails) => void;
  
  // Booking completion
  completeCurrentBooking: () => void;
  
  // Reset
  resetBooking: () => void;
  
  // Computed values
  getTotalPrice: () => number;
  getTotalDuration: () => number;
  isLastProperty: () => boolean;
}

const generateBatchId = () => crypto.randomUUID();

const initialPropertyDetails: PropertyDetails = {
  address: '',
  coordinates: null,
  serviceType: null,
  package: null,
  upgrades: [],
  duration: 0,
  scheduledTime: null,
  scheduledDate: null,
};

const initialContactDetails: ContactDetails = {
  name: '',
  email: '',
  phone: '',
  company: '',
};

const initialState: BookingState = {
  batchId: generateBatchId(),
  totalProperties: 1,
  bookingsCompleted: 0,
  currentStep: 1,
  currentProperty: { ...initialPropertyDetails },
  contactDetails: { ...initialContactDetails },
  completedBookings: [],
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>(initialState);

  const calculateDuration = useCallback((serviceType: ServiceType | null, pkg: PackageOption | null, upgrades: UpgradeOption[]) => {
    let duration = 0;
    
    // Base duration from service type
    if (serviceType) {
      const service = SERVICES.find(s => s.id === serviceType);
      duration = service?.baseDuration || 0;
    }
    
    // Override with package duration if selected
    if (pkg) {
      duration = pkg.duration;
    }
    
    // Add upgrade durations
    upgrades.forEach(u => {
      duration += u.duration;
    });
    
    return duration;
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 6) }));
  }, []);

  const prevStep = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, Math.min(step, 6)) }));
  }, []);

  const setTotalProperties = useCallback((count: number) => {
    setState(prev => ({ ...prev, totalProperties: Math.max(1, Math.min(count, 5)) }));
  }, []);

  const setAddress = useCallback((address: string, coordinates: { lat: number; lng: number }) => {
    setState(prev => ({
      ...prev,
      currentProperty: { ...prev.currentProperty, address, coordinates }
    }));
  }, []);

  const setServiceType = useCallback((type: ServiceType) => {
    setState(prev => {
      const newDuration = calculateDuration(type, null, []);
      return {
        ...prev,
        currentProperty: { 
          ...prev.currentProperty, 
          serviceType: type,
          package: null, // Reset package when service changes
          upgrades: [], // Reset upgrades
          duration: newDuration
        }
      };
    });
  }, [calculateDuration]);

  const setPackage = useCallback((pkg: PackageOption) => {
    setState(prev => {
      const newDuration = calculateDuration(prev.currentProperty.serviceType, pkg, prev.currentProperty.upgrades);
      return {
        ...prev,
        currentProperty: { ...prev.currentProperty, package: pkg, duration: newDuration }
      };
    });
  }, [calculateDuration]);

  const toggleUpgrade = useCallback((upgrade: UpgradeOption) => {
    setState(prev => {
      const hasUpgrade = prev.currentProperty.upgrades.some(u => u.id === upgrade.id);
      const newUpgrades = hasUpgrade
        ? prev.currentProperty.upgrades.filter(u => u.id !== upgrade.id)
        : [...prev.currentProperty.upgrades, upgrade];
      const newDuration = calculateDuration(prev.currentProperty.serviceType, prev.currentProperty.package, newUpgrades);
      return {
        ...prev,
        currentProperty: { ...prev.currentProperty, upgrades: newUpgrades, duration: newDuration }
      };
    });
  }, [calculateDuration]);

  const setScheduledTime = useCallback((time: string, date: Date) => {
    setState(prev => ({
      ...prev,
      currentProperty: { ...prev.currentProperty, scheduledTime: time, scheduledDate: date }
    }));
  }, []);

  const setContactDetails = useCallback((details: ContactDetails) => {
    setState(prev => ({ ...prev, contactDetails: details }));
  }, []);

  const completeCurrentBooking = useCallback(() => {
    setState(prev => {
      const newCompletedBookings = [...prev.completedBookings, { ...prev.currentProperty }];
      const newBookingsCompleted = prev.bookingsCompleted + 1;
      
      // If all properties are booked, stay on current step (will show success)
      if (newBookingsCompleted >= prev.totalProperties) {
        return {
          ...prev,
          bookingsCompleted: newBookingsCompleted,
          completedBookings: newCompletedBookings,
          currentStep: 7, // Success step
        };
      }
      
      // Otherwise, reset for next property
      return {
        ...prev,
        bookingsCompleted: newBookingsCompleted,
        completedBookings: newCompletedBookings,
        currentProperty: { ...initialPropertyDetails },
        currentStep: 2, // Go back to address step for next property
      };
    });
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      ...initialState,
      batchId: generateBatchId(),
    });
  }, []);

  const getTotalPrice = useCallback(() => {
    let total = state.currentProperty.package?.price || 0;
    state.currentProperty.upgrades.forEach(u => {
      total += u.price;
    });
    return total;
  }, [state.currentProperty.package, state.currentProperty.upgrades]);

  const getTotalDuration = useCallback(() => {
    return state.currentProperty.duration;
  }, [state.currentProperty.duration]);

  const isLastProperty = useCallback(() => {
    return state.bookingsCompleted + 1 >= state.totalProperties;
  }, [state.bookingsCompleted, state.totalProperties]);

  const value: BookingContextType = {
    ...state,
    nextStep,
    prevStep,
    goToStep,
    setTotalProperties,
    setAddress,
    setServiceType,
    setPackage,
    toggleUpgrade,
    setScheduledTime,
    setContactDetails,
    completeCurrentBooking,
    resetBooking,
    getTotalPrice,
    getTotalDuration,
    isLastProperty,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
