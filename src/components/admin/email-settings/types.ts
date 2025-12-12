export interface EmailDesignSettings {
  id: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  container_bg_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  logo_url: string | null;
  logo_width: number;
  company_name: string;
  font_family: string;
  heading_font_size: number;
  body_font_size: number;
  line_height: number;
  button_bg_color: string;
  button_text_color: string;
  button_border_radius: number;
  button_padding_x: number;
  button_padding_y: number;
  container_max_width: number;
  container_border_radius: number;
  content_padding: number;
  footer_text: string | null;
  show_social_links: boolean;
  social_facebook: string | null;
  social_instagram: string | null;
  social_linkedin: string | null;
  use_branding_logo: boolean;
  // Sender settings
  default_from_name: string | null;
  default_from_email: string | null;
  reply_to_email: string | null;
  reply_to_name: string | null;
  // Newsletter sender settings
  newsletter_from_name: string | null;
  newsletter_from_email: string | null;
  newsletter_reply_to_email: string | null;
  newsletter_reply_to_name: string | null;
  // Anti-spam settings
  unsubscribe_email: string | null;
  unsubscribe_url: string | null;
  physical_address_line1: string | null;
  physical_address_line2: string | null;
  physical_address_country: string | null;
  include_physical_address: boolean;
  // Legal information
  legal_company_name: string | null;
  legal_register_info: string | null;
  legal_vat_id: string | null;
  // Confidentiality notice
  include_confidentiality_notice: boolean;
  confidentiality_notice: string | null;
  // Email reason texts
  reason_transactional: string | null;
  reason_newsletter: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailPlaceholder {
  key: string;
  label: string;
  example: string;
}

export type EmailContentType = 'simple' | 'sections' | 'html';

export interface EmailSectionSettings {
  alignment?: 'left' | 'center' | 'right';
  padding?: string;
  backgroundColor?: string;
  imageUrl?: string;
  buttonUrl?: string;
  maxWidth?: string;
  color?: string;
  width?: string;
  height?: string;
  columns?: number;
}

export interface EmailSection {
  id: string;
  name: string;
  section_type: 'header' | 'text' | 'image' | 'cta' | 'divider' | 'columns' | 'spacer' | 'footer' | 'custom';
  content_du: string | null;
  content_sie: string | null;
  settings: EmailSectionSettings;
  is_preset: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateSectionInstance {
  id: string;
  section_type: EmailSection['section_type'];
  content_du: string;
  content_sie: string;
  settings: EmailSectionSettings;
}

export interface EmailTemplate {
  id: string;
  template_key: string;
  category: 'system' | 'customer' | 'newsletter';
  name: string;
  description: string | null;
  subject_du: string;
  preheader_du: string | null;
  heading_du: string | null;
  body_du: string;
  cta_text_du: string | null;
  cta_url_placeholder: string | null;
  subject_sie: string;
  preheader_sie: string | null;
  heading_sie: string | null;
  body_sie: string;
  cta_text_sie: string | null;
  available_placeholders: EmailPlaceholder[];
  is_active: boolean;
  is_system_template: boolean;
  content_type: EmailContentType;
  sections: EmailTemplateSectionInstance[];
  html_content_du: string | null;
  html_content_sie: string | null;
  from_email: string | null;
  created_at: string;
  updated_at: string;
}

export type SalutationType = 'du' | 'sie';

export const FONT_OPTIONS = [
  { value: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif', label: 'System (Standard)' },
  { value: 'Arial, Helvetica, sans-serif', label: 'Arial' },
  { value: 'Georgia, Times New Roman, serif', label: 'Georgia' },
  { value: 'Helvetica Neue, Helvetica, Arial, sans-serif', label: 'Helvetica' },
  { value: 'Verdana, Geneva, sans-serif', label: 'Verdana' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  system: 'System-E-Mails',
  customer: 'Kunden-E-Mails',
  newsletter: 'Newsletter',
};

export const SECTION_TYPE_LABELS: Record<EmailSection['section_type'], string> = {
  header: 'Header mit Logo',
  text: 'Text-Block',
  image: 'Bild',
  cta: 'CTA-Button',
  divider: 'Trennlinie',
  columns: 'Zwei Spalten',
  spacer: 'Abstand',
  footer: 'Footer',
  custom: 'Benutzerdefiniert',
};

export const SECTION_TYPE_ICONS: Record<EmailSection['section_type'], string> = {
  header: '📋',
  text: '📝',
  image: '🖼️',
  cta: '🔘',
  divider: '➖',
  columns: '⬛',
  spacer: '↕️',
  footer: '📄',
  custom: '⭐',
};
