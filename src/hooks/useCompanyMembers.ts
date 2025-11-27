import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyMember } from '@/types/database';

export function useCompanyMembers(companyId: string) {
  return useQuery({
    queryKey: ['company-members', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          *,
          profiles:user_id (
            id,
            email
          )
        `)
        .eq('company_id', companyId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
}

export function useAddCompanyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('company_members')
        .insert({
          company_id: companyId,
          user_id: userId,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CompanyMember;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company-members', variables.companyId] });
    },
  });
}

export function useRemoveCompanyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ companyId, userId }: { companyId: string; userId: string }) => {
      const { error } = await supabase
        .from('company_members')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company-members', variables.companyId] });
    },
  });
}
