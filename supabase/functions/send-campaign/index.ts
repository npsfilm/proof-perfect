import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import {
  getEmailDesignSettings,
  getNewsletterFromAddress,
  getNewsletterReplyTo,
  getEmailHeaders,
  buildEmailHtml,
  buildEmailText,
  replacePlaceholders,
} from "../_shared/email-helpers.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin role
    const userSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userSupabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaignId } = await req.json();

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error("Campaign not found");
    }

    if (campaign.status !== "draft" && campaign.status !== "scheduled") {
      throw new Error("Campaign already sent or cancelled");
    }

    // Update status to sending
    await supabase
      .from("newsletter_campaigns")
      .update({ status: "sending" })
      .eq("id", campaignId);

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("id", campaign.template_id)
      .single();

    if (templateError || !template) {
      throw new Error("Template not found");
    }

    // Fetch design settings
    const designSettings = await getEmailDesignSettings(supabase);

    // Build recipient list
    let recipientsQuery = supabase
      .from("clients")
      .select("id, email, vorname, nachname, anrede, ansprache")
      .eq("email_newsletter_marketing", true);

    const { data: allClients } = await recipientsQuery;

    let recipients = allClients || [];

    // Filter by target tags if specified
    if (campaign.target_tags && campaign.target_tags.length > 0) {
      const { data: tagAssignments } = await supabase
        .from("client_tag_assignments")
        .select("client_id, tag_id");

      const clientsWithTargetTags = new Set(
        tagAssignments
          ?.filter((a) => campaign.target_tags.includes(a.tag_id))
          .map((a) => a.client_id) || []
      );

      recipients = recipients.filter((r) => clientsWithTargetTags.has(r.id));
    }

    // Exclude by exclude tags
    if (campaign.exclude_tags && campaign.exclude_tags.length > 0) {
      const { data: tagAssignments } = await supabase
        .from("client_tag_assignments")
        .select("client_id, tag_id");

      const clientsWithExcludeTags = new Set(
        tagAssignments
          ?.filter((a) => campaign.exclude_tags.includes(a.tag_id))
          .map((a) => a.client_id) || []
      );

      recipients = recipients.filter((r) => !clientsWithExcludeTags.has(r.id));
    }

    const fromAddress = getNewsletterFromAddress(designSettings);
    const replyTo = getNewsletterReplyTo(designSettings);
    const headers = getEmailHeaders(designSettings);

    let sentCount = 0;
    const errors: string[] = [];

    // Send emails
    for (const client of recipients) {
      try {
        const salutation = (client.ansprache === "du" ? "du" : "sie") as "du" | "sie";
        const isSie = salutation === "sie";
        const subject = isSie ? template.subject_sie : template.subject_du;

        const placeholders: Record<string, string> = {
          vorname: client.vorname || "",
          nachname: client.nachname || "",
          vollständige_anrede: `${client.anrede || ""} ${client.nachname || ""}`.trim(),
          gruss_formal: isSie ? "Sehr geehrte/r" : "Liebe/r",
          firma: "",
        };

        const personalizedSubject = replacePlaceholders(subject, placeholders);

        const html = buildEmailHtml(
          template,
          designSettings,
          salutation,
          placeholders,
          undefined,
          "newsletter"
        );

        const text = buildEmailText(
          template,
          designSettings,
          salutation,
          placeholders,
          undefined,
          "newsletter"
        );

        await resend.emails.send({
          from: fromAddress,
          to: [client.email],
          subject: personalizedSubject,
          html,
          text,
          reply_to: replyTo,
          headers,
        });

        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${client.email}:`, error);
        errors.push(client.email);
      }
    }

    // Update campaign status
    await supabase
      .from("newsletter_campaigns")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        recipient_count: sentCount,
      })
      .eq("id", campaignId);

    console.log(`Campaign ${campaignId} sent to ${sentCount} recipients`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errors.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending campaign:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
