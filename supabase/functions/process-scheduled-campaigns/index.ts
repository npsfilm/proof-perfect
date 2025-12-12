import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find scheduled campaigns that are due
    const { data: dueCampaigns, error } = await supabase
      .from("newsletter_campaigns")
      .select("id, name")
      .eq("status", "scheduled")
      .lte("scheduled_for", new Date().toISOString());

    if (error) {
      throw error;
    }

    console.log(`Found ${dueCampaigns?.length || 0} scheduled campaigns to process`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const campaign of dueCampaigns || []) {
      try {
        // Call send-campaign function
        const response = await fetch(
          `${supabaseUrl}/functions/v1/send-campaign`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ campaignId: campaign.id }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send campaign");
        }

        results.push({ id: campaign.id, success: true });
        console.log(`Successfully triggered campaign ${campaign.name}`);
      } catch (error) {
        console.error(`Failed to trigger campaign ${campaign.id}:`, error);
        results.push({
          id: campaign.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        processed: dueCampaigns?.length || 0,
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing scheduled campaigns:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
