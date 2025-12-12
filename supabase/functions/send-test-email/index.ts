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
  buildEmailText,
  replacePlaceholders,
  getEmailTypeFromCategory
} from "../_shared/email-helpers.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  template_key: string;
  to_email: string;
  salutation: "du" | "sie";
}

// Sample placeholder values for test emails
const TEST_PLACEHOLDERS: Record<string, string> = {
  vorname: "Max",
  nachname: "Mustermann",
  anrede: "Herr",
  full_name: "Max Mustermann",
  gallery_name: "Musterstraße 123",
  gallery_slug: "musterstrasse-123",
  gallery_url: "https://app.immoonpoint.de/gallery/musterstrasse-123",
  action_url: "https://app.immoonpoint.de",
  company_name: "Muster Immobilien GmbH",
  selected_count: "15",
  total_count: "24",
  staging_count: "3",
  year: new Date().getFullYear().toString(),
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify user is admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { template_key, to_email, salutation }: TestEmailRequest = await req.json();
    
    console.log(`Sending test email for template '${template_key}' to ${to_email}`);

    if (!template_key || !to_email) {
      return new Response(
        JSON.stringify({ error: "template_key and to_email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Load template from database
    const template = await getEmailTemplate(supabaseAdmin, template_key);
    
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Template '${template_key}' not found` }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Load design settings
    const designSettings = await getEmailDesignSettings(supabaseAdmin);
    
    // Get branding logo from SEO settings if use_branding_logo is enabled
    let brandingLogoUrl: string | undefined;
    if (designSettings?.use_branding_logo) {
      const { data: seoSettings } = await supabaseAdmin
        .from("seo_settings")
        .select("logo_dark_url, logo_url")
        .limit(1)
        .single();
      
      brandingLogoUrl = seoSettings?.logo_dark_url || seoSettings?.logo_url || undefined;
      console.log(`Using branding logo: ${brandingLogoUrl}`);
    }
    
    // Get email configuration from settings
    const fromAddress = getFromAddress(template, designSettings);
    const replyTo = getReplyTo(designSettings);
    const headers = getEmailHeaders(designSettings);
    
    console.log(`Using from address: ${fromAddress}`);
    if (replyTo) console.log(`Using reply-to: ${replyTo}`);

    // Determine email type from template category
    const emailType = getEmailTypeFromCategory(template.category || 'customer');

    // Build email HTML and text with test placeholders
    const emailHtml = buildEmailHtml(
      template,
      designSettings,
      salutation || "sie",
      TEST_PLACEHOLDERS,
      TEST_PLACEHOLDERS.action_url,
      emailType,
      brandingLogoUrl
    );

    const emailText = buildEmailText(
      template,
      designSettings,
      salutation || "sie",
      TEST_PLACEHOLDERS,
      TEST_PLACEHOLDERS.action_url,
      emailType
    );

    // Get subject with placeholders replaced
    const subjectTemplate = salutation === "du" ? template.subject_du : template.subject_sie;
    const emailSubject = `[TEST] ${replacePlaceholders(subjectTemplate, TEST_PLACEHOLDERS)}`;

    const emailResponse = await resend.emails.send({
      from: fromAddress,
      to: [to_email],
      reply_to: replyTo,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers,
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test-E-Mail wurde an ${to_email} gesendet`,
        from: fromAddress 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-test-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
