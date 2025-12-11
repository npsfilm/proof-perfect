import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyMemberExtended, CompanyRoleType } from '@/types/company';

export function useCompanyTeam(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-team', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          *,
          profiles!company_members_user_id_fkey (
            id,
            email
          )
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as CompanyMemberExtended[];
    },
    enabled: !!companyId,
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      role,
      companyId 
    }: { 
      memberId: string; 
      role: CompanyRoleType;
      companyId: string;
    }) => {
      const { data, error } = await supabase
        .from('company_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, companyId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['company-team', result.companyId] });
    },
  });
}

export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      memberId, 
      permissions,
      companyId 
    }: { 
      memberId: string; 
      permissions: {
        can_view_invoices?: boolean;
        can_view_prices?: boolean;
        can_manage_team?: boolean;
      };
      companyId: string;
    }) => {
      const { data, error } = await supabase
        .from('company_members')
        .update(permissions)
        .eq('id', memberId)
        .select()
        .single();
      
      if (error) throw error;
      return { data, companyId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['company-team', result.companyId] });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, companyId }: { memberId: string; companyId: string }) => {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      return { memberId, companyId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['company-team', result.companyId] });
    },
  });
}
