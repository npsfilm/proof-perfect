import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DownloadLog } from '@/types/database';

export function useDownloadLogs(galleryId: string | undefined) {
  return useQuery({
    queryKey: ['download-logs', galleryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('download_logs')
        .select('*, profiles(email)')
        .eq('gallery_id', galleryId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!galleryId,
  });
}

export function useLogDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: {
      gallery_id: string;
      download_type: 'single_file' | 'folder_zip' | 'gallery_zip';
      folder_type?: string;
      file_id?: string;
      file_count: number;
      total_size_bytes?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('download_logs')
        .insert({
          ...log,
          user_id: user.id,
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['download-logs', variables.gallery_id] });
    },
  });
}
