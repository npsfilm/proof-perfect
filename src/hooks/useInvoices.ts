import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceStatus } from '@/types/company';

export function useInvoices(companyId: string | undefined) {
  return useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('company_id', companyId)
        .order('invoice_date', { ascending: false });
      
      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!companyId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(invoice)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.company_id] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      invoiceId, 
      status,
      paidAt 
    }: { 
      invoiceId: string; 
      status: InvoiceStatus;
      paidAt?: string;
    }) => {
      const updateData: Partial<Invoice> = { status };
      if (status === 'paid' && paidAt) {
        updateData.paid_at = paidAt;
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices', data.company_id] });
    },
  });
}
