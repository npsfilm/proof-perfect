import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Workflow, WorkflowWithActions, WorkflowRun, TriggerEvent, ActionType } from '@/types/workflows';
import type { Json } from '@/integrations/supabase/types';

// Alle Workflows mit Aktionen abrufen
export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_actions (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as unknown as WorkflowWithActions[];
    },
  });
}

// Einzelnen Workflow abrufen
export function useWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: ['workflows', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('workflows')
        .select(`
          *,
          workflow_actions (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as WorkflowWithActions;
    },
    enabled: !!id,
  });
}

// Workflow erstellen
export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (workflow: { name: string; description: string | null; trigger_event: TriggerEvent; is_active: boolean; conditions: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          name: workflow.name,
          description: workflow.description,
          trigger_event: workflow.trigger_event,
          is_active: workflow.is_active,
          conditions: workflow.conditions as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({ title: 'Workflow erstellt' });
    },
    onError: (error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

// Workflow aktualisieren
export function useUpdateWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, name, description, trigger_event }: { id: string; name?: string; description?: string | null; trigger_event?: TriggerEvent }) => {
      const { data, error } = await supabase
        .from('workflows')
        .update({ name, description, trigger_event })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({ title: 'Workflow aktualisiert' });
    },
    onError: (error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

// Workflow löschen
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({ title: 'Workflow gelöscht' });
    },
    onError: (error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

// Workflow-Aktion erstellen
export function useCreateWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: { workflow_id: string; action_type: ActionType; action_config: Record<string, unknown>; sort_order: number; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('workflow_actions')
        .insert({
          workflow_id: action.workflow_id,
          action_type: action.action_type,
          action_config: action.action_config as Json,
          sort_order: action.sort_order,
          is_active: action.is_active,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

// Workflow-Aktion aktualisieren
export function useUpdateWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action_type, action_config, sort_order, is_active }: { id: string; action_type?: ActionType; action_config?: Record<string, unknown>; sort_order?: number; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('workflow_actions')
        .update({
          action_type,
          action_config: action_config as Json,
          sort_order,
          is_active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

// Workflow-Aktion löschen
export function useDeleteWorkflowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

// Workflow-Runs abrufen
export function useWorkflowRuns(workflowId?: string) {
  return useQuery({
    queryKey: ['workflow-runs', workflowId],
    queryFn: async () => {
      let query = supabase
        .from('workflow_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(100);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as WorkflowRun[];
    },
  });
}

// Workflow-Status umschalten
export function useToggleWorkflow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('workflows')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast({ 
        title: data.is_active ? 'Workflow aktiviert' : 'Workflow deaktiviert' 
      });
    },
    onError: (error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}
