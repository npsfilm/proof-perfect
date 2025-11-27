import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WebhookLog {
  id: string;
  gallery_id: string | null;
  type: string;
  status: string;
  response_body: any;
  created_at: string;
  galleries?: {
    name: string;
    slug: string;
  } | null;
}

export function useWebhookLogs() {
  return useQuery({
    queryKey: ['webhook-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select(`
          *,
          galleries (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WebhookLog[];
    },
  });
}
