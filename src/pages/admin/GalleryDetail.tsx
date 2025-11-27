import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ClientEmailInput } from '@/components/admin/ClientEmailInput';
import { PhotoUploader } from '@/components/admin/PhotoUploader';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function GalleryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clientEmails, setClientEmails] = useState<string[]>([]);
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

  const { data: accessList } = useQuery({
    queryKey: ['gallery-access', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_access')
        .select('user_id, profiles(email)')
        .eq('gallery_id', id!);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (accessList) {
      const emails = accessList.map((a: any) => a.profiles.email);
      setClientEmails(emails);
    }
  }, [accessList]);

  const handleSendToClient = async () => {
    if (clientEmails.length === 0) {
      toast({
        title: 'No clients',
        description: 'Please add at least one client email.',
        variant: 'destructive',
      });
      return;
    }

    if (!photos || photos.length === 0) {
      toast({
        title: 'No photos',
        description: 'Please upload photos before sending to clients.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Add clients to gallery
      const { data: addResult, error: addError } = await supabase.rpc(
        'add_clients_to_gallery',
        {
          p_gallery_id: id!,
          p_emails: clientEmails,
        }
      );

      if (addError) throw addError;

      const result = addResult as any;

      // Update gallery status
      const { error: updateError } = await supabase
        .from('galleries')
        .update({ status: 'Sent' })
        .eq('id', id!);

      if (updateError) throw updateError;

      // Send webhook notification
      const galleryUrl = `${window.location.origin}/gallery/${gallery.slug}`;
      const newPasswords = result.created?.map((c: any) => ({
        email: c.email,
        temp_password: c.temp_password,
      })) || [];

      const { error: webhookError } = await supabase.functions.invoke('webhook-send', {
        body: {
          gallery_id: id!,
          client_emails: clientEmails,
          new_passwords: newPasswords,
          gallery_url: galleryUrl,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }

      toast({
        title: 'Gallery sent!',
        description: `Sent to ${clientEmails.length} client(s). ${
          result.created?.length > 0 ? `Created ${result.created.length} new account(s).` : ''
        }`,
      });

      queryClient.invalidateQueries({ queryKey: ['gallery', id] });
    } catch (error: any) {
      toast({
        title: 'Error',
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
        <p className="text-muted-foreground">Gallery not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/galleries')}>
          Back to Galleries
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
              View Review
            </Button>
          )}
          <Badge>{gallery.status}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gallery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Gallery URL</p>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-x-auto">
                  {window.location.origin}/gallery/{gallery.slug}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/gallery/${gallery.slug}`);
                    toast({ title: 'Copied!', description: 'Gallery URL copied to clipboard' });
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Package Target</p>
              <p className="font-medium">{gallery.package_target_count} photos</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Salutation</p>
              <p className="font-medium">{gallery.salutation_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Photos Uploaded</p>
              <p className="font-medium">{photos?.length ?? 0} photos</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Access</CardTitle>
            <CardDescription>Add client emails to grant gallery access</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientEmailInput
              emails={clientEmails}
              onChange={setClientEmails}
              disabled={gallery.status !== 'Draft'}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
          <CardDescription>Drag and drop photos or click to browse</CardDescription>
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
            <CardTitle>Photos ({photos.length})</CardTitle>
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

      {gallery.status === 'Draft' && (
        <div className="flex justify-end">
          <Button onClick={handleSendToClient} disabled={sending} size="lg">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Client
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
