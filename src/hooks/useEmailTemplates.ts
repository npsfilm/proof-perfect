import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailTemplate, EmailPlaceholder, EmailTemplateSectionInstance } from '@/components/admin/email-settings/types';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

// Helper to transform DB data to our types
const transformDbTemplate = (t: any): EmailTemplate => ({
  ...t,
  available_placeholders: (t.available_placeholders as unknown as EmailPlaceholder[]) || [],
  sections: (t.sections as unknown as EmailTemplateSectionInstance[]) || [],
  content_type: t.content_type || 'simple',
  html_content_du: t.html_content_du || null,
  html_content_sie: t.html_content_sie || null,
});

// Helper to transform our types to DB format
const transformToDb = (updates: Partial<EmailTemplate>): Record<string, any> => {
  const dbUpdates: Record<string, any> = { ...updates };
  if (updates.available_placeholders) {
    dbUpdates.available_placeholders = updates.available_placeholders as unknown as Json;
  }
  if (updates.sections) {
    dbUpdates.sections = updates.sections as unknown as Json;
  }
  return dbUpdates;
};

export function useEmailTemplates(category?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['email-templates', category],
    queryFn: async () => {
      let query = supabase
        .from('email_templates')
        .select('*')
        .order('name');
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data.map(transformDbTemplate);
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmailTemplate> }) => {
      const dbUpdates = transformToDb(updates);
      const { data, error } = await supabase
        .from('email_templates')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return transformDbTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Gespeichert',
        description: 'E-Mail-Template wurde aktualisiert.',
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

  const createTemplate = useMutation({
    mutationFn: async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const dbTemplate = transformToDb(template) as any;
      const { data, error } = await supabase
        .from('email_templates')
        .insert([dbTemplate])
        .select()
        .single();
      
      if (error) throw error;
      return transformDbTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Erstellt',
        description: 'Neues E-Mail-Template wurde erstellt.',
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

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Gelöscht',
        description: 'E-Mail-Template wurde gelöscht.',
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
    templates,
    isLoading,
    error,
    updateTemplate,
    createTemplate,
    deleteTemplate,
  };
}
