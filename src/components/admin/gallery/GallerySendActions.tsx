import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Loader2 } from 'lucide-react';
import { Gallery, Client, Photo } from '@/types/database';

interface GallerySendActionsProps {
  gallery: Gallery;
  selectedClients: Client[];
  photos?: Photo[];
  galleryClients?: any[];
}

export function GallerySendActions({ gallery, selectedClients, photos, galleryClients }: GallerySendActionsProps) {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSendToClient = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: 'Keine Kunden',
        description: 'Bitte wählen Sie mindestens einen Kunden aus.',
        variant: 'destructive',
      });
      return;
    }

    if (!photos || photos.length === 0) {
      toast({
        title: 'Keine Fotos',
        description: 'Bitte laden Sie Fotos hoch, bevor Sie diese an Kunden senden.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Update existing gallery_clients
      const existingClientIds = galleryClients?.map((gc: any) => gc.client_id) || [];
      const newClientIds = selectedClients.map(c => c.id);
      
      // Remove clients that were deselected
      const toRemove = existingClientIds.filter((id: string) => !newClientIds.includes(id));
      if (toRemove.length > 0) {
        await supabase
          .from('gallery_clients')
          .delete()
          .eq('gallery_id', gallery.id)
          .in('client_id', toRemove);
      }
      
      // Add new clients
      const toAdd = newClientIds.filter(id => !existingClientIds.includes(id));
      if (toAdd.length > 0) {
        const galleryClientRecords = toAdd.map(clientId => ({
          gallery_id: gallery.id,
          client_id: clientId,
        }));
        await supabase.from('gallery_clients').insert(galleryClientRecords);
      }

      // Update gallery status
      const { error: updateError } = await supabase
        .from('galleries')
        .update({ status: 'Open' })
        .eq('id', gallery.id);

      if (updateError) throw updateError;

      // Send email notification via Resend
      const clientEmails = selectedClients.map(c => c.email);

      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: clientEmails,
          subject: 'Test',
          html: 'Test',
        },
      });

      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(emailError.message || 'E-Mail-Versand fehlgeschlagen');
      }

      console.log('Email sent successfully:', emailData);

      toast({
        title: 'Galerie gesendet!',
        description: `An ${selectedClients.length} Kunde(n) gesendet.`,
      });

      queryClient.invalidateQueries({ queryKey: ['gallery', gallery.id] });
      queryClient.invalidateQueries({ queryKey: ['gallery-clients', gallery.id] });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleResendToClient = async () => {
    if (selectedClients.length === 0) {
      toast({
        title: 'Keine Kunden',
        description: 'Bitte wählen Sie mindestens einen Kunden aus.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const galleryUrl = `${window.location.origin}/gallery/${gallery.slug}`;
      const clientEmails = selectedClients.map(c => c.email);

      const { error: webhookError } = await supabase.functions.invoke('webhook-send', {
        body: {
          gallery_id: gallery.id,
          client_emails: clientEmails,
          new_passwords: {},
          gallery_url: galleryUrl,
        },
      });

      if (webhookError) {
        throw new Error(webhookError.message || 'Webhook-Fehler');
      }

      toast({
        title: 'Galerie erneut gesendet!',
        description: `Benachrichtigung an ${selectedClients.length} Kunde(n) gesendet.`,
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex justify-end gap-3">
      {gallery.status === 'Planning' && (
        <Button onClick={handleSendToClient} disabled={sending} size="lg">
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              An Kunde senden
            </>
          )}
        </Button>
      )}
      
      {gallery.status !== 'Planning' && (
        <Button onClick={handleResendToClient} disabled={sending} size="lg" variant="outline">
          {sending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Wird gesendet...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Erneut senden
            </>
          )}
        </Button>
      )}
    </div>
  );
}
