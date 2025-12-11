import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeatureRequest {
  id: string;
  user_email: string;
  user_name: string | null;
  title: string;
  description: string;
  priority: string;
  image_url: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { request }: { request: FeatureRequest } = await req.json();

    // Get support email from SEO settings
    const { data: seoSettings } = await supabaseClient
      .from("seo_settings")
      .select("support_email")
      .single();

    const supportEmail = seoSettings?.support_email || "support@immoonpoint.de";
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://app.immoonpoint.de";

    const priorityLabels: Record<string, string> = {
      low: "Niedrig",
      normal: "Normal",
      high: "Hoch 🔴",
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #233c63; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 16px; }
          .label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
          .value { background: white; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; }
          .priority-high { color: #dc2626; font-weight: 600; }
          .priority-normal { color: #2563eb; }
          .priority-low { color: #6b7280; }
          .btn { display: inline-block; background: #233c63; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
          .image-preview { max-width: 100%; border-radius: 6px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">💡 Neue Feature-Anfrage</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Von</div>
              <div class="value">
                ${request.user_name ? `${request.user_name} &lt;${request.user_email}&gt;` : request.user_email}
              </div>
            </div>
            
            <div class="field">
              <div class="label">Titel</div>
              <div class="value"><strong>${request.title}</strong></div>
            </div>
            
            <div class="field">
              <div class="label">Priorität</div>
              <div class="value priority-${request.priority}">
                ${priorityLabels[request.priority] || request.priority}
              </div>
            </div>
            
            <div class="field">
              <div class="label">Beschreibung</div>
              <div class="value" style="white-space: pre-wrap;">${request.description}</div>
            </div>
            
            ${request.image_url ? `
              <div class="field">
                <div class="label">Screenshot</div>
                <div class="value">
                  <a href="${request.image_url}" target="_blank">
                    <img src="${request.image_url}" alt="Screenshot" class="image-preview" />
                  </a>
                </div>
              </div>
            ` : ''}
            
            <a href="${frontendUrl}/admin/feature-requests" class="btn">
              Im Dashboard ansehen →
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email via Resend REST API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ImmoOnPoint <noreply@immoonpoint.de>",
        to: [supportEmail],
        subject: `[Feature-Anfrage] ${request.title}`,
        html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Email send error:", errorData);
      throw new Error(errorData.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
