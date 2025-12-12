import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Enrollment {
  id: string;
  client_id: string;
  sequence_id: string;
  current_step: number;
  status: string;
  next_send_at: string;
}

interface Client {
  id: string;
  email: string;
  vorname: string;
  nachname: string;
  ansprache: string;
  anrede: string | null;
}

interface SequenceStep {
  id: string;
  sequence_id: string;
  template_id: string;
  step_order: number;
  delay_from_previous_minutes: number;
  subject_override: string | null;
}

interface EmailTemplate {
  id: string;
  subject_du: string;
  subject_sie: string;
  body_du: string;
  body_sie: string;
  heading_du: string | null;
  heading_sie: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    console.log("Processing email sequences...");

    // Find enrollments that are due
    const now = new Date().toISOString();
    const { data: dueEnrollments, error: enrollmentError } = await supabase
      .from("email_sequence_enrollments")
      .select("*")
      .eq("status", "active")
      .lte("next_send_at", now);

    if (enrollmentError) {
      throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`);
    }

    console.log(`Found ${dueEnrollments?.length || 0} due enrollments`);

    const results: { success: number; failed: number; completed: number } = {
      success: 0,
      failed: 0,
      completed: 0,
    };

    for (const enrollment of (dueEnrollments || []) as Enrollment[]) {
      try {
        // Get the current step
        const { data: steps, error: stepsError } = await supabase
          .from("email_sequence_steps")
          .select("*")
          .eq("sequence_id", enrollment.sequence_id)
          .order("step_order");

        if (stepsError) {
          console.error(`Failed to fetch steps for sequence ${enrollment.sequence_id}:`, stepsError);
          results.failed++;
          continue;
        }

        const currentStepIndex = enrollment.current_step;
        const currentStep = steps?.[currentStepIndex] as SequenceStep | undefined;

        if (!currentStep) {
          // No more steps, mark as completed
          await supabase
            .from("email_sequence_enrollments")
            .update({
              status: "completed",
              completed_at: now,
            })
            .eq("id", enrollment.id);
          
          console.log(`Enrollment ${enrollment.id} completed (no more steps)`);
          results.completed++;
          continue;
        }

        // Get client data
        const { data: client, error: clientError } = await supabase
          .from("clients")
          .select("*")
          .eq("id", enrollment.client_id)
          .single();

        if (clientError || !client) {
          console.error(`Failed to fetch client ${enrollment.client_id}:`, clientError);
          results.failed++;
          continue;
        }

        const typedClient = client as Client;

        // Get email template
        const { data: template, error: templateError } = await supabase
          .from("email_templates")
          .select("*")
          .eq("id", currentStep.template_id)
          .single();

        if (templateError || !template) {
          console.error(`Failed to fetch template ${currentStep.template_id}:`, templateError);
          results.failed++;
          continue;
        }

        const typedTemplate = template as EmailTemplate;

        // Determine Du/Sie based on client preference
        const useDu = typedClient.ansprache === "du";
        const subject = currentStep.subject_override || (useDu ? typedTemplate.subject_du : typedTemplate.subject_sie);
        const body = useDu ? typedTemplate.body_du : typedTemplate.body_sie;
        const heading = useDu ? typedTemplate.heading_du : typedTemplate.heading_sie;

        // Replace placeholders
        const placeholders: Record<string, string> = {
          "{vorname}": typedClient.vorname,
          "{nachname}": typedClient.nachname,
          "{email}": typedClient.email,
          "{anrede}": typedClient.anrede || "",
          "{vollständige_anrede}": typedClient.anrede ? `${typedClient.anrede} ${typedClient.nachname}` : typedClient.nachname,
        };

        let processedSubject = subject;
        let processedBody = body;
        let processedHeading = heading || "";

        for (const [key, value] of Object.entries(placeholders)) {
          processedSubject = processedSubject.replace(new RegExp(key, "g"), value);
          processedBody = processedBody.replace(new RegExp(key, "g"), value);
          processedHeading = processedHeading.replace(new RegExp(key, "g"), value);
        }

        // Send email via Resend if configured
        if (resend) {
          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              ${processedHeading ? `<h1 style="color: #233c63;">${processedHeading}</h1>` : ""}
              <div style="line-height: 1.6; color: #333;">
                ${processedBody.replace(/\n/g, "<br>")}
              </div>
            </body>
            </html>
          `;

          const { error: emailError } = await resend.emails.send({
            from: "ImmoOnPoint <info@immoonpoint.de>",
            to: [typedClient.email],
            subject: processedSubject,
            html: htmlContent,
          });

          if (emailError) {
            console.error(`Failed to send email to ${typedClient.email}:`, emailError);
            results.failed++;
            continue;
          }

          console.log(`Email sent to ${typedClient.email} (step ${currentStepIndex + 1})`);
        } else {
          console.log(`[DRY RUN] Would send email to ${typedClient.email} (step ${currentStepIndex + 1})`);
        }

        // Calculate next send time
        const nextStepIndex = currentStepIndex + 1;
        const nextStep = steps?.[nextStepIndex] as SequenceStep | undefined;

        if (nextStep) {
          const nextSendAt = new Date(Date.now() + nextStep.delay_from_previous_minutes * 60 * 1000).toISOString();
          
          await supabase
            .from("email_sequence_enrollments")
            .update({
              current_step: nextStepIndex,
              next_send_at: nextSendAt,
            })
            .eq("id", enrollment.id);
          
          console.log(`Enrollment ${enrollment.id} advanced to step ${nextStepIndex + 1}, next send at ${nextSendAt}`);
        } else {
          // Last step completed
          await supabase
            .from("email_sequence_enrollments")
            .update({
              current_step: nextStepIndex,
              status: "completed",
              completed_at: now,
            })
            .eq("id", enrollment.id);
          
          console.log(`Enrollment ${enrollment.id} completed`);
          results.completed++;
        }

        results.success++;
      } catch (error) {
        console.error(`Error processing enrollment ${enrollment.id}:`, error);
        results.failed++;
      }
    }

    console.log(`Processing complete: ${results.success} success, ${results.failed} failed, ${results.completed} completed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: dueEnrollments?.length || 0,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in process-email-sequences:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
