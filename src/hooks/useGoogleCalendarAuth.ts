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

  const { data: tokenData, isLoading: isLoadingToken, refetch: refetchToken } = useQuery({
    queryKey: ['google-calendar-token', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('google_calendar_tokens')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as GoogleCalendarToken | null;
    },
    enabled: !!user,
  });

  const isConnected = !!tokenData;
  const isTokenExpired = tokenData ? new Date(tokenData.expires_at) < new Date() : true;

  const initiateOAuth = () => {
    if (!user) {
      toast.error('Bitte zuerst anmelden');
      return;
    }
    
    // Pass user_id to edge function for secure state encoding
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const authUrl = `https://${projectId}.supabase.co/functions/v1/google-calendar-auth?user_id=${user.id}`;
    
    window.location.href = authUrl;
  };

  // Called after OAuth callback - tokens are already stored server-side
  const handleOAuthSuccess = async () => {
    // Refetch token data since it was stored server-side
    await refetchToken();
    queryClient.invalidateQueries({ queryKey: ['google-calendar-token'] });
    toast.success('Google Kalender verbunden!');
  };

  const disconnectCalendar = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('google_calendar_tokens')
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
    user,
    isConnected,
    isLoadingToken,
    isTokenExpired,
    tokenData,
    initiateOAuth,
    handleOAuthSuccess,
    disconnectCalendar,
  };
}
