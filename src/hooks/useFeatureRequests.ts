import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface FeatureRequest {
  id: string;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  title: string;
  description: string;
  image_url: string | null;
  status: 'new' | 'in_review' | 'planned' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureRequestData {
  title: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  image?: File;
}

export function useFeatureRequests() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  // Fetch all feature requests (admin only)
  const { data: featureRequests, isLoading } = useQuery({
    queryKey: ['feature-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FeatureRequest[];
    },
    enabled: isAdmin,
  });

  // Create feature request
  const createMutation = useMutation({
    mutationFn: async (data: CreateFeatureRequestData) => {
      if (!user) throw new Error('Nicht eingeloggt');

      let imageUrl: string | null = null;

      // Upload image if provided
      if (data.image) {
        const fileExt = data.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('feature-requests')
          .upload(fileName, data.image);

        if (uploadError) throw uploadError;

        // Get signed URL
        const { data: signedData } = await supabase.storage
          .from('feature-requests')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

        imageUrl = signedData?.signedUrl || null;
      }

      // Get user profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      const { data: client } = await supabase
        .from('clients')
        .select('vorname, nachname')
        .eq('email', profile?.email || user.email)
        .single();

      const userName = client 
        ? `${client.vorname} ${client.nachname}`.trim()
        : null;

      // Insert feature request
      const { data: request, error } = await supabase
        .from('feature_requests')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          user_name: userName,
          title: data.title,
          description: data.description,
          priority: data.priority,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      // Send email notification via edge function
      try {
        await supabase.functions.invoke('send-feature-request-email', {
          body: {
            request: {
              ...request,
              user_name: userName,
            },
          },
        });
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't throw - request was saved successfully
      }

      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      toast({
        title: 'Anfrage gesendet',
        description: 'Vielen Dank für dein Feedback! Wir melden uns bei dir.',
      });
    },
    onError: (error) => {
      console.error('Error creating feature request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht gesendet werden.',
        variant: 'destructive',
      });
    },
  });

  // Update feature request (admin only)
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FeatureRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('feature_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      toast({
        title: 'Gespeichert',
        description: 'Die Änderungen wurden gespeichert.',
      });
    },
    onError: (error) => {
      console.error('Error updating feature request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Änderungen konnten nicht gespeichert werden.',
        variant: 'destructive',
      });
    },
  });

  // Delete feature request (admin only)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('feature_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-requests'] });
      toast({
        title: 'Gelöscht',
        description: 'Die Anfrage wurde gelöscht.',
      });
    },
    onError: (error) => {
      console.error('Error deleting feature request:', error);
      toast({
        title: 'Fehler',
        description: 'Die Anfrage konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    },
  });

  return {
    featureRequests,
    isLoading,
    createFeatureRequest: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateFeatureRequest: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteFeatureRequest: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
