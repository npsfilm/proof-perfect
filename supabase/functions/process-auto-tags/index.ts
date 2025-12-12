import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AutoCondition {
  field: string;
  operator: string;
  value: number;
}

interface ClientMetrics {
  client_id: string;
  email: string;
  booking_count: number;
  total_revenue_cents: number;
  days_since_last_booking: number;
  staging_count: number;
  blue_hour_count: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting auto-tag processing...');

    // Get all active auto-tags
    const { data: autoTags, error: tagsError } = await supabase
      .from('client_tags')
      .select('*')
      .eq('tag_type', 'auto')
      .eq('is_active', true);

    if (tagsError) {
      throw new Error(`Failed to fetch auto-tags: ${tagsError.message}`);
    }

    console.log(`Found ${autoTags?.length || 0} active auto-tags`);

    if (!autoTags || autoTags.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active auto-tags found', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all client metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('v_client_metrics')
      .select('*');

    if (metricsError) {
      throw new Error(`Failed to fetch client metrics: ${metricsError.message}`);
    }

    console.log(`Found ${metrics?.length || 0} clients to evaluate`);

    let assignedCount = 0;
    let removedCount = 0;

    // Process each auto-tag
    for (const tag of autoTags) {
      const conditions = tag.auto_conditions as AutoCondition;
      
      if (!conditions?.field || !conditions?.operator || conditions?.value === undefined) {
        console.log(`Skipping tag ${tag.name}: incomplete conditions`);
        continue;
      }

      // Get current assignments for this tag
      const { data: currentAssignments } = await supabase
        .from('client_tag_assignments')
        .select('client_id')
        .eq('tag_id', tag.id);

      const currentlyAssigned = new Set(currentAssignments?.map(a => a.client_id) || []);

      // Evaluate each client
      for (const client of (metrics as ClientMetrics[]) || []) {
        const fieldValue = client[conditions.field as keyof ClientMetrics] as number;
        const shouldHaveTag = evaluateCondition(fieldValue, conditions.operator, conditions.value);
        const hasTag = currentlyAssigned.has(client.client_id);

        if (shouldHaveTag && !hasTag) {
          // Assign tag
          const { error: assignError } = await supabase
            .from('client_tag_assignments')
            .insert({
              client_id: client.client_id,
              tag_id: tag.id,
              assigned_by: 'auto',
            });

          if (!assignError) {
            assignedCount++;
            console.log(`Assigned tag "${tag.name}" to client ${client.email}`);
          }
        } else if (!shouldHaveTag && hasTag) {
          // Remove tag (only if it was auto-assigned)
          const { data: assignment } = await supabase
            .from('client_tag_assignments')
            .select('assigned_by')
            .eq('client_id', client.client_id)
            .eq('tag_id', tag.id)
            .single();

          if (assignment?.assigned_by === 'auto') {
            const { error: removeError } = await supabase
              .from('client_tag_assignments')
              .delete()
              .eq('client_id', client.client_id)
              .eq('tag_id', tag.id);

            if (!removeError) {
              removedCount++;
              console.log(`Removed tag "${tag.name}" from client ${client.email}`);
            }
          }
        }
      }
    }

    console.log(`Processing complete. Assigned: ${assignedCount}, Removed: ${removedCount}`);

    return new Response(
      JSON.stringify({
        message: 'Auto-tag processing complete',
        assigned: assignedCount,
        removed: removedCount,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error processing auto-tags:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function evaluateCondition(fieldValue: number, operator: string, targetValue: number): boolean {
  switch (operator) {
    case 'eq':
      return fieldValue === targetValue;
    case 'gte':
      return fieldValue >= targetValue;
    case 'lte':
      return fieldValue <= targetValue;
    case 'gt':
      return fieldValue > targetValue;
    case 'lt':
      return fieldValue < targetValue;
    default:
      return false;
  }
}
