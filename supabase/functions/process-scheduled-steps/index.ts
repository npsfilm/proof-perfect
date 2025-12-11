import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    const now = new Date().toISOString();

    console.log(`[process-scheduled-steps] Checking for pending steps at ${now}`);

    // Find all pending steps that are due
    const { data: pendingSteps, error: fetchError } = await supabase
      .from('scheduled_workflow_steps')
      .select(`
        *,
        workflow_nodes!inner(id, workflow_id, node_type, action_type, node_config)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('[process-scheduled-steps] Error fetching steps:', fetchError);
      throw fetchError;
    }

    if (!pendingSteps || pendingSteps.length === 0) {
      console.log('[process-scheduled-steps] No pending steps to process');
      return new Response(
        JSON.stringify({ processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[process-scheduled-steps] Found ${pendingSteps.length} pending steps`);

    let processedCount = 0;
    let errorCount = 0;

    for (const step of pendingSteps) {
      try {
        // Mark as processing
        await supabase
          .from('scheduled_workflow_steps')
          .update({ status: 'processing' })
          .eq('id', step.id);

        console.log(`[process-scheduled-steps] Processing step ${step.id} for run ${step.workflow_run_id}`);

        // Get the edges from this delay node to find next node
        const { data: edges } = await supabase
          .from('workflow_edges')
          .select('*')
          .eq('source_node_id', step.node_id);

        const nextEdge = edges?.[0];

        if (nextEdge) {
          // Continue workflow execution from the next node
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

          const response = await fetch(`${supabaseUrl}/functions/v1/execute-workflow-step`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({
              run_id: step.workflow_run_id,
              node_id: nextEdge.target_node_id,
              payload: step.payload || {}
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to execute next step: ${errorText}`);
          }
        } else {
          // No next node, complete the run
          await supabase
            .from('workflow_runs')
            .update({
              status: 'success',
              completed_at: new Date().toISOString()
            })
            .eq('id', step.workflow_run_id);
        }

        // Mark as completed
        await supabase
          .from('scheduled_workflow_steps')
          .update({
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', step.id);

        processedCount++;
        console.log(`[process-scheduled-steps] Successfully processed step ${step.id}`);

      } catch (stepError: unknown) {
        const errorMessage = stepError instanceof Error ? stepError.message : 'Unknown error';
        console.error(`[process-scheduled-steps] Error processing step ${step.id}:`, stepError);
        
        // Mark as failed
        await supabase
          .from('scheduled_workflow_steps')
          .update({
            status: 'failed',
            error_message: errorMessage,
            processed_at: new Date().toISOString()
          })
          .eq('id', step.id);

        // Also update the workflow run status
        await supabase
          .from('workflow_runs')
          .update({
            status: 'failed',
            error_message: `Scheduled step failed: ${errorMessage}`,
            completed_at: new Date().toISOString()
          })
          .eq('id', step.workflow_run_id);

        errorCount++;
      }
    }

    // Clean up old completed steps (older than 7 days)
    const cleanupDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('scheduled_workflow_steps')
      .delete()
      .eq('status', 'completed')
      .lt('processed_at', cleanupDate);

    console.log(`[process-scheduled-steps] Completed. Processed: ${processedCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({ 
        processed: processedCount, 
        errors: errorCount,
        timestamp: now 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[process-scheduled-steps] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
