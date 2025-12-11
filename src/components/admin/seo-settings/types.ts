export interface SeoSettings {
  id: string;
  
  // Branding
  site_name: string;
  logo_url: string | null;
  logo_dark_url: string | null;
  logo_icon_url: string | null;
  favicon_url: string | null;
  
  // SEO Meta Tags
  meta_title_suffix: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  
  // Open Graph
  og_image_url: string | null;
  og_type: string | null;
  og_locale: string | null;
  
  // Twitter Card
  twitter_card_type: string | null;
  twitter_handle: string | null;
  
  // Schema.org / Structured Data
  schema_org_type: string | null;
  business_name: string | null;
  business_description: string | null;
  business_phone: string | null;
  business_email: string | null;
  business_address_street: string | null;
  business_address_city: string | null;
  business_address_zip: string | null;
  business_address_country: string | null;
  business_geo_lat: number | null;
  business_geo_lng: number | null;
  
  // Analytics
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  facebook_pixel_id: string | null;
  
  // Dynamic Content
  hero_headline: string | null;
  hero_subheadline: string | null;
  hero_image_url: string | null;
  cta_primary_text: string | null;
  cta_secondary_text: string | null;
  footer_tagline: string | null;
  
  created_at: string;
  updated_at: string;
}

export type SeoSettingsUpdate = Partial<Omit<SeoSettings, 'id' | 'created_at' | 'updated_at'>>;
