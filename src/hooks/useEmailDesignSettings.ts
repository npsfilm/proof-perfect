import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EmailDesignSettings } from '@/components/admin/email-settings/types';
import { useToast } from '@/hooks/use-toast';

export function useEmailDesignSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['email-design-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_design_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as EmailDesignSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<EmailDesignSettings>) => {
      if (!settings?.id) throw new Error('No settings found');
      
      const { data, error } = await supabase
        .from('email_design_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-design-settings'] });
      toast({
        title: 'Gespeichert',
        description: 'E-Mail-Design-Einstellungen wurden aktualisiert.',
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
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
