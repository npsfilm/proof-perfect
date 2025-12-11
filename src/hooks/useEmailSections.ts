import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailSection, EmailSectionSettings } from '@/components/admin/email-settings/types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper to transform DB data to our types
const transformDbSection = (s: any): EmailSection => ({
  ...s,
  settings: (s.settings as unknown as EmailSectionSettings) || {},
});

export function useEmailSections() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: sections, isLoading, error } = useQuery({
    queryKey: ['email-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_sections')
        .select('*')
        .order('is_preset', { ascending: false })
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data.map(transformDbSection);
    },
  });

  const presetSections = sections?.filter(s => s.is_preset) || [];
  const customSections = sections?.filter(s => !s.is_preset) || [];

  const createSection = useMutation({
    mutationFn: async (section: Omit<EmailSection, 'id' | 'created_at' | 'updated_at'>) => {
      const dbSection = {
        ...section,
        settings: section.settings as unknown as Json,
      };
      const { data, error } = await supabase
        .from('email_sections')
        .insert(dbSection)
        .select()
        .single();
      
      if (error) throw error;
      return transformDbSection(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sections'] });
      toast({
        title: 'Section gespeichert',
        description: 'Die Section wurde erfolgreich gespeichert.',
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

  const updateSection = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailSection> & { id: string }) => {
      const dbUpdates: Record<string, any> = { ...updates };
      if (updates.settings) {
        dbUpdates.settings = updates.settings as unknown as Json;
      }
      const { data, error } = await supabase
        .from('email_sections')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformDbSection(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sections'] });
      toast({
        title: 'Gespeichert',
        description: 'Section wurde aktualisiert.',
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

  const deleteSection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-sections'] });
      toast({
        title: 'Gelöscht',
        description: 'Section wurde gelöscht.',
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

  return {
    sections,
    presetSections,
    customSections,
    isLoading,
    error,
    createSection,
    updateSection,
    deleteSection,
  };
}
