import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface TrackingContextType {
  sessionId: string;
  isEnabled: boolean;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or restore session ID
    const existingSessionId = sessionStorage.getItem('tracking_session_id');
    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      const newSessionId = crypto.randomUUID();
      sessionStorage.setItem('tracking_session_id', newSessionId);
      setSessionId(newSessionId);
    }
  }, []);

  const isEnabled = !!user && !!sessionId;

  return (
    <TrackingContext.Provider value={{ sessionId, isEnabled }}>
      {children}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}
