import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Gallery, Photo, GalleryFeedback } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Copy, Send, Loader2, MessageSquare, Wand2, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GalleryReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deliveryLink, setDeliveryLink] = useState('');
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [delivering, setDelivering] = useState(false);

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

  const { data: selectedPhotos } = useQuery({
    queryKey: ['selected-photos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('gallery_id', id!)
        .eq('is_selected', true)
        .order('upload_order', { ascending: true });
      if (error) throw error;
      return data as Photo[];
    },
    enabled: !!id,
  });

  const { data: feedback } = useQuery({
    queryKey: ['gallery-feedback', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_feedback')
        .select('*, profiles(email)')
        .eq('gallery_id', id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: clientEmails } = useQuery({
    queryKey: ['gallery-clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_access')
        .select('profiles(email)')
        .eq('gallery_id', id!);
      if (error) throw error;
      return data.map((a: any) => a.profiles.email) as string[];
    },
    enabled: !!id,
  });

  const handleCopyFilenames = () => {
    if (!selectedPhotos || selectedPhotos.length === 0) {
      toast({
        title: 'No photos selected',
        description: 'There are no selected photos to copy.',
        variant: 'destructive',
      });
      return;
    }

    const filenames = selectedPhotos.map(p => p.filename).join(' ');
    navigator.clipboard.writeText(filenames);
    
    toast({
      title: 'Copied!',
      description: `${selectedPhotos.length} filenames copied to clipboard.`,
    });
  };

  const handleDeliverFinalFiles = async () => {
    if (!deliveryLink.trim()) {
      toast({
        title: 'Missing link',
        description: 'Please enter a download link.',
        variant: 'destructive',
      });
      return;
    }

    if (!clientEmails || clientEmails.length === 0) {
      toast({
        title: 'No clients',
        description: 'No client emails found for this gallery.',
        variant: 'destructive',
      });
      return;
    }

    setDelivering(true);
    try {
      // 1. Update gallery with delivery info
      const { error: updateError } = await supabase
        .from('galleries')
        .update({
          status: 'Delivered',
          final_delivery_link: deliveryLink,
          delivered_at: new Date().toISOString(),
        })
        .eq('id', id!);

      if (updateError) throw updateError;

      // 2. Send delivery webhook
      const { error: webhookError } = await supabase.functions.invoke('webhook-deliver', {
        body: {
          gallery_id: id,
          client_emails: clientEmails,
          download_link: deliveryLink,
        },
      });

      if (webhookError) {
        console.error('Webhook error:', webhookError);
        // Don't fail the whole process if webhook fails
      }

      queryClient.invalidateQueries({ queryKey: ['gallery', id] });

      toast({
        title: 'Delivery sent!',
        description: `Final files delivery notification sent to ${clientEmails.length} client(s).`,
      });

      setShowDeliveryDialog(false);
      setDeliveryLink('');
    } catch (error: any) {
      console.error('Delivery error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDelivering(false);
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

  const stagingPhotos = selectedPhotos?.filter(p => p.staging_requested) || [];
  const photosWithComments = selectedPhotos?.filter(p => p.client_comment) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/galleries/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Review: {gallery.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Client selections and feedback</p>
        </div>
        <Badge variant={gallery.status === 'Delivered' ? 'default' : 'secondary'}>
          {gallery.status}
        </Badge>
      </div>

      {gallery.status !== 'Reviewed' && gallery.status !== 'Delivered' && (
        <Alert>
          <AlertDescription>
            This gallery has not been reviewed by the client yet. Selected photos will appear here once the client finalizes their selection.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Selected Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPhotos?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              out of {gallery.package_target_count} in package
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Staging Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stagingPhotos.length}</div>
            <p className="text-xs text-muted-foreground">photos need staging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photosWithComments.length}</div>
            <p className="text-xs text-muted-foreground">photos with notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Client Feedback */}
      {feedback && feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Client Feedback</CardTitle>
            <CardDescription>General comments from the client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.map((item: any) => (
              <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
                <p className="text-sm">{item.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.profiles.email} • {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <div className="flex gap-3">
          <Button onClick={handleCopyFilenames} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            Copy Filenames
          </Button>
          
          {gallery.status !== 'Delivered' && (
            <Button onClick={() => setShowDeliveryDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Deliver Final Files
            </Button>
          )}

          {gallery.status === 'Delivered' && gallery.final_delivery_link && (
            <Button variant="outline" onClick={() => window.open(gallery.final_delivery_link!, '_blank')}>
              <Check className="h-4 w-4 mr-2" />
              View Delivery Link
            </Button>
          )}
        </div>
      )}

      {/* Selected Photos Grid */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Photos ({selectedPhotos.length})</CardTitle>
            <CardDescription>Photos chosen by the client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {selectedPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary">
                    <img
                      src={photo.storage_url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-mono truncate">{photo.filename}</p>
                    
                    {photo.staging_requested && (
                      <div className="flex items-center gap-1 text-xs text-purple-600">
                        <Wand2 className="h-3 w-3" />
                        <span>Staging: {photo.staging_style || 'Modern'}</span>
                      </div>
                    )}
                    
                    {photo.client_comment && (
                      <div className="flex items-start gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{photo.client_comment}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deliver Final Files</DialogTitle>
            <DialogDescription>
              Enter the download link for the final edited photos (e.g., Google Drive, TransferNow)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="delivery-link">Download Link</Label>
              <Input
                id="delivery-link"
                type="url"
                placeholder="https://drive.google.com/..."
                value={deliveryLink}
                onChange={(e) => setDeliveryLink(e.target.value)}
              />
            </div>
            
            <Alert>
              <AlertDescription>
                This will send a notification to {clientEmails?.length || 0} client(s) with the download link.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeliverFinalFiles} disabled={delivering}>
              {delivering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Delivery
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
