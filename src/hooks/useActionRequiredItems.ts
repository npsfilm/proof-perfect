import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActionRequiredItem {
  id: string;
  type: 'delivery_pending' | 'reopen_pending';
  title: string;
  description: string;
  galleryId?: string;
  galleryName?: string;
  gallerySlug?: string;
  count?: number;
  timestamp: string;
  priority: 'high' | 'medium';
}

export function useActionRequiredItems() {
  return useQuery({
    queryKey: ['action-required-items'],
    queryFn: async () => {
      const items: ActionRequiredItem[] = [];

      // Fetch galleries waiting for delivery (status = Closed but not yet delivered)
      const { data: galleriesAwaitingDelivery } = await supabase
        .from('galleries')
        .select('id, name, slug, reviewed_at')
        .eq('status', 'Closed')
        .is('delivered_at', null)
        .order('reviewed_at', { ascending: true });

      if (galleriesAwaitingDelivery && galleriesAwaitingDelivery.length > 0) {
        items.push({
          id: 'delivery-pending-group',
          type: 'delivery_pending',
          title: `${galleriesAwaitingDelivery.length} ${galleriesAwaitingDelivery.length === 1 ? 'Galerie wartet' : 'Galerien warten'} auf Auslieferung`,
          description: galleriesAwaitingDelivery.map(g => g.name).slice(0, 3).join(', ') + 
            (galleriesAwaitingDelivery.length > 3 ? '...' : ''),
          count: galleriesAwaitingDelivery.length,
          timestamp: galleriesAwaitingDelivery[0].reviewed_at || new Date().toISOString(),
          priority: 'high',
        });
      }

      // Fetch pending reopen requests
      const { data: reopenRequests } = await supabase
        .from('reopen_requests')
        .select('id, gallery_id, created_at, galleries(name, slug)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (reopenRequests && reopenRequests.length > 0) {
        items.push({
          id: 'reopen-pending-group',
          type: 'reopen_pending',
          title: `${reopenRequests.length} ${reopenRequests.length === 1 ? 'Wiedereröffnungsanfrage' : 'Wiedereröffnungsanfragen'}`,
          description: reopenRequests.map(r => r.galleries?.name).filter(Boolean).slice(0, 3).join(', ') + 
            (reopenRequests.length > 3 ? '...' : ''),
          count: reopenRequests.length,
          timestamp: reopenRequests[0].created_at,
          priority: 'medium',
        });
      }

      // Sort by priority and timestamp
      return items.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority === 'high' ? -1 : 1;
        }
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
