import { Helmet } from 'react-helmet-async';
import { useSeoSettings } from '@/hooks/useSeoSettings';

export type PageType = 
  | 'home'
  | 'dashboard' 
  | 'gallery' 
  | 'virtual_editing' 
  | 'staging' 
  | 'settings'
  | 'admin_dashboard'
  | 'admin_galleries'
  | 'admin_settings';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  noIndex?: boolean;
  pageType?: PageType;
  dynamicValues?: Record<string, string>;
}

export function SeoHead({ 
  title, 
  description, 
  image, 
  type = 'website',
  noIndex = false,
  pageType,
  dynamicValues = {}
}: SeoHeadProps) {
  const { settings } = useSeoSettings();

  // Generate page title based on pageType or custom title
  const getPageTitle = () => {
    // If custom title is provided, use it with suffix
    if (title) {
      return `${title}${settings?.meta_title_suffix || ''}`;
    }

    // If no settings, return fallback
    if (!settings) return 'ImmoOnPoint';

    // Get template based on pageType
    let template: string | null = null;
    switch (pageType) {
      case 'home':
        return settings.default_page_title || 'ImmoOnPoint';
      case 'dashboard':
        template = settings.page_title_dashboard;
        break;
      case 'gallery':
        template = settings.page_title_gallery;
        break;
      case 'virtual_editing':
        template = settings.page_title_virtual_editing;
        break;
      case 'staging':
        template = settings.page_title_staging;
        break;
      case 'settings':
        template = settings.page_title_settings;
        break;
      case 'admin_dashboard':
        template = settings.page_title_admin_dashboard;
        break;
      case 'admin_galleries':
        template = settings.page_title_admin_galleries;
        break;
      case 'admin_settings':
        template = settings.page_title_admin_settings;
        break;
      default:
        return settings.default_page_title || settings.site_name || 'ImmoOnPoint';
    }

    // Apply template with placeholders
    if (template) {
      let resolved = template;
      resolved = resolved.replace('{suffix}', settings.meta_title_suffix || '');
      
      // Replace dynamic values
      Object.entries(dynamicValues).forEach(([key, value]) => {
        resolved = resolved.replace(`{${key}}`, value);
      });
      
      return resolved;
    }

    return settings.site_name || 'ImmoOnPoint';
  };

  const siteTitle = getPageTitle();
  const metaDescription = description || settings?.meta_description || '';
  const ogImage = image || settings?.og_image_url || '';
  const ogType = type || settings?.og_type || 'website';
  const twitterCard = settings?.twitter_card_type || 'summary_large_image';
  const twitterHandle = settings?.twitter_handle || '';

  // Generate JSON-LD structured data
  const structuredData = settings ? {
    "@context": "https://schema.org",
    "@type": settings.schema_org_type || "LocalBusiness",
    "name": settings.business_name || settings.site_name,
    "description": settings.business_description || metaDescription,
    "url": window.location.origin,
    ...(settings.logo_url && { "logo": settings.logo_url }),
    ...(settings.business_phone && { "telephone": settings.business_phone }),
    ...(settings.business_email && { "email": settings.business_email }),
    ...(settings.business_address_street && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.business_address_street,
        "addressLocality": settings.business_address_city,
        "postalCode": settings.business_address_zip,
        "addressCountry": settings.business_address_country || "DE"
      }
    }),
    ...(settings.business_geo_lat && settings.business_geo_lng && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": settings.business_geo_lat,
        "longitude": settings.business_geo_lng
      }
    })
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />
      {settings?.meta_keywords && (
        <meta name="keywords" content={settings.meta_keywords} />
      )}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:locale" content={settings?.og_locale || 'de_DE'} />
      <meta property="og:site_name" content={settings?.site_name || 'ImmoOnPoint'} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      
      {/* Favicon */}
      {settings?.favicon_url && (
        <link rel="icon" href={settings.favicon_url} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
