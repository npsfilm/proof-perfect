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
  created_at: string;
  updated_at: string;
}

export interface EmailPlaceholder {
  key: string;
  label: string;
  example: string;
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
