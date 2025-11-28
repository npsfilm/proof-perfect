import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PhotoAnnotation } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function usePhotoAnnotations(photoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: annotations, isLoading } = useQuery({
    queryKey: ['photo-annotations', photoId],
    queryFn: async () => {
      if (!photoId) return [];
      
      const { data, error } = await supabase
        .from('photo_annotations')
        .select('*')
        .eq('photo_id', photoId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as PhotoAnnotation[];
    },
    enabled: !!photoId,
  });

  const addAnnotation = useMutation({
    mutationFn: async ({
      x_position,
      y_position,
      comment,
    }: {
      x_position: number;
      y_position: number;
      comment: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('photo_annotations')
        .insert({
          photo_id: photoId!,
          author_user_id: user.id,
          x_position,
          y_position,
          comment,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-annotations', photoId] });
      toast({
        title: 'Kommentar hinzugefügt',
        description: 'Ihre Anmerkung wurde gespeichert.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAnnotation = useMutation({
    mutationFn: async (annotationId: string) => {
      const { error } = await supabase
        .from('photo_annotations')
        .delete()
        .eq('id', annotationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photo-annotations', photoId] });
      toast({
        title: 'Kommentar gelöscht',
        description: 'Die Anmerkung wurde entfernt.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    annotations: annotations || [],
    isLoading,
    addAnnotation,
    deleteAnnotation,
  };
}
