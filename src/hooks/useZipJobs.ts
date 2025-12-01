import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ZipJob } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export function useZipJobs(userId: string | undefined) {
  return useQuery({
    queryKey: ['zip-jobs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zip_jobs')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as ZipJob[];
    },
    enabled: !!userId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if there are pending/processing jobs
      const data = query.state.data;
      const hasPendingJobs = data?.some(job => 
        job.status === 'pending' || job.status === 'processing'
      );
      return hasPendingJobs ? 3000 : false;
    },
  });
}

export function useZipJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['zip-job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('zip_jobs')
        .select('*')
        .eq('id', jobId!)
        .single();
      
      if (error) throw error;
      return data as ZipJob;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if job is pending/processing
      const data = query.state.data;
      return data?.status === 'pending' || data?.status === 'processing' ? 2000 : false;
    },
  });
}

export function useCreateZipJob() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      galleryId,
      folderType,
    }: {
      galleryId: string;
      folderType?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('zip_jobs')
        .insert({
          gallery_id: galleryId,
          user_id: user.id,
          folder_type: folderType,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ZipJob;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['zip-jobs', data.user_id] });
      toast({
        title: 'ZIP wird vorbereitet',
        description: 'Ihre Datei wird generiert. Sie werden benachrichtigt, wenn der Download bereit ist.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'ZIP-Job konnte nicht erstellt werden',
        variant: 'destructive',
      });
    },
  });
}

export function useDownloadZipJob() {
  return useMutation({
    mutationFn: async (job: ZipJob) => {
      if (!job.storage_path) throw new Error('No storage path');
      
      const { data, error } = await supabase.storage
        .from('zip-files')
        .createSignedUrl(job.storage_path, 3600);
      
      if (error) throw error;
      
      // Trigger download
      const link = document.createElement('a');
      link.href = data.signedUrl;
      link.download = job.storage_path.split('/').pop() || 'download.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onSuccess: () => {
      toast({
        title: 'Download gestartet',
        description: 'Ihre ZIP-Datei wird heruntergeladen...',
      });
    },
    onError: (error) => {
      toast({
        title: 'Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    },
  });
}
