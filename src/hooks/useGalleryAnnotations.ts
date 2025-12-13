import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useGalleryAnnotations(photoIds: string[] | undefined) {
  return useQuery({
    queryKey: ['gallery-annotations', photoIds?.sort().join(',')],
    queryFn: async () => {
      if (!photoIds || photoIds.length === 0) return {};

      const { data, error } = await supabase
        .from('photo_annotations')
        .select('photo_id, annotation_type')
        .in('photo_id', photoIds);

      if (error) throw error;

      // Map photo_id -> hasDrawing
      const drawingMap: Record<string, boolean> = {};
      data?.forEach((annotation) => {
        if (annotation.annotation_type === 'drawing') {
          drawingMap[annotation.photo_id] = true;
        }
      });

      return drawingMap;
    },
    enabled: !!photoIds && photoIds.length > 0,
    staleTime: 30000,
  });
}
