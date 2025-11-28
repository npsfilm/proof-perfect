import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityItem {
  id: string;
  type: 'gallery_sent' | 'gallery_reviewed' | 'gallery_delivered' | 
        'comment_added' | 'staging_requested' | 'reopen_requested' | 'feedback_added';
  title: string;
  description: string;
  timestamp: string;
  galleryId?: string;
  galleryName?: string;
  gallerySlug?: string;
  actorEmail?: string;
  status?: 'success' | 'failed' | 'pending';
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const activities: ActivityItem[] = [];

      // Fetch webhook logs for send/review/deliver events
      const { data: webhookLogs } = await supabase
        .from('webhook_logs')
        .select('*, galleries(name, slug)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (webhookLogs) {
        webhookLogs.forEach(log => {
          let type: ActivityItem['type'];
          let title: string;
          let description: string;

          if (log.type === 'send') {
            type = 'gallery_sent';
            title = 'Galerie gesendet';
            description = log.galleries?.name || 'Unbekannte Galerie';
          } else if (log.type === 'review') {
            type = 'gallery_reviewed';
            title = 'Auswahl abgeschlossen';
            description = log.galleries?.name || 'Unbekannte Galerie';
          } else if (log.type === 'deliver') {
            type = 'gallery_delivered';
            title = 'Galerie ausgeliefert';
            description = log.galleries?.name || 'Unbekannte Galerie';
          } else {
            return;
          }

          activities.push({
            id: log.id,
            type,
            title,
            description,
            timestamp: log.created_at,
            galleryId: log.gallery_id || undefined,
            galleryName: log.galleries?.name,
            gallerySlug: log.galleries?.slug,
            status: log.status as 'success' | 'failed',
          });
        });
      }

      // Fetch photo annotations for comment activity
      const { data: annotations } = await supabase
        .from('photo_annotations')
        .select('*, photos(filename, gallery_id, galleries(name, slug))')
        .order('created_at', { ascending: false })
        .limit(20);

      if (annotations) {
        // Fetch profiles separately to get actor emails
        const authorIds = [...new Set(annotations.map(a => a.author_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

        annotations.forEach(annotation => {
          activities.push({
            id: annotation.id,
            type: 'comment_added',
            title: 'Kommentar hinzugefügt',
            description: `${annotation.photos?.galleries?.name || 'Galerie'} · ${annotation.photos?.filename || ''}`,
            timestamp: annotation.created_at,
            galleryId: annotation.photos?.gallery_id,
            galleryName: annotation.photos?.galleries?.name,
            gallerySlug: annotation.photos?.galleries?.slug,
            actorEmail: profileMap.get(annotation.author_user_id),
          });
        });
      }

      // Fetch gallery feedback
      const { data: feedbacks } = await supabase
        .from('gallery_feedback')
        .select('*, galleries(name, slug)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (feedbacks) {
        // Fetch profiles separately
        const authorIds = [...new Set(feedbacks.map(f => f.author_user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', authorIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

        feedbacks.forEach(feedback => {
          activities.push({
            id: feedback.id,
            type: 'feedback_added',
            title: 'Feedback erhalten',
            description: feedback.galleries?.name || 'Unbekannte Galerie',
            timestamp: feedback.created_at,
            galleryId: feedback.gallery_id,
            galleryName: feedback.galleries?.name,
            gallerySlug: feedback.galleries?.slug,
            actorEmail: profileMap.get(feedback.author_user_id),
          });
        });
      }

      // Fetch reopen requests
      const { data: reopenRequests } = await supabase
        .from('reopen_requests')
        .select('*, galleries(name, slug)')
        .order('created_at', { ascending: false })
        .limit(10);

      if (reopenRequests) {
        // Fetch profiles separately
        const userIds = [...new Set(reopenRequests.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

        reopenRequests.forEach(request => {
          activities.push({
            id: request.id,
            type: 'reopen_requested',
            title: 'Wiedereröffnung angefragt',
            description: request.galleries?.name || 'Unbekannte Galerie',
            timestamp: request.created_at,
            galleryId: request.gallery_id,
            galleryName: request.galleries?.name,
            gallerySlug: request.galleries?.slug,
            actorEmail: profileMap.get(request.user_id),
            status: request.status === 'pending' ? 'pending' : 'success',
          });
        });
      }

      // Fetch galleries with staging requested
      const { data: stagingPhotos } = await supabase
        .from('photos')
        .select('gallery_id, galleries(name, slug), updated_at')
        .eq('staging_requested', true)
        .order('updated_at', { ascending: false })
        .limit(15);

      if (stagingPhotos) {
        const stagingByGallery = new Map<string, typeof stagingPhotos[0]>();
        stagingPhotos.forEach(photo => {
          if (photo.gallery_id && !stagingByGallery.has(photo.gallery_id)) {
            stagingByGallery.set(photo.gallery_id, photo);
          }
        });

        stagingByGallery.forEach((photo, galleryId) => {
          activities.push({
            id: `staging-${galleryId}`,
            type: 'staging_requested',
            title: 'Staging angefordert',
            description: photo.galleries?.name || 'Unbekannte Galerie',
            timestamp: photo.updated_at,
            galleryId: galleryId,
            galleryName: photo.galleries?.name,
            gallerySlug: photo.galleries?.slug,
          });
        });
      }

      // Sort by timestamp (most recent first) and take top 15
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 15);
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
