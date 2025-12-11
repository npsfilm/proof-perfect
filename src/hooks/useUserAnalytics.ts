import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FunnelStep {
  step: string;
  count: number;
  dropOffRate: number;
}

interface HourlyActivity {
  hour: number;
  day: number;
  count: number;
}

interface DeviceStats {
  device: string;
  count: number;
  conversionRate: number;
}

interface UserAnalyticsData {
  // Conversion Funnel
  conversionFunnel: FunnelStep[];
  
  // Engagement Metrics
  averageSessionDuration: number; // seconds
  averageSessionsToFinalize: number;
  peakUsageHours: HourlyActivity[];
  
  // Hurdle Detection
  stuckGalleries: {
    gallery_id: string;
    gallery_name: string;
    session_count: number;
    days_since_sent: number;
  }[];
  averageTimeToFirstVisit: number; // hours
  
  // Device & Browser
  deviceStats: DeviceStats[];
  
  // Photo Interaction
  mostClickedWithoutSelection: {
    photo_id: string;
    gallery_id: string;
    click_count: number;
  }[];
  averageLightboxDuration: number; // seconds
  zoomUsageRate: number; // percentage
  
  // Session Analysis
  totalSessions: number;
  totalEvents: number;
  uniqueUsers: number;
  
  // Time-based patterns
  eventsByDay: { date: string; count: number }[];
}

