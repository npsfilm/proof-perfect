import { useEffect, useState } from 'react';
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
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setSignedUrls({});
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function generateSignedUrls() {
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
              // Fallback to original URL if signing fails
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

      if (isMounted) {
        setSignedUrls(urlMap);
        setIsLoading(false);
      }
    }

    generateSignedUrls();

    return () => {
      isMounted = false;
    };
  }, [photos]);

  return { signedUrls, isLoading };
}

// Hook for single photo
export function useSignedPhotoUrl(photo: Photo | null | undefined) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!photo) {
      setSignedUrl(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function generateSignedUrl() {
      try {
        const path = extractStoragePath(photo.storage_url);
        const { data, error } = await supabase.storage
          .from('proofs')
          .createSignedUrl(path, 3600); // 1 hour validity

        if (error) {
          console.error('[useSignedPhotoUrl] Error creating signed URL:', error);
          if (isMounted) setSignedUrl(photo.storage_url);
        } else if (data?.signedUrl) {
          if (isMounted) setSignedUrl(data.signedUrl);
        } else {
          if (isMounted) setSignedUrl(photo.storage_url);
        }
      } catch (err) {
        console.error('[useSignedPhotoUrl] Exception:', err);
        if (isMounted) setSignedUrl(photo.storage_url);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    generateSignedUrl();

    return () => {
      isMounted = false;
    };
  }, [photo]);

  return { signedUrl, isLoading };
}
