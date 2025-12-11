import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CompanyMemberExtended, CompanyRoleType } from '@/types/company';

export function useCompanyRole(userId: string | undefined) {
  return useQuery({
    queryKey: ['company-role', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('company_members')
        .select(`
          *,
          companies:company_id (
            id,
            name,
            slug,
            domain
          )
        `)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return data as (CompanyMemberExtended & { 
        companies: { id: string; name: string; slug: string; domain: string | null } 
      }) | null;
    },
    enabled: !!userId,
  });
}

export function useIsCompanyAdmin(userId: string | undefined, companyId: string | undefined) {
  const { data: membership } = useCompanyRole(userId);
  
  if (!membership || membership.company_id !== companyId) return false;
  return membership.role === 'owner' || membership.role === 'company_admin';
}

export function useIsCompanyOwner(userId: string | undefined, companyId: string | undefined) {
  const { data: membership } = useCompanyRole(userId);
  
  if (!membership || membership.company_id !== companyId) return false;
  return membership.role === 'owner';
}

export function useCanViewInvoices(userId: string | undefined, companyId: string | undefined) {
  const { data: membership } = useCompanyRole(userId);
  
  if (!membership || membership.company_id !== companyId) return false;
  return membership.role === 'owner' || membership.role === 'company_admin' || membership.can_view_invoices;
}

export function useCanViewPrices(userId: string | undefined, companyId: string | undefined) {
  const { data: membership } = useCompanyRole(userId);
  
  if (!membership || membership.company_id !== companyId) return false;
  return membership.role === 'owner' || membership.role === 'company_admin' || membership.can_view_prices;
}
