import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Photo } from '@/types/database';

// Helper to extract path from storage_url
function extractStoragePath(storageUrl: string): string {
  // storage_url format: proofs/[gallery-slug]/[filename]
  // or full URL: https://[...]/storage/v1/object/public/proofs/[gallery-slug]/[filename]
  if (storageUrl.includes('/storage/v1/object/')) {
    const parts = storageUrl.split('/proofs/');
    return parts[1] || storageUrl;
  }
  // If it's already just a path, return as-is
  return storageUrl.replace(/^proofs\//, '');
}

export function useSignedPhotoUrls(photos: Photo[] | undefined) {
  const { data: signedUrls, isLoading, isRefetching } = useQuery({
    queryKey: ['signedUrls', photos?.map(p => p.id).sort().join(',')],
    queryFn: async () => {
      if (!photos || photos.length === 0) {
        return {};
      }

      const urlMap: Record<string, string> = {};
      
      // Generate signed URLs for all photos (1 hour expiry)
      await Promise.all(
        photos.map(async (photo) => {
          try {
            const path = extractStoragePath(photo.storage_url);
            const { data, error } = await supabase.storage
              .from('proofs')
              .createSignedUrl(path, 3600); // 1 hour validity

            if (error) {
              console.error('[useSignedPhotoUrls] Error creating signed URL:', error);
              urlMap[photo.id] = photo.storage_url;
            } else if (data?.signedUrl) {
              urlMap[photo.id] = data.signedUrl;
            } else {
              urlMap[photo.id] = photo.storage_url;
            }
          } catch (err) {
            console.error('[useSignedPhotoUrls] Exception:', err);
            urlMap[photo.id] = photo.storage_url;
          }
        })
      );

      return urlMap;
    },
    enabled: !!photos && photos.length > 0,
    staleTime: 45 * 60 * 1000,       // 45 minutes - URLs stay fresh
    refetchInterval: 50 * 60 * 1000, // 50 minutes - proactive refresh before expiry
    refetchOnWindowFocus: true,       // Refresh when user returns to tab
  });

  return { 
    signedUrls: signedUrls ?? {}, 
    isLoading,
    isRefetching 
  };
}

// Hook for single photo
export function useSignedPhotoUrl(photo: Photo | null | undefined) {
  const { data: signedUrl, isLoading, isRefetching } = useQuery({
    queryKey: ['signedUrl', photo?.id],
    queryFn: async () => {
      if (!photo) return null;

      try {
        const path = extractStoragePath(photo.storage_url);
        const { data, error } = await supabase.storage
          .from('proofs')
          .createSignedUrl(path, 3600); // 1 hour validity

        if (error) {
          console.error('[useSignedPhotoUrl] Error creating signed URL:', error);
          return photo.storage_url;
        } else if (data?.signedUrl) {
          return data.signedUrl;
        } else {
          return photo.storage_url;
        }
      } catch (err) {
        console.error('[useSignedPhotoUrl] Exception:', err);
        return photo.storage_url;
      }
    },
    enabled: !!photo,
    staleTime: 45 * 60 * 1000,       // 45 minutes
    refetchInterval: 50 * 60 * 1000, // 50 minutes - refresh before expiry
    refetchOnWindowFocus: true,
  });

  return { 
    signedUrl: signedUrl ?? null, 
    isLoading,
    isRefetching 
  };
}
