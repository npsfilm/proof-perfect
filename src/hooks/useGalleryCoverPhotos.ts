import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface GalleryCoverPhoto {
  gallery_id: string;
  photo_id: string;
  storage_url: string;
  signed_url?: string;
}

export function useGalleryCoverPhotos(galleryIds: string[]) {
  return useQuery({
    queryKey: ['gallery-cover-photos', galleryIds.sort().join(',')],
    queryFn: async () => {
      if (galleryIds.length === 0) return {};

      // Fetch the first photo for each gallery
      const coverPhotos: Record<string, GalleryCoverPhoto> = {};

      await Promise.all(
        galleryIds.map(async (galleryId) => {
          const { data: photos } = await supabase
            .from('photos')
            .select('id, storage_url')
            .eq('gallery_id', galleryId)
            .order('upload_order', { ascending: true })
            .limit(1);

          if (photos && photos.length > 0) {
            const photo = photos[0];
            
            // Create signed URL
            const { data: signedData } = await supabase
              .storage
              .from('proofs')
              .createSignedUrl(photo.storage_url, 3600);

            coverPhotos[galleryId] = {
              gallery_id: galleryId,
              photo_id: photo.id,
              storage_url: photo.storage_url,
              signed_url: signedData?.signedUrl,
            };
          }
        })
      );

      return coverPhotos;
    },
    enabled: galleryIds.length > 0,
    staleTime: 45 * 60 * 1000, // 45 minutes
    refetchInterval: 50 * 60 * 1000, // 50 minutes (before stale)
  });
}
