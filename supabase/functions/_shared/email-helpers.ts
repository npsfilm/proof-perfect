import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  from_email: string | null;
  subject_du: string;
  subject_sie: string;
  body_du: string;
  body_sie: string;
  heading_du: string | null;
  heading_sie: string | null;
  cta_text_du: string | null;
  cta_text_sie: string | null;
  cta_url_placeholder: string | null;
  available_placeholders: any;
}

export interface EmailDesignSettings {
  company_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  container_bg_color: string;
  text_color: string;
  text_muted_color: string;
  border_color: string;
  button_bg_color: string;
  button_text_color: string;
  button_border_radius: number;
  button_padding_x: number;
  button_padding_y: number;
  container_max_width: number;
  container_border_radius: number;
  content_padding: number;
  font_family: string;
  heading_font_size: number;
  body_font_size: number;
  line_height: number;
  footer_text: string | null;
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
}

const DEFAULT_FROM = "ImmoOnPoint <info@immoonpoint.de>";

/**
 * Get the from address for newsletters
 */
export function getNewsletterFromAddress(
  designSettings: EmailDesignSettings | null
): string {
  if (designSettings?.newsletter_from_email && designSettings?.newsletter_from_name) {
    return `${designSettings.newsletter_from_name} <${designSettings.newsletter_from_email}>`;
  }
  
  if (designSettings?.newsletter_from_email) {
    return `ImmoOnPoint Tipps <${designSettings.newsletter_from_email}>`;
  }
  
  // Fallback to general sender
  return getFromAddress(null, designSettings);
}

/**
 * Get Reply-To for newsletters
 */
export function getNewsletterReplyTo(designSettings: EmailDesignSettings | null): string | undefined {
  if (!designSettings?.newsletter_reply_to_email) {
    // Fallback to general reply-to
    return getReplyTo(designSettings);
  }
  
  if (designSettings.newsletter_reply_to_name) {
    return `${designSettings.newsletter_reply_to_name} <${designSettings.newsletter_reply_to_email}>`;
  }
  
  return designSettings.newsletter_reply_to_email;
}

/**
 * Get email template from database by template_key
 */
export async function getEmailTemplate(
  supabase: SupabaseClient,
  templateKey: string
): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("template_key", templateKey)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error(`Error fetching template '${templateKey}':`, error);
    return null;
  }

  return data;
}

/**
 * Get email design settings from database
 */
export async function getEmailDesignSettings(
  supabase: SupabaseClient
): Promise<EmailDesignSettings | null> {
  const { data, error } = await supabase
    .from("email_design_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching email design settings:", error);
    return null;
  }

  return data;
}

/**
 * Get the from address from settings or template, with fallback to default
 */
export function getFromAddress(
  template: EmailTemplate | null,
  designSettings: EmailDesignSettings | null = null,
  defaultFrom: string = DEFAULT_FROM
): string {
  // First check template override
  if (template?.from_email) {
    return template.from_email;
  }
  
  // Then check design settings
  if (designSettings?.default_from_email && designSettings?.default_from_name) {
    return `${designSettings.default_from_name} <${designSettings.default_from_email}>`;
  }
  
  if (designSettings?.default_from_email) {
    return `ImmoOnPoint <${designSettings.default_from_email}>`;
  }
  
  return defaultFrom;
}

/**
 * Get Reply-To header value from settings
 */
export function getReplyTo(designSettings: EmailDesignSettings | null): string | undefined {
  if (!designSettings?.reply_to_email) {
    return undefined;
  }
  
  if (designSettings.reply_to_name) {
    return `${designSettings.reply_to_name} <${designSettings.reply_to_email}>`;
  }
  
  return designSettings.reply_to_email;
}

/**
 * Get email headers for anti-spam optimization
 */
