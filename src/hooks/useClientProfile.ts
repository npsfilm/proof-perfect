import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/database';

export const useClientProfile = (email: string | undefined) => {
  return useQuery({
    queryKey: ['client-profile', email],
    queryFn: async () => {
      if (!email) return null;
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      
      if (error) throw error;
      return data as Client | null;
    },
    enabled: !!email,
  });
};
