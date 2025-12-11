import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { SeoSettings, SeoSettingsUpdate } from '@/components/admin/seo-settings/types';

export function useSeoSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['seo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error) throw error;
      return data as SeoSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: SeoSettingsUpdate) => {
      if (!settings?.id) throw new Error('No settings found');
      
      const { data, error } = await supabase
        .from('seo_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as SeoSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-settings'] });
      toast({
        title: 'Einstellungen gespeichert',
        description: 'Die SEO-Einstellungen wurden erfolgreich aktualisiert.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler beim Speichern',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(fileName, file, { upsert: true });
    
    if (uploadError) {
      toast({
        title: 'Upload fehlgeschlagen',
        description: uploadError.message,
        variant: 'destructive',
      });
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    uploadImage,
  };
}
