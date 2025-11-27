import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo, Client } from '@/types/database';
import { useCompanies } from '@/hooks/useCompanies';
import { useGalleryClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ClientPicker } from '@/components/admin/ClientPicker';
import { PhotoUploader } from '@/components/admin/PhotoUploader';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: companies } = useCompanies();
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [sending, setSending] = useState(false);

  const { data: gallery, isLoading: galleryLoading } = useQuery({
    queryKey: ['gallery', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Gallery;
    },
  });

  const { data: photos, refetch: refetchPhotos } = useQuery({
    queryKey: ['photos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', id!)
        .order('upload_order', { ascending: true });
      if (error) throw error;
      return data as Photo[];
    },
  });

  const { data: galleryClients } = useGalleryClients(id);

  useEffect(() => {
    if (galleryClients) {
      const clients = galleryClients.map((gc: any) => gc.clients);
      setSelectedClients(clients);
    }
  }, [galleryClients]);

  const handleCompanyChange = async (companyId: string) => {
    try {
      await supabase.rpc('assign_gallery_to_company', {
        p_gallery_id: id!,
        p_company_id: companyId || null,
      });
      
      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      toast({
        title: 'Unternehmen aktualisiert',
        description: 'Unternehmens-Zuweisung der Galerie erfolgreich aktualisiert',
      });
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

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
          .eq('gallery_id', id!)
          .in('client_id', toRemove);
      }
      
      // Add new clients
      const toAdd = newClientIds.filter(id => !existingClientIds.includes(id));
      if (toAdd.length > 0) {
        const galleryClientRecords = toAdd.map(clientId => ({
          gallery_id: id!,
          client_id: clientId,
        }));
        await supabase.from('gallery_clients').insert(galleryClientRecords);
      }

      // Update gallery status
      const { error: updateError } = await supabase
        .from('galleries')
        .update({ status: 'Sent' })
        .eq('id', id!);

      if (updateError) throw updateError;

      // Send webhook notification
      const galleryUrl = `${window.location.origin}/gallery/${gallery.slug}`;
      const clientEmails = selectedClients.map(c => c.email);

      const { error: webhookError } = await supabase.functions.invoke('webhook-send', {
        body: {
          gallery_id: id!,
          client_emails: clientEmails,
          new_passwords: [], // No new passwords since clients already exist
          gallery_url: galleryUrl,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
      }

      toast({
        title: 'Galerie gesendet!',
        description: `An ${selectedClients.length} Kunde(n) gesendet.`,
      });

      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
      queryClient.invalidateQueries({ queryKey: ['gallery-clients', id] });
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
      // Send webhook notification without changing status
      const galleryUrl = `${window.location.origin}/gallery/${gallery.slug}`;
      const clientEmails = selectedClients.map(c => c.email);

      const { error: webhookError } = await supabase.functions.invoke('webhook-send', {
        body: {
          gallery_id: id!,
          client_emails: clientEmails,
          new_passwords: [],
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

  if (galleryLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Galerie nicht gefunden</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/galleries')}>
          Zurück zu Galerien
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/galleries')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">{gallery.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{gallery.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {(gallery.status === 'Reviewed' || gallery.status === 'Delivered') && (
            <Button onClick={() => navigate(`/admin/galleries/${gallery.id}/review`)}>
              Überprüfung ansehen
            </Button>
          )}
          <Badge>{gallery.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Galerie-Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Galerie-URL</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                  {window.location.origin}/gallery/{gallery.slug}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`);
                    toast({ title: 'Kopiert!', description: 'Galerie-URL in Zwischenablage kopiert' });
                  }}
                >
                  Kopieren
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paket-Ziel</p>
              <p className="font-medium">{gallery.package_target_count} Fotos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anrede</p>
              <p className="font-medium">{gallery.salutation_type}</p>
            </div>
            {gallery.address && (
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="font-medium whitespace-pre-line">{gallery.address}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Hochgeladene Fotos</p>
              <p className="font-medium">{photos?.length ?? 0} Fotos</p>
            </div>
            <div className="pt-4 border-t">
              <Label htmlFor="company-select" className="text-sm text-muted-foreground">
                Unternehmen
              </Label>
              <Select
                value={gallery.company_id || 'none'}
                onValueChange={(value) => handleCompanyChange(value === 'none' ? '' : value)}
                disabled={gallery.status !== 'Draft'}
              >
                <SelectTrigger id="company-select" className="mt-2">
                  <SelectValue placeholder="Unternehmen auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keines</SelectItem>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kunden</CardTitle>
            <CardDescription>Wählen Sie die Kunden aus, die Zugriff auf diese Galerie haben sollen</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientPicker
              selectedClients={selectedClients}
              onClientsChange={setSelectedClients}
              disabled={gallery.status !== 'Draft'}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fotos hochladen</CardTitle>
          <CardDescription>Fotos per Drag & Drop ablegen oder klicken zum Durchsuchen</CardDescription>
        </CardHeader>
        <CardContent>
          <PhotoUploader
            galleryId={gallery.id}
            gallerySlug={gallery.slug}
            onUploadComplete={() => refetchPhotos()}
          />
        </CardContent>
      </Card>

      {photos && photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fotos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={photo.storage_url}
                    alt={photo.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3">
        {gallery.status === 'Draft' && (
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
        
        {gallery.status !== 'Draft' && (
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
    </div>
  );
}