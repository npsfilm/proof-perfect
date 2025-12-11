import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TeamInvitation, CompanyRoleType } from '@/types/company';

export function useTeamInvitations(companyId: string | undefined) {
  return useQuery({
    queryKey: ['team-invitations', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('company_id', companyId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TeamInvitation[];
    },
    enabled: !!companyId,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      email, 
      role,
      invitedBy 
    }: { 
      companyId: string; 
      email: string; 
      role: CompanyRoleType;
      invitedBy: string;
    }) => {
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          company_id: companyId,
          email: email.toLowerCase().trim(),
          role,
          invited_by: invitedBy,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as TeamInvitation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', data.company_id] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, companyId }: { invitationId: string; companyId: string }) => {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      return { invitationId, companyId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', data.companyId] });
    },
  });
}

export function useInvitationByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['invitation-token', token],
    queryFn: async () => {
      if (!token) return null;
      
      const { data, error } = await supabase
        .from('team_invitations')
        .select(`
          *,
          companies:company_id (
            id,
            name
          )
        `)
        .eq('token', token)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });
}
