import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Dynamic import for Resend to avoid Deno issues
const getResend = async () => {
  const { Resend } = await import("https://esm.sh/resend@2.0.0");
  return Resend;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WorkflowPayload {
  event: string;
  payload: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event, payload }: WorkflowPayload = await req.json();
    console.log(`[execute-workflow] Received event: ${event}`, payload);

    // Find all active workflows for this trigger event
    const { data: workflows, error: workflowsError } = await supabase
      .from("workflows")
      .select(`
        *,
        workflow_actions (*)
      `)
      .eq("trigger_event", event)
      .eq("is_active", true);

    if (workflowsError) {
      console.error("[execute-workflow] Error fetching workflows:", workflowsError);
      throw workflowsError;
    }

    console.log(`[execute-workflow] Found ${workflows?.length || 0} active workflows for event: ${event}`);

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active workflows for this event", event }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const workflow of workflows) {
      console.log(`[execute-workflow] Executing workflow: ${workflow.name}`);

      // Create workflow run record
      const { data: run, error: runError } = await supabase
        .from("workflow_runs")
        .insert({
          workflow_id: workflow.id,
          trigger_event: event,
          trigger_payload: payload,
          status: "running",
        })
        .select()
        .single();

      if (runError) {
        console.error("[execute-workflow] Error creating run:", runError);
        continue;
      }

      try {
        // Sort actions by sort_order
        const actions = workflow.workflow_actions?.sort(
          (a: any, b: any) => a.sort_order - b.sort_order
        ) || [];

        for (const action of actions) {
          if (!action.is_active) continue;

          console.log(`[execute-workflow] Executing action: ${action.action_type}`);
          await executeAction(supabase, action, payload);
        }

        // Mark run as success
        await supabase
          .from("workflow_runs")
          .update({ status: "success", completed_at: new Date().toISOString() })
          .eq("id", run.id);

        results.push({ workflow_id: workflow.id, status: "success" });
      } catch (actionError: any) {
        console.error(`[execute-workflow] Error in workflow ${workflow.id}:`, actionError);

        // Mark run as failed
        await supabase
          .from("workflow_runs")
          .update({
            status: "failed",
            error_message: actionError.message,
            completed_at: new Date().toISOString(),
          })
          .eq("id", run.id);

        results.push({ workflow_id: workflow.id, status: "failed", error: actionError.message });
      }
    }

    return new Response(
      JSON.stringify({ message: "Workflows executed", results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[execute-workflow] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function executeAction(
  supabase: any,
  action: any,
  payload: Record<string, unknown>
) {
  const config = action.action_config || {};

  switch (action.action_type) {
    case "send_email":
      await executeSendEmail(supabase, config, payload);
      break;

    case "send_webhook":
      await executeSendWebhook(config, payload);
      break;

    case "create_calendar_event":
      await executeCreateCalendarEvent(supabase, config, payload);
      break;

    case "create_gallery":
      await executeCreateGallery(supabase, config, payload);
      break;

    case "update_gallery_status":
      await executeUpdateGalleryStatus(supabase, config, payload);
      break;

    case "notify_admin":
      // For now, just log - could be extended to create in-app notifications
      console.log("[execute-workflow] Admin notification:", replaceTemplateVars(config.message_template || "", payload));
      break;

    default:
      console.warn(`[execute-workflow] Unknown action type: ${action.action_type}`);
  }
}

async function executeSendEmail(
  supabase: any,
  config: Record<string, unknown>,
  payload: Record<string, unknown>
) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY not configured");
  }

  const Resend = await getResend();
  const resend = new Resend(resendApiKey);

  // Get template
  const templateKey = config.template_key as string;
  if (!templateKey) {
    throw new Error("No template_key specified for send_email action");
  }

  const { data: template, error: templateError } = await supabase
    .from("email_templates")
    .select("*")
    .eq("template_key", templateKey)
    .eq("is_active", true)
    .single();

  if (templateError || !template) {
    throw new Error(`Template not found: ${templateKey}`);
  }

  // Determine recipients
  let recipients: string[] = [];
  const recipientType = config.recipient_type as string;

  switch (recipientType) {
    case "gallery_clients":
      if (payload.client_emails) {
        recipients = Array.isArray(payload.client_emails)
          ? payload.client_emails as string[]
          : [payload.client_emails as string];
      }
      break;

    case "booking_contact":
      if (payload.contact_email) {
        recipients = [payload.contact_email as string];
      }
      break;

    case "admin":
      // Get admin email from seo_settings or use default
      const { data: seoSettings } = await supabase
        .from("seo_settings")
        .select("support_email")
        .single();
      if (seoSettings?.support_email) {
        recipients = [seoSettings.support_email];
      }
      break;

    case "custom":
      const customRecipients = config.custom_recipients as string;
      if (customRecipients) {
        recipients = customRecipients.split(",").map((e: string) => e.trim());
      }
      break;
  }

  if (recipients.length === 0) {
    throw new Error("No recipients determined for send_email action");
  }

  // Use "Du" variant by default (could be made configurable)
  const subject = replaceTemplateVars(template.subject_du, payload);
  const body = replaceTemplateVars(template.body_du, payload);

  console.log(`[execute-workflow] Sending email to ${recipients.join(", ")}`);

  await resend.emails.send({
    from: "ImmoOnPoint <noreply@immoonpoint.de>",
    to: recipients,
    subject,
    html: body,
  });
}

async function executeSendWebhook(
  config: Record<string, unknown>,
  payload: Record<string, unknown>
) {
  const url = config.url as string;
  if (!url) {
    throw new Error("No URL specified for send_webhook action");
  }

  const method = (config.method as string) || "POST";
  
  let body: string;
  if (config.custom_body) {
    body = replaceTemplateVars(config.custom_body as string, payload);
  } else {
    body = JSON.stringify(payload);
  }

  console.log(`[execute-workflow] Sending webhook to ${url}`);

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: method !== "GET" ? body : undefined,
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }
}

