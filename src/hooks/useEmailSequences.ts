import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface EmailSequence {
  id: string;
  name: string;
  description: string | null;
  trigger_event: string;
  trigger_conditions: Record<string, any>;
  delay_after_trigger_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  template_id: string;
  step_order: number;
  delay_from_previous_minutes: number;
  subject_override: string | null;
  skip_conditions: Record<string, any>;
  created_at: string;
  template?: {
    id: string;
    name: string;
    subject_du: string;
    subject_sie: string;
  };
}

export interface EmailSequenceEnrollment {
  id: string;
  client_id: string;
  sequence_id: string;
  current_step: number;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  started_at: string;
  next_send_at: string | null;
  completed_at: string | null;
  client?: {
    id: string;
    email: string;
    vorname: string;
    nachname: string;
  };
}

export function useEmailSequences() {
  return useQuery({
    queryKey: ['email-sequences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sequences')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(s => ({
        ...s,
        trigger_conditions: (s.trigger_conditions as Record<string, any>) || {},
      })) as EmailSequence[];
    },
  });
}

export function useSequenceSteps(sequenceId: string | null) {
  return useQuery({
    queryKey: ['email-sequence-steps', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .select(`
          *,
          template:email_templates(id, name, subject_du, subject_sie)
        `)
        .eq('sequence_id', sequenceId)
        .order('step_order');
      
      if (error) throw error;
      return data.map(s => ({
        ...s,
        skip_conditions: (s.skip_conditions as Record<string, any>) || {},
      })) as EmailSequenceStep[];
    },
    enabled: !!sequenceId,
  });
}

export function useSequenceEnrollments(sequenceId: string | null) {
  return useQuery({
    queryKey: ['email-sequence-enrollments', sequenceId],
    queryFn: async () => {
      if (!sequenceId) return [];
      
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select(`
          *,
          client:clients(id, email, vorname, nachname)
        `)
        .eq('sequence_id', sequenceId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      return data as EmailSequenceEnrollment[];
    },
    enabled: !!sequenceId,
  });
}

export function useSequenceStats(sequenceId: string) {
  return useQuery({
    queryKey: ['email-sequence-stats', sequenceId],
    queryFn: async () => {
      const [stepsResult, enrollmentsResult] = await Promise.all([
        supabase
          .from('email_sequence_steps')
          .select('id', { count: 'exact' })
          .eq('sequence_id', sequenceId),
        supabase
          .from('email_sequence_enrollments')
          .select('status')
          .eq('sequence_id', sequenceId),
      ]);
      
      if (stepsResult.error) throw stepsResult.error;
      if (enrollmentsResult.error) throw enrollmentsResult.error;
      
      const enrollments = enrollmentsResult.data || [];
      return {
        stepCount: stepsResult.count || 0,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        totalEnrollments: enrollments.length,
      };
    },
  });
}

export function useCreateSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sequence: Omit<EmailSequence, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert([{
          ...sequence,
          trigger_conditions: sequence.trigger_conditions as unknown as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sequences'] });
      toast({ title: 'Sequenz erstellt', description: 'Die E-Mail-Sequenz wurde erfolgreich erstellt.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailSequence> & { id: string }) => {
      const dbUpdates: Record<string, any> = { ...updates };
      if (updates.trigger_conditions) {
        dbUpdates.trigger_conditions = updates.trigger_conditions as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('email_sequences')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sequences'] });
      toast({ title: 'Gespeichert', description: 'Die Sequenz wurde aktualisiert.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSequence() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sequences'] });
      toast({ title: 'Gelöscht', description: 'Die Sequenz wurde gelöscht.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAddSequenceStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (step: Omit<EmailSequenceStep, 'id' | 'created_at' | 'template'>) => {
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .insert([{
          ...step,
          skip_conditions: step.skip_conditions as unknown as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', variables.sequence_id] });
      queryClient.invalidateQueries({ queryKey: ['email-sequence-stats'] });
      toast({ title: 'Schritt hinzugefügt' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateSequenceStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, sequence_id, ...updates }: Partial<EmailSequenceStep> & { id: string; sequence_id: string }) => {
      const dbUpdates: Record<string, any> = { ...updates };
      if (updates.skip_conditions) {
        dbUpdates.skip_conditions = updates.skip_conditions as unknown as Json;
      }
      
      const { data, error } = await supabase
        .from('email_sequence_steps')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { ...data, sequence_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', data.sequence_id] });
      toast({ title: 'Schritt aktualisiert' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteSequenceStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, sequence_id }: { id: string; sequence_id: string }) => {
      const { error } = await supabase
        .from('email_sequence_steps')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { sequence_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-sequence-steps', data.sequence_id] });
      queryClient.invalidateQueries({ queryKey: ['email-sequence-stats'] });
      toast({ title: 'Schritt entfernt' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useEnrollClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ clientId, sequenceId }: { clientId: string; sequenceId: string }) => {
      // Get sequence and first step delay
      const { data: sequence } = await supabase
        .from('email_sequences')
        .select('delay_after_trigger_minutes')
        .eq('id', sequenceId)
        .single();
      
      const delayMinutes = sequence?.delay_after_trigger_minutes || 0;
      const nextSendAt = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert([{
          client_id: clientId,
          sequence_id: sequenceId,
          current_step: 0,
          status: 'active',
          next_send_at: nextSendAt,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['email-sequence-enrollments', variables.sequenceId] });
      queryClient.invalidateQueries({ queryKey: ['email-sequence-stats', variables.sequenceId] });
      toast({ title: 'Kunde eingeschrieben', description: 'Der Kunde wurde in die Sequenz aufgenommen.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, sequence_id }: { id: string; status: string; sequence_id: string }) => {
      const updates: Record<string, any> = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      return { sequence_id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-sequence-enrollments', data.sequence_id] });
      queryClient.invalidateQueries({ queryKey: ['email-sequence-stats', data.sequence_id] });
      toast({ title: 'Status aktualisiert' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}
