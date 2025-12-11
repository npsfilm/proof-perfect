import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Discount {
  id: string;
  service_id: string | null;
  name: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y';
  buy_quantity: number | null;
  free_quantity: number | null;
  percentage: number | null;
  fixed_amount_cents: number | null;
  min_quantity: number | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useDiscounts(serviceId?: string) {
  return useQuery({
    queryKey: ['discounts', serviceId],
    queryFn: async () => {
      let query = supabase
        .from('discounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Discount[];
    },
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (discount: Partial<Discount>) => {
      const { data, error } = await supabase
        .from('discounts')
        .insert(discount as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Rabatt erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen: ' + error.message);
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Discount> & { id: string }) => {
      const { data, error } = await supabase
        .from('discounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Rabatt aktualisiert');
    },
    onError: (error) => {
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      toast.success('Rabatt gelöscht');
    },
    onError: (error) => {
      toast.error('Fehler beim Löschen: ' + error.message);
    },
  });
}

// Helper function to calculate discount for a given quantity
export function calculateDiscount(discount: Discount, quantity: number, pricePerItem: number): number {
  if (!discount.is_active) return 0;
  if (discount.min_quantity && quantity < discount.min_quantity) return 0;

  switch (discount.discount_type) {
    case 'percentage':
      return Math.round((quantity * pricePerItem * (discount.percentage || 0)) / 100);
    case 'fixed':
      return discount.fixed_amount_cents || 0;
    case 'buy_x_get_y':
      if (discount.buy_quantity && discount.free_quantity) {
        const freeItems = Math.floor(quantity / (discount.buy_quantity + discount.free_quantity)) * discount.free_quantity;
        return freeItems * pricePerItem;
      }
      return 0;
    default:
      return 0;
  }
}
