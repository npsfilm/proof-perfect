import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GoogleCalendarToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export function useGoogleCalendarAuth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tokenData, isLoading: isLoadingToken } = useQuery({
    queryKey: ['google-calendar-token', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('google_calendar_tokens' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as GoogleCalendarToken | null;
    },
    enabled: !!user,
  });

  const isConnected = !!tokenData;
  const isTokenExpired = tokenData ? new Date(tokenData.expires_at) < new Date() : true;

  const initiateOAuth = () => {
    // Get the project URL for the edge function
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const authUrl = `https://${projectId}.supabase.co/functions/v1/google-calendar-auth`;
    
    // Open OAuth flow in new window
    window.location.href = authUrl;
  };

  const disconnectCalendar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('google_calendar_tokens' as any)
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-token'] });
      toast.success('Google Kalender getrennt');
    },
    onError: (error) => {
      console.error('Error disconnecting calendar:', error);
      toast.error('Fehler beim Trennen des Kalenders');
    },
  });

  return {
    isConnected,
    isLoadingToken,
    isTokenExpired,
    tokenData,
    initiateOAuth,
    disconnectCalendar,
  };
}
