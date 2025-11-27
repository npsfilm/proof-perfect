import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Client } from '@/types/database';

export interface CreateClientData {
  email: string;
  anrede?: 'Herr' | 'Frau' | 'Divers';
  vorname: string;
  nachname: string;
  ansprache: 'Du' | 'Sie';
  company_id?: string;
}

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*, companies(name)')
        .order('nachname');
      
      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: 'Kunde erstellt',
        description: 'Der Kunde wurde erfolgreich erstellt.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useGalleryClients = (galleryId: string | undefined) => {
  return useQuery({
    queryKey: ['gallery-clients', galleryId],
    queryFn: async () => {
      if (!galleryId) return [];
      
      const { data, error } = await supabase
        .from('gallery_clients')
        .select('*, clients(*)')
        .eq('gallery_id', galleryId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!galleryId,
  });
};