export function getEmailHeaders(designSettings: EmailDesignSettings | null): Record<string, string> | undefined {
  const headers: Record<string, string> = {};
  
  if (designSettings?.unsubscribe_email) {
    let unsubscribeValue = `<mailto:${designSettings.unsubscribe_email}>`;
    if (designSettings.unsubscribe_url) {
      unsubscribeValue += `, <${designSettings.unsubscribe_url}>`;
    }
    headers["List-Unsubscribe"] = unsubscribeValue;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }
  
  return Object.keys(headers).length > 0 ? headers : undefined;
}

/**
 * Replace placeholders in text with provided values
 */
export function replacePlaceholders(
  text: string,
  placeholders: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(placeholders)) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, value);
  }
  // Also handle {year} placeholder
  result = result.replace(/\{year\}/g, new Date().getFullYear().toString());
  return result;
}

/**
 * Build physical address string for footer
 */
function buildPhysicalAddress(settings: EmailDesignSettings): string {
  if (!settings.include_physical_address) {
    return "";
  }
  
  const parts: string[] = [settings.company_name || "ImmoOnPoint"];
  
  if (settings.physical_address_line1) {
    parts.push(settings.physical_address_line1);
  }
  if (settings.physical_address_line2) {
    parts.push(settings.physical_address_line2);
  }
  if (settings.physical_address_country) {
    parts.push(settings.physical_address_country);
  }
  
  return parts.join(" | ");
}

/**
 * Convert HTML to plain text for multipart emails
 */
export function buildEmailText(
  template: EmailTemplate,
  designSettings: EmailDesignSettings | null,
  salutation: "du" | "sie",
  placeholders: Record<string, string>,
  actionUrl?: string
): string {
  const settings = designSettings || {
    company_name: "ImmoOnPoint",
    footer_text: `© {year} ImmoOnPoint. Alle Rechte vorbehalten.`,
    include_physical_address: false,
    physical_address_line1: null,
    physical_address_line2: null,
    physical_address_country: null,
  } as EmailDesignSettings;

  const heading = salutation === "du" ? template.heading_du : template.heading_sie;
  const body = salutation === "du" ? template.body_du : template.body_sie;
  const ctaText = salutation === "du" ? template.cta_text_du : template.cta_text_sie;

  const processedHeading = heading ? replacePlaceholders(heading, placeholders) : "";
  const processedBody = replacePlaceholders(body, placeholders);
  const processedFooter = settings.footer_text ? replacePlaceholders(settings.footer_text, placeholders) : "";
  const physicalAddress = buildPhysicalAddress(settings);

  let text = `${settings.company_name || "ImmoOnPoint"}\n\n`;
  
  if (processedHeading) {
    text += `${processedHeading}\n\n`;
  }
  
  // Clean HTML tags from body
  text += processedBody
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .trim();
  text += "\n\n";
  
  if (ctaText && actionUrl) {
    text += `${ctaText}: ${actionUrl}\n\n`;
  } else if (actionUrl) {
    text += `Link: ${actionUrl}\n\n`;
  }
  
  text += "---\n";
  text += processedFooter;
  
  if (physicalAddress) {
    text += `\n${physicalAddress}`;
  }
  
  text += "\n\nE-Mail-Einstellungen verwalten: https://app.immoonpoint.de/dashboard?tab=settings";
  
  return text;
}

/**
 * Build HTML email from template and design settings
 */
