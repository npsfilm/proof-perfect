import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gallery, Photo } from '@/types/database';

interface FinalizationData {
  feedback: string;
  stagingSelections: { photoId: string; staging: boolean; style?: string }[];
  referenceFile?: File;
}

export function useGalleryFinalization(gallery: Gallery | undefined, userId: string | undefined, slug: string | undefined) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const finalizeGallery = async (data: FinalizationData) => {
    if (!gallery || !userId) return;

    setIsSubmitting(true);
    try {
      // 1. Insert feedback
      if (data.feedback.trim()) {
        const { error: feedbackError } = await supabase
          .from('gallery_feedback')
          .insert({
            gallery_id: gallery.id,
            author_user_id: userId,
            message: data.feedback,
          });
        if (feedbackError) throw feedbackError;
      }

      // 2. Update photos with staging info
      for (const selection of data.stagingSelections) {
        if (selection.staging) {
          const { error: photoError } = await supabase
            .from('photos')
            .update({
              staging_requested: true,
              staging_style: selection.style,
            })
            .eq('id', selection.photoId);
          if (photoError) throw photoError;
        }
      }

      // 3. Upload reference image if provided
      if (data.referenceFile) {
        const fileExt = data.referenceFile.name.split('.').pop();
        const filePath = `${gallery.slug}/staging-ref-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('proofs')
          .upload(filePath, data.referenceFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('proofs')
          .getPublicUrl(filePath);

        // Store reference in staging_references table
        const firstStagedPhoto = data.stagingSelections.find(s => s.staging);
        if (firstStagedPhoto) {
          const { error: refError } = await supabase
            .from('staging_references')
            .insert({
              photo_id: firstStagedPhoto.photoId,
              uploader_user_id: userId,
              file_url: publicUrl,
            });
          if (refError) throw refError;
        }
      }

      // 4. Lock gallery and set status to Reviewed
      const { error: galleryError } = await supabase
        .from('galleries')
        .update({
          status: 'Reviewed',
          is_locked: true,
          reviewed_at: new Date().toISOString(),
          reviewed_by: userId,
        })
        .eq('id', gallery.id);

      if (galleryError) throw galleryError;

      // 5. Send webhook notification
      const { error: webhookError } = await supabase.functions.invoke('webhook-review', {
        body: { gallery_id: gallery.id },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      queryClient.invalidateQueries({ queryKey: ['gallery-slug', slug] });
      queryClient.invalidateQueries({ queryKey: ['photos', gallery.id] });

      toast({
        title: 'Auswahl finalisiert!',
        description: 'Ihre Auswahl wurde dem Admin übermittelt.',
      });

      return true;
    } catch (error: any) {
      console.error('Finalization error:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    finalizeGallery,
    isSubmitting,
  };
}
