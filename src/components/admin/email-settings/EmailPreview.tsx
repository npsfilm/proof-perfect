import { EmailDesignSettings, EmailTemplate, SalutationType } from './types';
import { useSeoSettings } from '@/hooks/useSeoSettings';

interface EmailPreviewProps {
  settings: EmailDesignSettings;
  template?: EmailTemplate;
  salutation?: SalutationType;
  placeholderValues?: Record<string, string>;
  emailType?: 'transactional' | 'newsletter';
}

export function EmailPreview({ 
  settings, 
  template,
  salutation = 'sie',
  placeholderValues = {},
  emailType = 'transactional'
}: EmailPreviewProps) {
  const { settings: seoSettings } = useSeoSettings();
  
  // Determine effective logo URL: prefer branding logo (dark version for emails) if flag is set
  const effectiveLogoUrl = settings.use_branding_logo 
    ? (seoSettings?.logo_dark_url || seoSettings?.logo_url) 
    : settings.logo_url;

  const defaultPlaceholders: Record<string, string> = {
    vorname: 'Max',
    nachname: 'Mustermann',
    anrede: 'Herr',
    email: 'max@example.com',
    company_name: settings.company_name || 'ImmoOnPoint',
    year: new Date().getFullYear().toString(),
    action_url: '#',
    gallery_name: 'Musterstraße 123',
    gallery_address: 'Musterstraße 123, 12345 Berlin',
    gallery_url: '#',
    selected_count: '25',
    staging_count: '3',
    download_url: '#',
    temp_password: 'TempPass123',
    photo_count: '45',
    ...placeholderValues,
  };

  const replacePlaceholders = (text: string) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => defaultPlaceholders[key] || `{${key}}`);
  };

  // Demo content if no template provided
  const heading = template 
    ? replacePlaceholders(salutation === 'du' ? (template.heading_du || '') : (template.heading_sie || ''))
    : 'Willkommen bei ImmoOnPoint!';
  
  const body = template
    ? replacePlaceholders(salutation === 'du' ? template.body_du : template.body_sie)
    : 'Dies ist eine Vorschau Ihrer E-Mail-Vorlage. Hier sehen Sie, wie Ihre E-Mails mit den aktuellen Design-Einstellungen aussehen werden.';
  
  const ctaText = template
    ? (salutation === 'du' ? template.cta_text_du : template.cta_text_sie)
    : 'Zum Dashboard';

  const footerText = replacePlaceholders(settings.footer_text || '© {year} ImmoOnPoint');

  // Build legal info string
  const legalParts: string[] = [];
  if (settings.legal_company_name) legalParts.push(settings.legal_company_name);
  if (settings.legal_register_info) legalParts.push(settings.legal_register_info);
  if (settings.legal_vat_id) legalParts.push(`USt-IdNr.: ${settings.legal_vat_id}`);
  const legalInfo = legalParts.join(' | ');

  // Build physical address string
  const addressParts: string[] = [];
  if (settings.physical_address_line1) addressParts.push(settings.physical_address_line1);
  if (settings.physical_address_line2) addressParts.push(settings.physical_address_line2);
  if (settings.physical_address_country) addressParts.push(settings.physical_address_country);
  const physicalAddress = addressParts.join(' | ');

  // Get email reason based on type
  const emailReason = emailType === 'newsletter'
    ? (settings.reason_newsletter || 'Sie erhalten diese E-Mail, weil Sie in der Vergangenheit eine Marketingdienstleistung von ImmoOnPoint in Anspruch genommen oder sich für den Newsletter angemeldet haben.')
    : (settings.reason_transactional || 'Sie erhalten diese E-Mail, weil Sie eine Bestellung über ImmoOnPoint aufgegeben haben.');

  // Brand trademark notice
  const brandNotice = settings.brand_trademark_notice || 'ImmoOnPoint ist eine Marke der NPS Media GmbH';

  // Confidentiality notice
  const confidentialityNotice = settings.confidentiality_notice || 
    'Diese E-Mail enthält vertrauliche und/oder rechtlich geschützte Informationen. Wenn Sie nicht der richtige Adressat sind oder diese E-Mail irrtümlich erhalten haben, informieren Sie bitte sofort den Absender und vernichten Sie diese E-Mail. Das unerlaubte Kopieren sowie die unbefugte Weitergabe dieser E-Mail ist nicht gestattet. Bitte behalten Sie für die schnellere Bearbeitung den Verlauf der E-Mail bei.';

  return (
    <div 
      className="w-full overflow-auto"
      style={{ 
        backgroundColor: settings.background_color || '#f4f4f5',
        fontFamily: settings.font_family,
      }}
    >
      <div style={{ padding: '40px 20px' }}>
        {/* Email Container */}
        <div
          style={{
            maxWidth: `${settings.container_max_width || 600}px`,
            margin: '0 auto',
            backgroundColor: settings.container_bg_color || '#ffffff',
            borderRadius: `${settings.container_border_radius || 12}px`,
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Header with Logo */}
          <div
            style={{
              padding: '24px',
              textAlign: 'center',
              borderBottom: `1px solid ${settings.border_color || '#e4e4e7'}`,
            }}
          >
            {effectiveLogoUrl ? (
              <img
                src={effectiveLogoUrl}
                alt={settings.company_name || 'Logo'}
                style={{
                  width: `${settings.logo_width || 150}px`,
                  height: 'auto',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: `${settings.heading_font_size || 24}px`,
                  fontWeight: 'bold',
                  color: settings.primary_color || '#233c63',
                }}
              >
                {settings.company_name || 'ImmoOnPoint'}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ padding: `${settings.content_padding || 40}px` }}>
            {heading && (
              <h1
                style={{
                  fontSize: `${settings.heading_font_size || 24}px`,
                  color: settings.text_color || '#18181b',
                  marginBottom: '16px',
                  lineHeight: settings.line_height || 1.6,
                }}
              >
                {heading}
              </h1>
            )}

            <p
              style={{
                fontSize: `${settings.body_font_size || 16}px`,
                color: settings.text_color || '#18181b',
                lineHeight: settings.line_height || 1.6,
                marginBottom: '24px',
              }}
            >
              {body}
            </p>

            {ctaText && (
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <a
                  href="#"
                  style={{
                    display: 'inline-block',
                    backgroundColor: settings.button_bg_color || '#233c63',
                    color: settings.button_text_color || '#ffffff',
                    padding: `${settings.button_padding_y || 16}px ${settings.button_padding_x || 32}px`,
                    borderRadius: `${settings.button_border_radius || 8}px`,
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: `${settings.body_font_size || 16}px`,
                  }}
                >
                  {ctaText}
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '24px',
              backgroundColor: settings.background_color || '#f4f4f5',
              textAlign: 'center',
            }}
          >
            {/* Social Links */}
            {settings.show_social_links && (
              <div style={{ marginBottom: '16px' }}>
                {settings.social_facebook && (
                  <a href={settings.social_facebook} style={{ margin: '0 8px', color: settings.text_muted_color }}>
                    Facebook
                  </a>
                )}
                {settings.social_instagram && (
                  <a href={settings.social_instagram} style={{ margin: '0 8px', color: settings.text_muted_color }}>
                    Instagram
                  </a>
                )}
                {settings.social_linkedin && (
                  <a href={settings.social_linkedin} style={{ margin: '0 8px', color: settings.text_muted_color }}>
                    LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Footer Text (Copyright) */}
            <p
              style={{
                fontSize: '12px',
                color: settings.text_muted_color || '#71717a',
                margin: 0,
              }}
            >
              {footerText}
            </p>

            {/* Brand Trademark Notice */}
            <p
              style={{
                fontSize: '11px',
                color: settings.text_muted_color || '#71717a',
                margin: '10px 0 0',
                fontStyle: 'italic',
              }}
            >
              {brandNotice}
            </p>

            {/* Legal Company Info */}
            {legalInfo && (
              <p
                style={{
                  fontSize: '11px',
                  color: settings.text_muted_color || '#71717a',
                  margin: '10px 0 0',
                }}
              >
                {legalInfo}
              </p>
            )}

            {/* Physical Address */}
            {settings.include_physical_address && physicalAddress && (
              <p
                style={{
                  fontSize: '11px',
                  color: settings.text_muted_color || '#71717a',
                  margin: '5px 0 0',
                }}
              >
                {physicalAddress}
              </p>
            )}

            {/* Separator Line */}
            <div
              style={{
                marginTop: '20px',
                borderTop: `1px solid ${settings.border_color || '#e4e4e7'}`,
                paddingTop: '15px',
              }}
            >
              {/* Email Reason - Plain text, no box, no emoji */}
              <p
                style={{
                  fontSize: '11px',
                  color: settings.text_muted_color || '#71717a',
                  margin: 0,
                  textAlign: 'center',
                }}
              >
                <strong style={{ color: settings.text_color || '#18181b' }}>
                  Warum erhalten Sie diese E-Mail?
                </strong>
                <br />
                {emailReason}
              </p>

              {/* Email Settings Link */}
              <p style={{ marginTop: '15px', marginBottom: 0, textAlign: 'center' }}>
                <a
                  href="#"
                  style={{
                    fontSize: '11px',
                    color: settings.text_muted_color || '#71717a',
                    textDecoration: 'underline',
                  }}
                >
                  E-Mail-Einstellungen verwalten
                </a>
              </p>

              {/* Confidentiality Notice */}
              {settings.include_confidentiality_notice && (
                <p
                  style={{
                    fontSize: '10px',
                    color: settings.text_muted_color || '#71717a',
                    margin: '15px 0 0',
                    textAlign: 'justify',
                    lineHeight: 1.4,
                  }}
                >
                  {confidentialityNotice}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
