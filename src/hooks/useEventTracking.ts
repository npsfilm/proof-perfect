import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTracking } from '@/contexts/TrackingContext';

type EventCategory = 'navigation' | 'gallery' | 'finalization' | 'staging' | 'interaction';

interface EventMetadata {
  page?: string;
  gallery_id?: string;
  photo_id?: string;
  action?: string;
  duration_seconds?: number;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  scroll_depth?: number;
  selection_count?: number;
  style?: string;
  room_type?: string;
  [key: string]: unknown;
}

interface TrackEventParams {
  eventType: string;
  category?: EventCategory;
  galleryId?: string;
  photoId?: string;
  metadata?: EventMetadata;
}

export function useEventTracking() {
  const { user } = useAuth();
  const { sessionId, isEnabled } = useTracking();
  const lastEventRef = useRef<string | null>(null);
  const sessionStartRef = useRef<number>(Date.now());

  const getDeviceType = useCallback((): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }, []);

  const trackEvent = useCallback(async ({
    eventType,
    category,
    galleryId,
    photoId,
    metadata = {},
  }: TrackEventParams) => {
    if (!isEnabled || !user?.id) return;

    // Prevent duplicate events within 100ms
    const eventKey = `${eventType}-${galleryId}-${photoId}`;
    if (lastEventRef.current === eventKey) return;
    lastEventRef.current = eventKey;
    setTimeout(() => {
      if (lastEventRef.current === eventKey) {
        lastEventRef.current = null;
      }
    }, 100);

    try {
      await supabase.from('user_events').insert({
        user_id: user.id,
        session_id: sessionId,
        event_type: eventType,
        event_category: category,
        gallery_id: galleryId || null,
        photo_id: photoId || null,
        metadata: {
          ...metadata,
          device_type: getDeviceType(),
          session_duration_seconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Silently fail - tracking should not affect user experience
      console.debug('Event tracking failed:', error);
    }
  }, [isEnabled, user?.id, sessionId, getDeviceType]);

  // Convenience methods for common events
  const trackPageView = useCallback((page: string, galleryId?: string) => {
    trackEvent({
      eventType: 'page_view',
      category: 'navigation',
      galleryId,
      metadata: { page },
    });
  }, [trackEvent]);

  const trackGalleryView = useCallback((galleryId: string, photoCount: number) => {
    trackEvent({
      eventType: 'gallery_viewed',
      category: 'gallery',
      galleryId,
      metadata: { photo_count: photoCount },
    });
  }, [trackEvent]);

  const trackPhotoClick = useCallback((galleryId: string, photoId: string, action: 'lightbox_open' | 'comparison_add') => {
    trackEvent({
      eventType: 'photo_click',
      category: 'gallery',
      galleryId,
      photoId,
      metadata: { action },
    });
  }, [trackEvent]);

  const trackSelectionToggle = useCallback((galleryId: string, photoId: string, isSelected: boolean, totalSelected: number) => {
    trackEvent({
      eventType: 'selection_toggle',
      category: 'gallery',
      galleryId,
      photoId,
      metadata: { is_selected: isSelected, total_selected: totalSelected },
    });
  }, [trackEvent]);

  const trackFinalizationStarted = useCallback((galleryId: string, selectedCount: number) => {
    trackEvent({
      eventType: 'finalization_started',
      category: 'finalization',
      galleryId,
      metadata: { selection_count: selectedCount },
    });
  }, [trackEvent]);

  const trackFinalizationStep = useCallback((galleryId: string, step: string, stepNumber: number) => {
    trackEvent({
      eventType: 'finalization_step',
      category: 'finalization',
      galleryId,
      metadata: { step, step_number: stepNumber },
    });
  }, [trackEvent]);

  const trackFinalizationCompleted = useCallback((galleryId: string, durationSeconds: number, services: Record<string, boolean>) => {
    trackEvent({
      eventType: 'finalization_completed',
      category: 'finalization',
      galleryId,
      metadata: { duration_seconds: durationSeconds, services },
    });
  }, [trackEvent]);

  const trackFinalizationAbandoned = useCallback((galleryId: string, step: string, durationSeconds: number) => {
    trackEvent({
      eventType: 'finalization_abandoned',
      category: 'finalization',
      galleryId,
      metadata: { step, duration_seconds: durationSeconds },
    });
  }, [trackEvent]);

  const trackStagingConfigured = useCallback((galleryId: string | undefined, style: string, roomType: string) => {
    trackEvent({
      eventType: 'staging_configured',
      category: 'staging',
      galleryId,
      metadata: { style, room_type: roomType },
    });
  }, [trackEvent]);

  const trackLightboxInteraction = useCallback((galleryId: string, photoId: string, action: 'zoom' | 'navigate' | 'annotation' | 'comment') => {
    trackEvent({
      eventType: 'lightbox_interaction',
      category: 'interaction',
      galleryId,
      photoId,
      metadata: { action },
    });
  }, [trackEvent]);

  const trackScrollDepth = useCallback((galleryId: string, depth: number) => {
    trackEvent({
      eventType: 'scroll_depth',
      category: 'interaction',
      galleryId,
      metadata: { scroll_depth: depth },
    });
  }, [trackEvent]);

  const trackTimeOnGallery = useCallback((galleryId: string, durationSeconds: number) => {
    trackEvent({
      eventType: 'time_on_gallery',
      category: 'gallery',
      galleryId,
      metadata: { duration_seconds: durationSeconds },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackGalleryView,
    trackPhotoClick,
    trackSelectionToggle,
    trackFinalizationStarted,
    trackFinalizationStep,
    trackFinalizationCompleted,
    trackFinalizationAbandoned,
    trackStagingConfigured,
    trackLightboxInteraction,
    trackScrollDepth,
    trackTimeOnGallery,
  };
}