async function executeCreateCalendarEvent(
  supabase: any,
  config: Record<string, unknown>,
  payload: Record<string, unknown>
) {
  const title = replaceTemplateVars((config.title_template as string) || "Event", payload);
  const description = replaceTemplateVars((config.description_template as string) || "", payload);
  const durationMinutes = (config.duration_minutes as number) || 60;

  // Get admin user ID (first admin)
  const { data: adminRole } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (!adminRole) {
    throw new Error("No admin user found for calendar event");
  }

  const startTime = payload.scheduled_date 
    ? new Date(`${payload.scheduled_date}T${payload.scheduled_start || "09:00"}`)
    : new Date();

  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  console.log(`[execute-workflow] Creating calendar event: ${title}`);

  await supabase.from("events").insert({
    user_id: adminRole.user_id,
    title,
    description,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    location: payload.address as string || null,
  });
}

async function executeCreateGallery(
  supabase: any,
  config: Record<string, unknown>,
  payload: Record<string, unknown>
) {
  const name = replaceTemplateVars((config.name_template as string) || "{address}", payload);
  const packageTargetCount = (config.package_target_count as number) || 25;

  // Generate slug
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
  
  console.log(`[execute-workflow] Creating gallery: ${name}`);

  const { data: gallery, error } = await supabase
    .from("galleries")
    .insert({
      name,
      slug: baseSlug + "-" + Date.now(),
      package_target_count: packageTargetCount,
      salutation_type: "Sie",
      status: "Planning",
      address: payload.address as string || null,
    })
    .select()
    .single();

  if (error) throw error;

  // If booking contact exists, try to link client
  if (payload.contact_email) {
    const { data: client } = await supabase
      .from("clients")
      .select("id")
      .eq("email", payload.contact_email)
      .single();

    if (client) {
      await supabase.from("gallery_clients").insert({
        gallery_id: gallery.id,
        client_id: client.id,
      });
    }
  }
}

async function executeUpdateGalleryStatus(
  supabase: any,
  config: Record<string, unknown>,
  payload: Record<string, unknown>
) {
  const newStatus = config.new_status as string;
  const galleryId = payload.gallery_id as string;

  if (!galleryId || !newStatus) {
    throw new Error("gallery_id and new_status required for update_gallery_status");
  }

  console.log(`[execute-workflow] Updating gallery ${galleryId} to status: ${newStatus}`);

  await supabase
    .from("galleries")
    .update({ status: newStatus })
    .eq("id", galleryId);
}

function replaceTemplateVars(template: string, payload: Record<string, unknown>): string {
  let result = template;
  for (const [key, value] of Object.entries(payload)) {
    const placeholder = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(placeholder, String(value ?? ""));
  }
  return result;
}