export function useUserAnalytics(days: number = 30) {
  return useQuery({
    queryKey: ['user-analytics', days],
    queryFn: async (): Promise<UserAnalyticsData> => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Fetch all events from the period
      const { data: events, error } = await supabase
        .from('user_events')
        .select('*')
        .gte('created_at', startDateStr)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch galleries for context
      const { data: galleries } = await supabase
        .from('galleries')
        .select('id, name, created_at, status');

      // Calculate metrics
      const eventsList = events || [];
      const galleriesList = galleries || [];

      // Unique sessions and users
      const uniqueSessions = new Set(eventsList.map(e => e.session_id));
      const uniqueUsers = new Set(eventsList.map(e => e.user_id));

      // Conversion Funnel
      const funnelEvents = {
        gallery_viewed: new Set<string>(),
        selection_toggle: new Set<string>(),
        finalization_started: new Set<string>(),
        finalization_completed: new Set<string>(),
      };

      eventsList.forEach(e => {
        if (e.gallery_id && funnelEvents[e.event_type as keyof typeof funnelEvents]) {
          funnelEvents[e.event_type as keyof typeof funnelEvents].add(e.gallery_id);
        }
      });

      const funnelCounts = {
        viewed: funnelEvents.gallery_viewed.size,
        selected: funnelEvents.selection_toggle.size,
        started: funnelEvents.finalization_started.size,
        completed: funnelEvents.finalization_completed.size,
      };

      const conversionFunnel: FunnelStep[] = [
        { step: 'Galerie geöffnet', count: funnelCounts.viewed, dropOffRate: 0 },
        { step: 'Erste Auswahl', count: funnelCounts.selected, dropOffRate: funnelCounts.viewed > 0 ? ((funnelCounts.viewed - funnelCounts.selected) / funnelCounts.viewed) * 100 : 0 },
        { step: 'Finalisierung gestartet', count: funnelCounts.started, dropOffRate: funnelCounts.selected > 0 ? ((funnelCounts.selected - funnelCounts.started) / funnelCounts.selected) * 100 : 0 },
        { step: 'Abgeschlossen', count: funnelCounts.completed, dropOffRate: funnelCounts.started > 0 ? ((funnelCounts.started - funnelCounts.completed) / funnelCounts.started) * 100 : 0 },
      ];

      // Session Duration (from metadata)
      const sessionDurations = eventsList
        .filter(e => e.metadata && typeof e.metadata === 'object' && 'session_duration_seconds' in e.metadata)
        .map(e => (e.metadata as Record<string, unknown>).session_duration_seconds as number);
      const averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length 
        : 0;

      // Sessions to Finalize
      const sessionsPerGalleryBeforeFinalize = new Map<string, Set<string>>();
      eventsList.forEach(e => {
        if (e.gallery_id && e.event_type !== 'finalization_completed') {
          if (!sessionsPerGalleryBeforeFinalize.has(e.gallery_id)) {
            sessionsPerGalleryBeforeFinalize.set(e.gallery_id, new Set());
          }
          sessionsPerGalleryBeforeFinalize.get(e.gallery_id)!.add(e.session_id);
        }
      });
      const finalized = eventsList.filter(e => e.event_type === 'finalization_completed').map(e => e.gallery_id!);
      const sessionCounts = finalized.map(gid => sessionsPerGalleryBeforeFinalize.get(gid)?.size || 1);
      const averageSessionsToFinalize = sessionCounts.length > 0 
        ? sessionCounts.reduce((a, b) => a + b, 0) / sessionCounts.length 
        : 0;

      // Peak Usage Hours
      const hourlyMap = new Map<string, number>();
      eventsList.forEach(e => {
        const date = new Date(e.created_at);
        const key = `${date.getDay()}-${date.getHours()}`;
        hourlyMap.set(key, (hourlyMap.get(key) || 0) + 1);
      });
      const peakUsageHours: HourlyActivity[] = Array.from(hourlyMap.entries())
        .map(([key, count]) => {
          const [day, hour] = key.split('-').map(Number);
          return { day, hour, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

      // Stuck Galleries (3+ sessions, no finalization)
      const gallerySessionCounts = new Map<string, { sessions: Set<string>; lastEvent: Date }>();
      eventsList.forEach(e => {
        if (e.gallery_id) {
          if (!gallerySessionCounts.has(e.gallery_id)) {
            gallerySessionCounts.set(e.gallery_id, { sessions: new Set(), lastEvent: new Date(e.created_at) });
          }
          gallerySessionCounts.get(e.gallery_id)!.sessions.add(e.session_id);
          const eventDate = new Date(e.created_at);
          if (eventDate > gallerySessionCounts.get(e.gallery_id)!.lastEvent) {
            gallerySessionCounts.get(e.gallery_id)!.lastEvent = eventDate;
          }
        }
      });
      
      const finalizedGalleryIds = new Set(finalized);
      const stuckGalleries = Array.from(gallerySessionCounts.entries())
        .filter(([gid, data]) => data.sessions.size >= 3 && !finalizedGalleryIds.has(gid))
        .map(([gid, data]) => {
          const gallery = galleriesList.find(g => g.id === gid);
          const daysSinceSent = gallery ? Math.floor((Date.now() - new Date(gallery.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
          return {
            gallery_id: gid,
            gallery_name: gallery?.name || 'Unbekannt',
            session_count: data.sessions.size,
            days_since_sent: daysSinceSent,
          };
        })
        .sort((a, b) => b.session_count - a.session_count)
        .slice(0, 10);

      // Average Time to First Visit
      const firstVisitTimes: number[] = [];
      const galleryFirstVisit = new Map<string, Date>();
      eventsList.forEach(e => {
        if (e.gallery_id && e.event_type === 'gallery_viewed') {
          if (!galleryFirstVisit.has(e.gallery_id)) {
            galleryFirstVisit.set(e.gallery_id, new Date(e.created_at));
          }
        }
      });
      galleryFirstVisit.forEach((firstVisit, gid) => {
        const gallery = galleriesList.find(g => g.id === gid);
        if (gallery) {
          const created = new Date(gallery.created_at);
          const hours = (firstVisit.getTime() - created.getTime()) / (1000 * 60 * 60);
          if (hours >= 0) firstVisitTimes.push(hours);
        }
      });
      const averageTimeToFirstVisit = firstVisitTimes.length > 0 
        ? firstVisitTimes.reduce((a, b) => a + b, 0) / firstVisitTimes.length 
        : 0;

      // Device Stats
      const deviceCounts = new Map<string, { total: number; finalized: number }>();
      eventsList.forEach(e => {
        const device = (e.metadata as Record<string, unknown>)?.device_type as string || 'unknown';
        if (!deviceCounts.has(device)) {
          deviceCounts.set(device, { total: 0, finalized: 0 });
        }
        deviceCounts.get(device)!.total++;
        if (e.event_type === 'finalization_completed') {
          deviceCounts.get(device)!.finalized++;
        }
      });
      const deviceStats: DeviceStats[] = Array.from(deviceCounts.entries())
        .map(([device, data]) => ({
          device,
          count: data.total,
          conversionRate: data.total > 0 ? (data.finalized / data.total) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      // Photo Interaction Analysis
      const photoClicks = new Map<string, { gallery_id: string; clicks: number; selected: boolean }>();
      eventsList.forEach(e => {
        if (e.photo_id && e.event_type === 'photo_click') {
          if (!photoClicks.has(e.photo_id)) {
            photoClicks.set(e.photo_id, { gallery_id: e.gallery_id!, clicks: 0, selected: false });
          }
          photoClicks.get(e.photo_id)!.clicks++;
        }
        if (e.photo_id && e.event_type === 'selection_toggle') {
          const meta = e.metadata as Record<string, unknown>;
          if (meta?.is_selected) {
            if (photoClicks.has(e.photo_id)) {
              photoClicks.get(e.photo_id)!.selected = true;
            }
          }
        }
      });
      const mostClickedWithoutSelection = Array.from(photoClicks.entries())
        .filter(([_, data]) => !data.selected && data.clicks >= 2)
        .map(([photo_id, data]) => ({
          photo_id,
          gallery_id: data.gallery_id,
          click_count: data.clicks,
        }))
        .sort((a, b) => b.click_count - a.click_count)
        .slice(0, 10);

      // Lightbox Duration (from time_on_gallery or lightbox events)
      const lightboxDurations = eventsList
        .filter(e => e.event_type === 'lightbox_interaction' && e.metadata)
        .map(e => (e.metadata as Record<string, unknown>).duration_seconds as number)
        .filter(d => typeof d === 'number' && d > 0);
      const averageLightboxDuration = lightboxDurations.length > 0 
        ? lightboxDurations.reduce((a, b) => a + b, 0) / lightboxDurations.length 
        : 0;

      // Zoom Usage Rate
      const lightboxEvents = eventsList.filter(e => e.event_type === 'lightbox_interaction');
      const zoomEvents = lightboxEvents.filter(e => (e.metadata as Record<string, unknown>)?.action === 'zoom');
      const zoomUsageRate = lightboxEvents.length > 0 ? (zoomEvents.length / lightboxEvents.length) * 100 : 0;

      // Events by Day
      const eventsByDayMap = new Map<string, number>();
      eventsList.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0];
        eventsByDayMap.set(date, (eventsByDayMap.get(date) || 0) + 1);
      });
      const eventsByDay = Array.from(eventsByDayMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        conversionFunnel,
        averageSessionDuration,
        averageSessionsToFinalize,
        peakUsageHours,
        stuckGalleries,
        averageTimeToFirstVisit,
        deviceStats,
        mostClickedWithoutSelection,
        averageLightboxDuration,
        zoomUsageRate,
        totalSessions: uniqueSessions.size,
        totalEvents: eventsList.length,
        uniqueUsers: uniqueUsers.size,
        eventsByDay,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
