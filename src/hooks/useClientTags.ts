import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
export interface ClientTag {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  tag_type: 'manual' | 'auto';
  auto_conditions: {
    field?: string;
    operator?: string;
    value?: number;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assignment_count?: number;
}

export interface ClientTagAssignment {
  id: string;
  client_id: string;
  tag_id: string;
  assigned_at: string;
  assigned_by: 'auto' | 'manual';
  client_tags?: ClientTag;
}

export interface CreateTagData {
  name: string;
  slug: string;
  description?: string;
  color?: string;
  tag_type: string;
  auto_conditions?: Json;
  is_active?: boolean;
}

export const useClientTags = () => {
  return useQuery({
    queryKey: ['client-tags'],
    queryFn: async () => {
      // Get tags with assignment count
      const { data: tags, error } = await supabase
        .from('client_tags')
        .select('*')
        .order('name');
      
      if (error) throw error;

      // Get assignment counts
      const { data: counts, error: countError } = await supabase
        .from('client_tag_assignments')
        .select('tag_id');
      
      if (countError) throw countError;

      // Aggregate counts
      const countMap: Record<string, number> = {};
      counts?.forEach(a => {
        countMap[a.tag_id] = (countMap[a.tag_id] || 0) + 1;
      });

      return tags.map(tag => ({
        ...tag,
        auto_conditions: tag.auto_conditions || {},
        assignment_count: countMap[tag.id] || 0,
      })) as ClientTag[];
    },
  });
};

export const useClientTagAssignments = (clientId: string | undefined) => {
  return useQuery({
    queryKey: ['client-tag-assignments', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('client_tag_assignments')
        .select('*, client_tags(*)')
        .eq('client_id', clientId);
      
      if (error) throw error;
      return data as ClientTagAssignment[];
    },
    enabled: !!clientId,
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tagData: CreateTagData) => {
      const { data, error } = await supabase
        .from('client_tags')
        .insert([tagData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
      toast({
        title: 'Tag erstellt',
        description: 'Der Tag wurde erfolgreich erstellt.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClientTag> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
      toast({
        title: 'Tag aktualisiert',
        description: 'Der Tag wurde erfolgreich aktualisiert.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('client_tags')
        .delete()
        .eq('id', tagId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
      toast({
        title: 'Tag gelöscht',
        description: 'Der Tag wurde erfolgreich gelöscht.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useAssignTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, tagId }: { clientId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('client_tag_assignments')
        .insert([{ client_id: clientId, tag_id: tagId, assigned_by: 'manual' }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-tag-assignments', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRemoveTag = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, tagId }: { clientId: string; tagId: string }) => {
      const { error } = await supabase
        .from('client_tag_assignments')
        .delete()
        .eq('client_id', clientId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-tag-assignments', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-tags'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
