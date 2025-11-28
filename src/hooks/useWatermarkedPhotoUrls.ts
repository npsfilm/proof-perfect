import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Photo } from '@/types/database';

// Helper to extract path from storage_url
function extractStoragePath(storageUrl: string): string {
  if (storageUrl.includes('/storage/v1/object/')) {
    const parts = storageUrl.split('/proofs/');
    return parts[1] || storageUrl;
  }
  return storageUrl.replace(/^proofs\//, '');
}

// Helper to generate watermarked URL via edge function
async function getWatermarkedUrl(photo: Photo): Promise<string> {
  try {
    const path = extractStoragePath(photo.storage_url);
    
    // Call the watermark edge function
    const { data, error } = await supabase.functions.invoke('watermark-photo', {
      body: { photoPath: path }
    });

    if (error) {
      console.error('[useWatermarkedPhotoUrls] Edge function error:', error);
      // Fallback to signed URL without watermark
      const { data: signedData } = await supabase.storage
        .from('proofs')
        .createSignedUrl(path, 3600);
      return signedData?.signedUrl || photo.storage_url;
    }

    // Convert blob response to object URL
    if (data instanceof Blob) {
      return URL.createObjectURL(data);
    }

    // If it's not a blob, fallback
    const { data: signedData } = await supabase.storage
      .from('proofs')
      .createSignedUrl(path, 3600);
    return signedData?.signedUrl || photo.storage_url;
  } catch (err) {
    console.error('[useWatermarkedPhotoUrls] Exception:', err);
    return photo.storage_url;
  }
}

export function useWatermarkedPhotoUrls(photos: Photo[] | undefined) {
  const { data: watermarkedUrls, isLoading, isRefetching } = useQuery({
    queryKey: ['watermarkedUrls', photos?.map(p => p.id).sort().join(',')],
    queryFn: async () => {
      if (!photos || photos.length === 0) {
        return {};
      }

      const urlMap: Record<string, string> = {};
      
      // Generate watermarked URLs for all photos
      await Promise.all(
        photos.map(async (photo) => {
          urlMap[photo.id] = await getWatermarkedUrl(photo);
        })
      );

      return urlMap;
    },
    enabled: !!photos && photos.length > 0,
    staleTime: 45 * 60 * 1000,       // 45 minutes
    refetchInterval: 50 * 60 * 1000, // 50 minutes
    refetchOnWindowFocus: true,
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (watermarkedUrls) {
        Object.values(watermarkedUrls).forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, [watermarkedUrls]);

  return { 
    watermarkedUrls: watermarkedUrls ?? {}, 
    isLoading,
    isRefetching 
  };
}

// Hook for single photo
export function useWatermarkedPhotoUrl(photo: Photo | null | undefined) {
  const { data: watermarkedUrl, isLoading, isRefetching } = useQuery({
    queryKey: ['watermarkedUrl', photo?.id],
    queryFn: async () => {
      if (!photo) return null;
      return await getWatermarkedUrl(photo);
    },
    enabled: !!photo,
    staleTime: 45 * 60 * 1000,
    refetchInterval: 50 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (watermarkedUrl && watermarkedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(watermarkedUrl);
      }
    };
  }, [watermarkedUrl]);

  return { 
    watermarkedUrl: watermarkedUrl ?? null, 
    isLoading,
    isRefetching 
  };
}
