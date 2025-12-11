import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NodeConfig {
  delay_value?: number;
  delay_unit?: 'minutes' | 'hours' | 'days';
  field?: string;
  operator?: string;
  value?: string;
  template_key?: string;
  template_id?: string; // legacy
  recipient_type?: string;
  custom_recipients?: string;
  webhook_url?: string;
  url?: string;
  method?: string;
  new_status?: string;
  message?: string;
  message_template?: string;
  priority?: string;
}

interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_type: string;
  action_type?: string;
  node_config: NodeConfig;
}

interface WorkflowEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_label?: string;
}

function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

// Calculate delay in milliseconds
function calculateDelay(config: NodeConfig): number {
  const value = config.delay_value || 1;
  const unit = config.delay_unit || 'hours';
  
  switch (unit) {
    case 'minutes': return value * 60 * 1000;
    case 'hours': return value * 60 * 60 * 1000;
    case 'days': return value * 24 * 60 * 60 * 1000;
    default: return value * 60 * 60 * 1000;
  }
}

// Get nested value from object using dot notation
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

// Evaluate condition
function evaluateCondition(config: NodeConfig, payload: Record<string, any>): boolean {
  const { field, operator, value } = config;
  if (!field || !operator) return false;
  
  const fieldValue = getNestedValue(payload, field);
  
  switch (operator) {
    case 'equals': return String(fieldValue) === String(value);
    case 'not_equals': return String(fieldValue) !== String(value);
    case 'contains': return String(fieldValue).includes(String(value));
    case 'not_contains': return !String(fieldValue).includes(String(value));
    case 'greater_than': return Number(fieldValue) > Number(value);
    case 'less_than': return Number(fieldValue) < Number(value);
    case 'is_empty': return !fieldValue || fieldValue === '';
    case 'is_not_empty': return !!fieldValue && fieldValue !== '';
    case 'is_true': return fieldValue === true || fieldValue === 'true';
    case 'is_false': return fieldValue === false || fieldValue === 'false';
    default: return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    const { run_id, node_id, payload, is_test = false } = await req.json();

    if (!run_id || !node_id) {
      throw new Error('run_id and node_id are required');
    }

    console.log(`[execute-workflow-step] Processing run=${run_id}, node=${node_id}, test=${is_test}`);

    // Get the node
    const { data: node, error: nodeError } = await supabase
      .from('workflow_nodes')
      .select('*')
      .eq('id', node_id)
      .single();

    if (nodeError || !node) {
      throw new Error(`Node not found: ${node_id}`);
    }

    // Get edges from this node
    const { data: edges } = await supabase
      .from('workflow_edges')
      .select('*')
      .eq('source_node_id', node_id);

    // Update run with current node and append to execution path
    const { data: currentRun } = await supabase
      .from('workflow_runs')
      .select('execution_path')
      .eq('id', run_id)
      .single();

    const executionPath = currentRun?.execution_path || [];
    executionPath.push({
      node_id,
      node_type: node.node_type,
      action_type: node.action_type,
      timestamp: new Date().toISOString(),
      status: 'executing'
    });

    await supabase
      .from('workflow_runs')
      .update({
        current_node_id: node_id,
        execution_path: executionPath,
        status: 'running'
      })
      .eq('id', run_id);

    // Helper to find next node
    const getNextNode = (edgeLabel: string = 'default'): WorkflowEdge | undefined => {
      return edges?.find(e => (e.edge_label || 'default') === edgeLabel) || edges?.[0];
    };

    // Process based on node type
    switch (node.node_type) {
      case 'trigger': {
        console.log(`[execute-workflow-step] Trigger node, finding first action`);
        const nextEdge = getNextNode('default');
        if (nextEdge) {
          // Continue to next node
          await executeNextStep(supabase, run_id, nextEdge.target_node_id, payload, is_test);
        } else {
          await completeRun(supabase, run_id, 'success');
        }
        break;
      }

      case 'action': {
        console.log(`[execute-workflow-step] Action node: ${node.action_type}`);
        
        if (!is_test) {
          await executeAction(supabase, node, payload);
        } else {
          console.log(`[execute-workflow-step] TEST MODE - Skipping actual action execution`);
        }

        // Update execution path with success
        executionPath[executionPath.length - 1].status = 'completed';
        await supabase
          .from('workflow_runs')
          .update({ execution_path: executionPath })
          .eq('id', run_id);

        const nextEdge = getNextNode('default');
        if (nextEdge) {
          await executeNextStep(supabase, run_id, nextEdge.target_node_id, payload, is_test);
        } else {
          await completeRun(supabase, run_id, 'success');
        }
        break;
      }

      case 'delay': {
        const delayMs = calculateDelay(node.node_config);
        const scheduledFor = new Date(Date.now() + delayMs);
        
        console.log(`[execute-workflow-step] Delay node: ${node.node_config.delay_value} ${node.node_config.delay_unit}, scheduled for ${scheduledFor.toISOString()}`);

        // Update execution path
        executionPath[executionPath.length - 1].status = 'waiting';
        executionPath[executionPath.length - 1].scheduled_for = scheduledFor.toISOString();
        await supabase
          .from('workflow_runs')
          .update({ 
            execution_path: executionPath,
            status: 'waiting'
          })
          .eq('id', run_id);

        if (is_test) {
          // In test mode, skip delay and continue immediately
          console.log(`[execute-workflow-step] TEST MODE - Skipping delay`);
          const nextEdge = getNextNode('default');
          if (nextEdge) {
            await executeNextStep(supabase, run_id, nextEdge.target_node_id, payload, is_test);
          } else {
            await completeRun(supabase, run_id, 'success');
          }
        } else {
          // Schedule the step for later
          await supabase
            .from('scheduled_workflow_steps')
            .insert({
              workflow_run_id: run_id,
              node_id: node_id,
              scheduled_for: scheduledFor.toISOString(),
              payload,
              status: 'pending'
            });
        }
        break;
      }

      case 'condition': {
        const result = evaluateCondition(node.node_config, payload);
        console.log(`[execute-workflow-step] Condition node: ${node.node_config.field} ${node.node_config.operator} ${node.node_config.value} = ${result}`);

        // Update execution path with result
        executionPath[executionPath.length - 1].status = 'completed';
        executionPath[executionPath.length - 1].result = result;
        await supabase
          .from('workflow_runs')
          .update({ execution_path: executionPath })
          .eq('id', run_id);

        const branch = result ? 'true' : 'false';
        const branchEdge = edges?.find(e => e.edge_label === branch);
        
        if (branchEdge) {
          await executeNextStep(supabase, run_id, branchEdge.target_node_id, payload, is_test);
        } else {
          console.log(`[execute-workflow-step] No branch found for ${branch}, completing`);
          await completeRun(supabase, run_id, 'success');
        }
        break;
      }

      case 'end': {
        console.log(`[execute-workflow-step] End node reached`);
        executionPath[executionPath.length - 1].status = 'completed';
        await supabase
          .from('workflow_runs')
          .update({ execution_path: executionPath })
          .eq('id', run_id);
        await completeRun(supabase, run_id, 'success');
        break;
      }

      default:
        console.log(`[execute-workflow-step] Unknown node type: ${node.node_type}`);
        await completeRun(supabase, run_id, 'failed', `Unknown node type: ${node.node_type}`);
    }

    return new Response(
      JSON.stringify({ success: true, node_id, node_type: node.node_type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[execute-workflow-step] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function executeNextStep(
  supabase: any, 
  runId: string, 
  nodeId: string, 
  payload: any,
  isTest: boolean
) {
  // Call this function recursively via HTTP to avoid stack issues
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  await fetch(`${supabaseUrl}/functions/v1/execute-workflow-step`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`
    },
    body: JSON.stringify({
      run_id: runId,
      node_id: nodeId,
      payload,
      is_test: isTest
    })
  });
}

async function completeRun(supabase: any, runId: string, status: string, error?: string) {
  const updateData: any = {
    status,
    completed_at: new Date().toISOString()
  };
  
  if (error) {
    updateData.error_message = error;
  }

  await supabase
    .from('workflow_runs')
    .update(updateData)
    .eq('id', runId);
}

// Resolve email recipients based on recipient_type and payload
function resolveRecipients(config: NodeConfig, payload: Record<string, any>): string[] {
  const recipientType = config.recipient_type || 'admin';
  
  switch (recipientType) {
    case 'new_client':
      // For client_created trigger
      return payload.email ? [payload.email] : [];
    case 'booking_contact':
      // For booking_created trigger
      return payload.contact_email ? [payload.contact_email] : [];
    case 'gallery_clients':
      // For gallery-related triggers
      if (Array.isArray(payload.client_emails)) {
        return payload.client_emails;
      }
      return payload.client_emails ? [payload.client_emails] : [];
    case 'requester':
      // For reopen_request and staging_requested triggers
      return payload.user_email ? [payload.user_email] : 
             payload.requester_email ? [payload.requester_email] : [];
    case 'admin':
      // Admin email - could be fetched from settings
      return ['admin@immoonpoint.de'];
    case 'custom':
      // Custom recipients from config
      if (config.custom_recipients) {
        return config.custom_recipients.split(',').map((e: string) => e.trim()).filter(Boolean);
      }
      return [];
    default:
      console.log(`[resolveRecipients] Unknown recipient_type: ${recipientType}`);
      return [];
  }
}

async function executeAction(supabase: any, node: WorkflowNode, payload: any) {
  const config = node.node_config;
  
  switch (node.action_type) {
    case 'send_email': {
      const templateKey = config.template_key || config.template_id;
      if (templateKey) {
        const recipients = resolveRecipients(config, payload);
        console.log(`[executeAction] Sending email with template ${templateKey} to ${recipients.join(', ')}`);
        
        if (recipients.length === 0) {
          console.log(`[executeAction] No recipients found, skipping email`);
          break;
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        // Send to each recipient
        for (const recipient of recipients) {
          await fetch(`${supabaseUrl}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`
            },
            body: JSON.stringify({
              template_key: templateKey,
              recipient_email: recipient,
              placeholders: payload
            })
          });
        }
      }
      break;
    }

    case 'send_webhook': {
      const webhookUrl = config.url || config.webhook_url;
      if (webhookUrl) {
        const method = config.method || 'POST';
        console.log(`[executeAction] Sending ${method} webhook to ${webhookUrl}`);
        await fetch(webhookUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      break;
    }

    case 'update_gallery_status': {
      if (config.new_status && payload.gallery_id) {
        console.log(`[executeAction] Updating gallery ${payload.gallery_id} to status ${config.new_status}`);
        await supabase
          .from('galleries')
          .update({ status: config.new_status })
          .eq('id', payload.gallery_id);
      }
      break;
    }

    case 'notify_admin': {
      const message = config.message_template || config.message || 'Workflow notification';
      const priority = config.priority || 'normal';
      console.log(`[executeAction] Admin notification (${priority}): ${message}`);
      // Could integrate with in-app notifications or email
      break;
    }

    default:
      console.log(`[executeAction] Unknown action type: ${node.action_type}`);
  }
}
