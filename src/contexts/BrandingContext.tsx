import { createContext, useContext, ReactNode } from 'react';
import { useSeoSettings } from '@/hooks/useSeoSettings';

interface BrandingContextType {
  siteName: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  logoIconUrl: string | null;
  faviconUrl: string | null;
  supportEmail: string;
  watermarkUrl: string | null;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const { settings, isLoading } = useSeoSettings();

  const value: BrandingContextType = {
    siteName: settings?.site_name || 'ImmoOnPoint',
    logoUrl: settings?.logo_url || null,
    logoDarkUrl: settings?.logo_dark_url || null,
    logoIconUrl: settings?.logo_icon_url || null,
    faviconUrl: settings?.favicon_url || null,
    supportEmail: settings?.support_email || 'support@immoonpoint.de',
    watermarkUrl: settings?.watermark_url || null,
    isLoading,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
