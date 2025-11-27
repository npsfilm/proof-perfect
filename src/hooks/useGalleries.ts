import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useGalleries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: galleries, isLoading } = useQuery({
    queryKey: ['galleries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Gallery[];
    },
  });

  const createGallery = useMutation({
    mutationFn: async (gallery: {
      name: string;
      package_target_count: number;
      salutation_type: 'Du' | 'Sie';
    }) => {
      // Generate unique slug
      const { data: slugData, error: slugError } = await supabase.rpc(
        'generate_unique_slug',
        { p_name: gallery.name }
      );

      if (slugError) throw slugError;

      const { data, error } = await supabase
        .from('galleries')
        .insert({
          name: gallery.name,
          slug: slugData,
          package_target_count: gallery.package_target_count,
          salutation_type: gallery.salutation_type,
          status: 'Draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Gallery created',
        description: 'Your gallery has been created successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateGallery = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Gallery> & { id: string }) => {
      const { data, error } = await supabase
        .from('galleries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Gallery updated',
        description: 'Your gallery has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteGallery = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('galleries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] });
      toast({
        title: 'Gallery deleted',
        description: 'The gallery has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    galleries,
    isLoading,
    createGallery,
    updateGallery,
    deleteGallery,
  };
}
