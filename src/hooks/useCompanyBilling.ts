import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyBilling } from '@/types/company';

export function useCompanyBilling(companyId: string | undefined) {
  return useQuery({
    queryKey: ['company-billing', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('company_billing')
        .select('*')
        .eq('company_id', companyId)
        .maybeSingle();
      
      if (error) throw error;
      return data as CompanyBilling | null;
    },
    enabled: !!companyId,
  });
}

export function useUpsertCompanyBilling() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      companyId, 
      billing 
    }: { 
      companyId: string; 
      billing: Partial<Omit<CompanyBilling, 'id' | 'company_id' | 'created_at' | 'updated_at'>> 
    }) => {
      const { data, error } = await supabase
        .from('company_billing')
        .upsert({
          company_id: companyId,
          ...billing,
        }, {
          onConflict: 'company_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as CompanyBilling;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['company-billing', variables.companyId] });
    },
  });
}
