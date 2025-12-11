import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  getEmailTemplate, 
  getEmailDesignSettings, 
  getFromAddress, 
  getReplyTo,
  getEmailHeaders,
  buildEmailHtml,
  buildEmailText 
} from "../_shared/email-helpers.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  user_id: string;
  email: string;
}

const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const getFrontendUrl = (req: Request): string => {
  const origin = req.headers.get('origin');
  if (origin) {
    console.log(`Using origin from request header: ${origin}`);
    return origin;
  }
  
  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      console.log(`Using referer origin: ${url.origin}`);
      return url.origin;
    } catch {}
  }
  
  const envUrl = Deno.env.get("FRONTEND_URL");
  if (envUrl) {
    console.log(`Using FRONTEND_URL from env: ${envUrl}`);
    return envUrl;
  }
  
  console.log("Using fallback production URL");
  return "https://app.immoonpoint.de";
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email }: VerificationRequest = await req.json();
    
    console.log(`Sending verification email to ${email} for user ${user_id}`);

    if (!user_id || !email) {
      return new Response(
        JSON.stringify({ error: "user_id and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Load email template and design settings from database
    const template = await getEmailTemplate(supabaseAdmin, "verification");
    const designSettings = await getEmailDesignSettings(supabaseAdmin);
    
    // Get email configuration from settings
    const fromAddress = getFromAddress(template, designSettings);
    const replyTo = getReplyTo(designSettings);
    const headers = getEmailHeaders(designSettings);
    
    console.log(`Using from address: ${fromAddress}`);
    if (replyTo) console.log(`Using reply-to: ${replyTo}`);

    // Delete any existing tokens for this user
    await supabaseAdmin
      .from("email_verification_tokens")
      .delete()
      .eq("user_id", user_id);

    // Generate new token with 24h expiry
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabaseAdmin
      .from("email_verification_tokens")
      .insert({
        user_id,
        email: email.toLowerCase(),
        token,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("Error inserting token:", insertError);
      throw new Error("Failed to create verification token");
    }

    const frontendUrl = getFrontendUrl(req);
    const verificationLink = `${frontendUrl}/auth/verify-email?token=${token}`;

    // Build email HTML and text from template or use fallback
    let emailHtml: string;
    let emailText: string;
    let emailSubject: string;

    if (template) {
      emailHtml = buildEmailHtml(
        template,
        designSettings,
        "sie",
        { action_url: verificationLink },
        verificationLink
      );
      emailText = buildEmailText(
        template,
        designSettings,
        "sie",
        { action_url: verificationLink },
        verificationLink
      );
      emailSubject = template.subject_sie;
    } else {
      // Fallback HTML if no template exists
      emailSubject = "Willkommen bei ImmoOnPoint – Bitte bestätigen Sie Ihre E-Mail";
      emailHtml = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; color: #233c63; font-size: 28px; font-weight: 700;">ImmoOnPoint</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; font-weight: 600;">Willkommen bei ImmoOnPoint!</h2>
              <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
                Vielen Dank für Ihre Registrierung. Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.
              </p>
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 16px 32px; background-color: #233c63; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      E-Mail bestätigen
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; color: #71717a; font-size: 14px; line-height: 1.6;">
                <strong>Hinweis:</strong> Dieser Link ist <strong>24 Stunden</strong> gültig.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center; line-height: 1.5;">
                Falls der Button nicht funktioniert, kopieren Sie diesen Link:<br>
                <a href="${verificationLink}" style="color: #233c63; word-break: break-all;">${verificationLink}</a>
              </p>
              <p style="margin: 20px 0 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} ImmoOnPoint. Alle Rechte vorbehalten.
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
      emailText = `ImmoOnPoint

Willkommen bei ImmoOnPoint!

Vielen Dank für Ihre Registrierung. Um Ihr Konto zu aktivieren, bestätigen Sie bitte Ihre E-Mail-Adresse.

E-Mail bestätigen: ${verificationLink}

Hinweis: Dieser Link ist 24 Stunden gültig.

---
© ${new Date().getFullYear()} ImmoOnPoint. Alle Rechte vorbehalten.`;
    }

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [email],
      reply_to: replyTo,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-verification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