export function buildEmailHtml(
  template: EmailTemplate,
  designSettings: EmailDesignSettings | null,
  salutation: "du" | "sie",
  placeholders: Record<string, string>,
  actionUrl?: string
): string {
  const settings = designSettings || {
    company_name: "ImmoOnPoint",
    primary_color: "#233c63",
    background_color: "#f4f4f5",
    container_bg_color: "#ffffff",
    text_color: "#18181b",
    text_muted_color: "#71717a",
    border_color: "#e4e4e7",
    button_bg_color: "#233c63",
    button_text_color: "#ffffff",
    button_border_radius: 8,
    button_padding_x: 32,
    button_padding_y: 16,
    container_max_width: 600,
    container_border_radius: 12,
    content_padding: 40,
    font_family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    heading_font_size: 24,
    body_font_size: 16,
    line_height: 1.6,
    footer_text: `© {year} ImmoOnPoint. Alle Rechte vorbehalten.`,
    logo_url: null,
    secondary_color: "#4f7942",
    include_physical_address: false,
    physical_address_line1: null,
    physical_address_line2: null,
    physical_address_country: null,
  } as EmailDesignSettings;

  const subject = salutation === "du" ? template.subject_du : template.subject_sie;
  const heading = salutation === "du" ? template.heading_du : template.heading_sie;
  const body = salutation === "du" ? template.body_du : template.body_sie;
  const ctaText = salutation === "du" ? template.cta_text_du : template.cta_text_sie;

  const processedHeading = heading ? replacePlaceholders(heading, placeholders) : "";
  const processedBody = replacePlaceholders(body, placeholders);
  const processedFooter = settings.footer_text ? replacePlaceholders(settings.footer_text, placeholders) : "";
  const physicalAddress = buildPhysicalAddress(settings);

  const logoHtml = settings.logo_url
    ? `<img src="${settings.logo_url}" alt="${settings.company_name}" style="max-width: 150px; height: auto;" />`
    : `<h1 style="margin: 0; color: ${settings.primary_color}; font-size: 28px; font-weight: 700;">${settings.company_name}</h1>`;

  const ctaHtml = ctaText && actionUrl
    ? `
      <table role="presentation" style="width: 100%; margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a href="${actionUrl}" 
               style="display: inline-block; padding: ${settings.button_padding_y}px ${settings.button_padding_x}px; background-color: ${settings.button_bg_color}; color: ${settings.button_text_color}; text-decoration: none; font-size: ${settings.body_font_size}px; font-weight: 600; border-radius: ${settings.button_border_radius}px;">
              ${ctaText}
            </a>
          </td>
        </tr>
      </table>
    `
    : "";

  const physicalAddressHtml = physicalAddress
    ? `<p style="margin: 10px 0 0; color: ${settings.text_muted_color}; font-size: 11px; text-align: center;">${physicalAddress}</p>`
    : "";

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: ${settings.font_family}; background-color: ${settings.background_color};">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: ${settings.container_max_width}px; margin: 0 auto; background-color: ${settings.container_bg_color}; border-radius: ${settings.container_border_radius}px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: ${settings.content_padding}px ${settings.content_padding}px 20px; text-align: center; border-bottom: 1px solid ${settings.border_color};">
              ${logoHtml}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: ${settings.content_padding}px;">
              ${processedHeading ? `<h2 style="margin: 0 0 20px; color: ${settings.text_color}; font-size: ${settings.heading_font_size}px; font-weight: 600;">${processedHeading}</h2>` : ""}
              
              <div style="margin: 0 0 20px; color: ${settings.text_color}; font-size: ${settings.body_font_size}px; line-height: ${settings.line_height};">
                ${processedBody.replace(/\n/g, "<br>")}
              </div>
              
              ${ctaHtml}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px ${settings.content_padding}px ${settings.content_padding}px; border-top: 1px solid ${settings.border_color};">
              ${actionUrl ? `
              <p style="margin: 0 0 15px; color: ${settings.text_muted_color}; font-size: 12px; text-align: center; line-height: 1.5;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link in Ihren Browser:<br>
                <a href="${actionUrl}" style="color: ${settings.primary_color}; word-break: break-all;">${actionUrl}</a>
              </p>
              ` : ""}
              <p style="margin: 0; color: ${settings.text_muted_color}; font-size: 12px; text-align: center;">
                ${processedFooter}
              </p>
              ${physicalAddressHtml}
              <p style="margin: 15px 0 0; text-align: center;">
                <a href="https://app.immoonpoint.de/dashboard?tab=settings" 
                   style="color: ${settings.text_muted_color}; font-size: 11px; text-decoration: underline;">
                  E-Mail-Einstellungen verwalten
                </a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
