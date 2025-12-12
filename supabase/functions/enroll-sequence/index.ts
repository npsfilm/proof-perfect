import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnrollRequest {
  client_id: string;
  trigger_event: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { client_id, trigger_event } = await req.json() as EnrollRequest;

    if (!client_id || !trigger_event) {
      return new Response(
        JSON.stringify({ error: "client_id and trigger_event are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Enrolling client ${client_id} for trigger event: ${trigger_event}`);

    // Find active sequences for this trigger event
    const { data: sequences, error: seqError } = await supabase
      .from("email_sequences")
      .select("id, delay_after_trigger_minutes")
      .eq("trigger_event", trigger_event)
      .eq("is_active", true);

    if (seqError) {
      throw new Error(`Failed to fetch sequences: ${seqError.message}`);
    }

    if (!sequences || sequences.length === 0) {
      console.log(`No active sequences found for trigger: ${trigger_event}`);
      return new Response(
        JSON.stringify({ success: true, enrolled: 0, message: "No active sequences for this trigger" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    let enrolled = 0;
    const errors: string[] = [];

    for (const sequence of sequences) {
      // Check if client is already enrolled
      const { data: existing } = await supabase
        .from("email_sequence_enrollments")
        .select("id")
        .eq("client_id", client_id)
        .eq("sequence_id", sequence.id)
        .single();

      if (existing) {
        console.log(`Client ${client_id} already enrolled in sequence ${sequence.id}`);
        continue;
      }

      // Calculate first send time
      const delayMinutes = sequence.delay_after_trigger_minutes || 0;
      const nextSendAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();

      // Create enrollment
      const { error: insertError } = await supabase
        .from("email_sequence_enrollments")
        .insert([{
          client_id,
          sequence_id: sequence.id,
          current_step: 0,
          status: "active",
          next_send_at: nextSendAt,
        }]);

      if (insertError) {
        console.error(`Failed to enroll client in sequence ${sequence.id}:`, insertError);
        errors.push(`Sequence ${sequence.id}: ${insertError.message}`);
      } else {
        console.log(`Client ${client_id} enrolled in sequence ${sequence.id}, first send at ${nextSendAt}`);
        enrolled++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrolled,
        total_sequences: sequences.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in enroll-sequence:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
