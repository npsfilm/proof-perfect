import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useClientProfile } from '@/hooks/useClientProfile';

type AnspracheType = 'Du' | 'Sie';

interface AnspracheContextType {
  ansprache: AnspracheType;
  t: (du: string, sie: string) => string;
  isLoading: boolean;
}

const AnspracheContext = createContext<AnspracheContextType>({
  ansprache: 'Sie',
  t: (du, sie) => sie,
  isLoading: true,
});

export function AnspracheProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: client, isLoading } = useClientProfile(user?.email);
  
  const ansprache: AnspracheType = client?.ansprache || 'Sie';
  
  const t = (du: string, sie: string): string => {
    return ansprache === 'Du' ? du : sie;
  };

  return (
    <AnspracheContext.Provider value={{ ansprache, t, isLoading }}>
      {children}
    </AnspracheContext.Provider>
  );
}

export function useAnsprache() {
  const context = useContext(AnspracheContext);
  if (!context) {
    throw new Error('useAnsprache must be used within an AnspracheProvider');
  }
  return context;
}
