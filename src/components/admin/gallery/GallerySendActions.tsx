import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, FileEdit } from 'lucide-react';
import { Gallery, Client, Photo } from '@/types/database';
import { EmailCustomizeDialog } from './EmailCustomizeDialog';

interface GallerySendActionsProps {
  gallery: Gallery;
  selectedClients: Client[];
  photos?: Photo[];
  galleryClients?: any[];
}

export function GallerySendActions({ gallery, selectedClients, photos, galleryClients }: GallerySendActionsProps) {
  const [sending, setSending] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateGalleryClientsAndStatus = async () => {
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
  };

  const sendEmail = async (subject: string, html: string) => {
    const clientEmails = selectedClients.map(c => c.email);
    
    const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: clientEmails,
        subject,
        html,
      },
    });

    if (emailError) {
      console.error('Email error:', emailError);
      throw new Error(emailError.message || 'E-Mail-Versand fehlgeschlagen');
    }

    console.log('Email sent successfully:', emailData);
    return emailData;
  };

  const handleSendToClient = async () => {
    console.log('handleSendToClient called');
    console.log('selectedClients:', selectedClients);
    
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
      await updateGalleryClientsAndStatus();
      
      // Send with default template (simple for now)
      await sendEmail(
        `Ihre Fotos für "${gallery.name}" sind bereit`,
        `<p>Ihre Fotos sind jetzt zur Auswahl bereit.</p><p><a href="${window.location.origin}/gallery/${gallery.slug}">Galerie öffnen</a></p>`
      );

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

  const handleCustomizedSend = async (subject: string, customMessage: string, salutationType: 'Du' | 'Sie') => {
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
      await updateGalleryClientsAndStatus();
      
      // Build HTML with custom message
      const greeting = salutationType === 'Sie' 
        ? 'Guten Tag' 
        : 'Hallo';
      
      const customSection = customMessage 
        ? `<p style="background-color: #f0f4ff; padding: 12px; border-radius: 8px; border-left: 3px solid #29497d; margin: 16px 0;">${customMessage}</p>` 
        : '';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>${greeting}!</p>
          ${customSection}
          <p>Ihre Fotos für "${gallery.name}" sind jetzt zur Auswahl bereit.</p>
          <p style="margin: 24px 0;">
            <a href="${window.location.origin}/gallery/${gallery.slug}" 
               style="background-color: #29497d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Fotos ansehen →
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">Mit freundlichen Grüßen<br/>Ihr ImmoOnPoint Team</p>
        </div>
      `;

      await sendEmail(subject, html);

      toast({
        title: 'Galerie gesendet!',
        description: `E-Mail an ${selectedClients.length} Kunde(n) gesendet.`,
      });

      setShowCustomizeDialog(false);
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
      await sendEmail(
        `Erinnerung: Ihre Fotos für "${gallery.name}"`,
        `<p>Ihre Fotos warten noch auf Ihre Auswahl.</p><p><a href="${window.location.origin}/gallery/${gallery.slug}">Galerie öffnen</a></p>`
      );

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
    <>
      <div className="flex justify-end gap-3">
        {gallery.status === 'Planning' && (
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowCustomizeDialog(true)} 
              disabled={sending || selectedClients.length === 0}
              size="lg"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              E-Mail anpassen
            </Button>
            <Button onClick={handleSendToClient} disabled={sending || selectedClients.length === 0} size="lg">
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
          </>
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

      <EmailCustomizeDialog
        open={showCustomizeDialog}
        onOpenChange={setShowCustomizeDialog}
        gallery={gallery}
        selectedClients={selectedClients}
        onSend={handleCustomizedSend}
        sending={sending}
      />
    </>
  );
}
