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
            
            // Extract the path from the full storage URL
            // Format: https://.../storage/v1/object/public/proofs/testgalerie/IMG_8650.jpg
            // We need: testgalerie/IMG_8650.jpg
            const urlParts = photo.storage_url.split('/proofs/');
            const filePath = urlParts.length > 1 ? urlParts[1] : photo.storage_url;

            // Create signed URL using just the file path
            const { data: signedData } = await supabase
              .storage
              .from('proofs')
              .createSignedUrl(filePath, 3600);

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
