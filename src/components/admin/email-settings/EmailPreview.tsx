import { EmailDesignSettings, EmailTemplate, SalutationType } from './types';

interface EmailPreviewProps {
  settings: EmailDesignSettings;
  template?: EmailTemplate;
  salutation?: SalutationType;
  placeholderValues?: Record<string, string>;
}

export function EmailPreview({ 
  settings, 
  template,
  salutation = 'sie',
  placeholderValues = {} 
}: EmailPreviewProps) {
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
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.company_name || 'Logo'}
                style={{
                  width: `${settings.logo_width || 150}px`,
                  height: 'auto',
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
            <p
              style={{
                fontSize: '12px',
                color: settings.text_muted_color || '#71717a',
                margin: 0,
              }}
            >
              {footerText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
