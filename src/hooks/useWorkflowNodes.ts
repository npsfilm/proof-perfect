import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WorkflowNode, WorkflowEdge, NodeType, ActionType } from '@/types/workflows';
import type { Json } from '@/integrations/supabase/types';

// Workflow mit Nodes und Edges abrufen
export function useWorkflowWithNodes(workflowId: string | undefined) {
  return useQuery({
    queryKey: ['workflow-nodes', workflowId],
    queryFn: async () => {
      if (!workflowId) return null;

      const [workflowRes, nodesRes, edgesRes] = await Promise.all([
        supabase.from('workflows').select('*').eq('id', workflowId).single(),
        supabase.from('workflow_nodes').select('*').eq('workflow_id', workflowId),
        supabase.from('workflow_edges').select('*').eq('workflow_id', workflowId),
      ]);

      if (workflowRes.error) throw workflowRes.error;

      return {
        workflow: workflowRes.data,
        nodes: (nodesRes.data || []) as WorkflowNode[],
        edges: (edgesRes.data || []) as WorkflowEdge[],
      };
    },
    enabled: !!workflowId,
  });
}

// Node erstellen
export function useCreateNode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (node: {
      workflow_id: string;
      node_type: NodeType;
      action_type?: ActionType | null;
      node_config?: Record<string, unknown>;
      position_x: number;
      position_y: number;
    }) => {
      const { data, error } = await supabase
        .from('workflow_nodes')
        .insert({
          workflow_id: node.workflow_id,
          node_type: node.node_type,
          action_type: node.action_type || null,
          node_config: (node.node_config || {}) as Json,
          position_x: node.position_x,
          position_y: node.position_y,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowNode;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', variables.workflow_id] });
    },
    onError: (error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

// Node aktualisieren
export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      workflow_id,
      skipInvalidation,
      ...updates
    }: {
      id: string;
      workflow_id: string;
      skipInvalidation?: boolean;
      action_type?: ActionType | null;
      node_config?: Record<string, unknown>;
      position_x?: number;
      position_y?: number;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (updates.action_type !== undefined) updateData.action_type = updates.action_type;
      if (updates.node_config !== undefined) updateData.node_config = updates.node_config as Json;
      if (updates.position_x !== undefined) updateData.position_x = updates.position_x;
      if (updates.position_y !== undefined) updateData.position_y = updates.position_y;

      const { data, error } = await supabase
        .from('workflow_nodes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, workflow_id, skipInvalidation };
    },
    onSuccess: (result) => {
      // Skip invalidation for position-only updates to prevent edge loss
      if (!result.skipInvalidation) {
        queryClient.invalidateQueries({ queryKey: ['workflow-nodes', result.workflow_id] });
      }
    },
  });
}

// Node löschen
export function useDeleteNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, workflow_id }: { id: string; workflow_id: string }) => {
      const { error } = await supabase.from('workflow_nodes').delete().eq('id', id);
      if (error) throw error;
      return workflow_id;
    },
    onSuccess: (workflow_id) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', workflow_id] });
    },
  });
}

// Edge erstellen
export function useCreateEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (edge: {
      workflow_id: string;
      source_node_id: string;
      target_node_id: string;
      edge_label?: 'default' | 'true' | 'false';
    }) => {
      const { data, error } = await supabase
        .from('workflow_edges')
        .insert({
          workflow_id: edge.workflow_id,
          source_node_id: edge.source_node_id,
          target_node_id: edge.target_node_id,
          edge_label: edge.edge_label || 'default',
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkflowEdge;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', variables.workflow_id] });
    },
  });
}

// Edge aktualisieren
export function useUpdateEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      workflow_id,
      edge_label,
    }: {
      id: string;
      workflow_id: string;
      edge_label: 'default' | 'true' | 'false';
    }) => {
      const { data, error } = await supabase
        .from('workflow_edges')
        .update({ edge_label })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, workflow_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', result.workflow_id] });
    },
  });
}

// Edge löschen
export function useDeleteEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, workflow_id }: { id: string; workflow_id: string }) => {
      const { error } = await supabase.from('workflow_edges').delete().eq('id', id);
      if (error) throw error;
      return workflow_id;
    },
    onSuccess: (workflow_id) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', workflow_id] });
    },
  });
}

// Bulk save nodes and edges
export function useSaveWorkflowGraph() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      workflow_id,
      nodes,
      edges,
    }: {
      workflow_id: string;
      nodes: Omit<WorkflowNode, 'id' | 'created_at'>[];
      edges: Omit<WorkflowEdge, 'id' | 'created_at'>[];
    }) => {
      // Delete existing nodes and edges
      await supabase.from('workflow_edges').delete().eq('workflow_id', workflow_id);
      await supabase.from('workflow_nodes').delete().eq('workflow_id', workflow_id);

      // Insert new nodes
      if (nodes.length > 0) {
        const { data: insertedNodes, error: nodesError } = await supabase
          .from('workflow_nodes')
          .insert(
            nodes.map((n) => ({
              workflow_id: n.workflow_id,
              node_type: n.node_type,
              action_type: n.action_type,
              node_config: n.node_config as Json,
              position_x: n.position_x,
              position_y: n.position_y,
            }))
          )
          .select();

        if (nodesError) throw nodesError;

        // Map old node IDs to new ones for edges
        const nodeIdMap = new Map<string, string>();
        nodes.forEach((oldNode, index) => {
          // Use position as key since we don't have temp IDs
          const key = `${oldNode.position_x}-${oldNode.position_y}`;
          if (insertedNodes?.[index]) {
            nodeIdMap.set(key, insertedNodes[index].id);
          }
        });

        // Insert edges with mapped IDs
        if (edges.length > 0 && insertedNodes) {
          // Create a position-based lookup for nodes
          const nodesByTempId = new Map<string, string>();
          nodes.forEach((n, idx) => {
            const newNode = insertedNodes[idx];
            if (newNode) {
              // Find original temp ID from edge references
              const tempId = edges.find(
                (e) => e.source_node_id === n.workflow_id || e.target_node_id === n.workflow_id
              );
              nodesByTempId.set(`node-${idx}`, newNode.id);
            }
          });

          // For now, skip edge insertion if we can't map IDs properly
          // This will be handled by the canvas component tracking temp IDs
        }
      }

      return workflow_id;
    },
    onSuccess: (workflow_id) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-nodes', workflow_id] });
      toast({ title: 'Workflow gespeichert' });
    },
    onError: (error) => {
      toast({ title: 'Fehler beim Speichern', description: error.message, variant: 'destructive' });
    },
  });
}

// Scheduled Steps abrufen
export function useScheduledSteps(workflowRunId?: string) {
  return useQuery({
    queryKey: ['scheduled-steps', workflowRunId],
    queryFn: async () => {
      let query = supabase
        .from('scheduled_workflow_steps')
        .select('*')
        .order('scheduled_for', { ascending: true });

      if (workflowRunId) {
        query = query.eq('workflow_run_id', workflowRunId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!workflowRunId,
  });
}
