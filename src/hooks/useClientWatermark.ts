import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientWatermark {
  id: string;
  user_id: string;
  storage_url: string;
  position_x: number;
  position_y: number;
  size_percent: number;
  opacity: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch current user's watermark settings
 */
export function useClientWatermark() {
  return useQuery({
    queryKey: ['client-watermark'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_watermarks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ClientWatermark | null;
    },
  });
}

/**
 * Upload watermark image and create settings
 */
export function useUploadWatermark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Validate file type
      if (!file.type.match(/^image\/(png|webp)$/)) {
        throw new Error('Only PNG and WebP formats are supported');
      }

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('watermarks')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('watermarks')
        .getPublicUrl(uploadData.path);

      // Create/update database entry with default settings
      const { data, error } = await supabase
        .from('client_watermarks')
        .upsert({
          user_id: user.id,
          storage_url: publicUrl,
          position_x: 50,
          position_y: 90,
          size_percent: 15,
          opacity: 70,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClientWatermark;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-watermark'] });
      toast.success('Wasserzeichen erfolgreich hochgeladen');
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      toast.error('Fehler beim Hochladen: ' + error.message);
    },
  });
}

/**
 * Update watermark position, size, and opacity
 */
export function useUpdateWatermarkSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: {
      position_x: number;
      position_y: number;
      size_percent: number;
      opacity: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('client_watermarks')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as ClientWatermark;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-watermark'] });
    },
    onError: (error: Error) => {
      console.error('Update error:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    },
  });
}

/**
 * Delete watermark
 */
export function useDeleteWatermark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current watermark to delete from storage
      const { data: watermark } = await supabase
        .from('client_watermarks')
        .select('storage_url')
        .eq('user_id', user.id)
        .single();

      if (watermark) {
        // Extract path from URL
        const url = new URL(watermark.storage_url);
        const path = url.pathname.split('/').slice(-2).join('/');

        // Delete from storage
        await supabase.storage.from('watermarks').remove([path]);
      }

      // Delete from database
      const { error } = await supabase
        .from('client_watermarks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-watermark'] });
      toast.success('Wasserzeichen entfernt');
    },
    onError: (error: Error) => {
      console.error('Delete error:', error);
      toast.error('Fehler beim Löschen');
    },
  });
}
