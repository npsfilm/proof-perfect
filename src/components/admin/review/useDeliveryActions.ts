import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Gallery } from '@/types/database';

interface UseDeliveryActionsProps {
  gallery: Gallery | undefined;
  clientEmails: string[] | undefined;
  deliveryFiles: any[] | undefined;
}

export function useDeliveryActions({ gallery, clientEmails, deliveryFiles }: UseDeliveryActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [delivering, setDelivering] = useState(false);
  const [resending, setResending] = useState(false);
  const [useExternalLink, setUseExternalLink] = useState(false);
  const [externalLink, setExternalLink] = useState('');

  const handleDeliverFinalFiles = async () => {
    if (!gallery) return;

    // Validate based on delivery method
    if (useExternalLink) {
      if (!externalLink.trim()) {
        toast({
          title: 'Externer Link fehlt',
          description: 'Bitte geben Sie einen externen Download-Link ein.',
          variant: 'destructive',
        });
        return;
      }
      try {
        new URL(externalLink);
      } catch {
        toast({
          title: 'Ungültiger Link',
          description: 'Bitte geben Sie einen gültigen URL ein.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      if (!deliveryFiles || deliveryFiles.length === 0) {
        toast({
          title: 'Keine Dateien',
          description: 'Bitte laden Sie mindestens eine Datei hoch, bevor Sie ausliefern.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!clientEmails || clientEmails.length === 0) {
      toast({
        title: 'Keine Kunden',
        description: 'Keine Kunden-E-Mails für diese Galerie gefunden.',
        variant: 'destructive',
      });
      return;
    }

    setDelivering(true);
    try {
      const { error: updateError } = await supabase
        .from('galleries')
        .update({
          status: 'Delivered',
          delivered_at: new Date().toISOString(),
          final_delivery_link: useExternalLink ? externalLink : null,
        })
        .eq('id', gallery.id);

      if (updateError) throw updateError;

      const downloadLink = useExternalLink 
        ? externalLink 
        : `${window.location.origin}/gallery/${gallery.slug}`;

      const { error: webhookError } = await supabase.functions.invoke('webhook-deliver', {
        body: {
          gallery_id: gallery.id,
          client_emails: clientEmails,
          download_link: downloadLink,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      queryClient.invalidateQueries({ queryKey: ['gallery', gallery.id] });

      toast({
        title: 'Lieferung gesendet!',
        description: `Benachrichtigung über die Auslieferung der finalen Dateien an ${clientEmails.length} Kunde(n) gesendet.`,
      });
    } catch (error: any) {
      console.error('Delivery error:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDelivering(false);
    }
  };

  const handleResendDelivery = async () => {
    if (!gallery || !clientEmails || clientEmails.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Keine Kunden-E-Mails gefunden.',
        variant: 'destructive',
      });
      return;
    }

    setResending(true);
    try {
      const downloadLink = gallery.final_delivery_link 
        ? gallery.final_delivery_link 
        : `${window.location.origin}/gallery/${gallery.slug}`;

      const { error: webhookError } = await supabase.functions.invoke('webhook-deliver', {
        body: {
          gallery_id: gallery.id,
          client_emails: clientEmails,
          download_link: downloadLink,
        },
      });

      if (webhookError) {
        throw new Error(webhookError.message || 'Fehler beim Senden der Benachrichtigung');
      }

      toast({
        title: 'Benachrichtigung erneut gesendet',
        description: `Benachrichtigung wurde an ${clientEmails.length} Kunde(n) erneut gesendet.`,
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: 'Fehler beim Senden',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  const handleCopyFilenames = (selectedPhotos: any[] | undefined) => {
    if (!selectedPhotos || selectedPhotos.length === 0) {
      toast({
        title: 'Keine Fotos ausgewählt',
        description: 'Es wurden keine ausgewählten Fotos zum Kopieren gefunden.',
        variant: 'destructive',
      });
      return;
    }

    const filenames = selectedPhotos.map(p => p.filename).join(' ');
    navigator.clipboard.writeText(filenames);
    
    toast({
      title: 'Kopiert!',
      description: `${selectedPhotos.length} Dateinamen in Zwischenablage kopiert.`,
    });
  };

  return {
    delivering,
    resending,
    useExternalLink,
    setUseExternalLink,
    externalLink,
    setExternalLink,
    handleDeliverFinalFiles,
    handleResendDelivery,
    handleCopyFilenames,
  };
}
