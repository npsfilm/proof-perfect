import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, FolderOpen, ExternalLink, Lock, Unlock, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useStagingRequests } from '@/hooks/useStagingRequests';
import { useGalleryCoverPhotos } from '@/hooks/useGalleryCoverPhotos';
import { GallerySelectionStats } from '@/types/database';
import { GalleryButtonConfig, GallerySections, ReopenModalState } from './types';

export function useClientDashboardData(
  setReopenModal: (state: ReopenModalState) => void
) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: clientProfile } = useClientProfile(user?.email);
  const { data: stagingRequests } = useStagingRequests();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['client-gallery-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_gallery_selection_stats')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as GallerySelectionStats[];
    },
  });

  // Fetch cover photos for all galleries
  const galleryIds = useMemo(() => 
    stats?.map(g => g.gallery_id || '').filter(Boolean) || [], 
    [stats]
  );
  const { data: coverPhotos } = useGalleryCoverPhotos(galleryIds);

  // Section galleries into Active, Closed, and Completed
  const gallerySections = useMemo<GallerySections>(() => {
    const active: GallerySelectionStats[] = [];
    const closed: GallerySelectionStats[] = [];
    const completed: GallerySelectionStats[] = [];
    
    (stats || []).forEach(gallery => {
      if (gallery.status === 'Planning' || gallery.status === 'Open' || gallery.status === 'Processing') {
        active.push(gallery);
      } else if (gallery.status === 'Closed') {
        closed.push(gallery);
      } else {
        completed.push(gallery); // Delivered
      }
    });
    
    return { 
      activeGalleries: active, 
      closedGalleries: closed, 
      completedGalleries: completed 
    };
  }, [stats]);

  // Count open staging requests
  const openStagingCount = useMemo(() => {
    return stagingRequests?.filter(r => r.status === 'pending').length || 0;
  }, [stagingRequests]);

  // Helper to check if gallery is new (< 2 days old)
  const isNewGallery = (createdAt: string | null) => {
    if (!createdAt) return false;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    return new Date(createdAt) > twoDaysAgo;
  };

  // Get button config based on gallery status
  const getButtonConfig = (
    status: string, 
    slug: string, 
    galleryId: string, 
    name: string
  ): GalleryButtonConfig => {
    switch (status) {
      case 'Planning':
        return {
          label: 'In Vorbereitung',
          icon: Lock,
          disabled: true,
          action: () => {},
        };
      case 'Open':
        return {
          label: 'Fotos auswählen',
          icon: Heart,
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
        };
      case 'Closed':
        return {
          label: 'Um Wiedereröffnung bitten',
          icon: Unlock,
          disabled: false,
          variant: 'outline' as const,
          action: () => {
            setReopenModal({ galleryId, galleryName: name });
          },
        };
      case 'Processing':
        return {
          label: 'In Bearbeitung',
          icon: RefreshCw,
          disabled: true,
          action: () => {},
        };
      case 'Delivered':
        return {
          label: 'Herunterladen',
          icon: ExternalLink,
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
        };
      default:
        return {
          label: 'Galerie öffnen',
          icon: FolderOpen,
          disabled: false,
          action: () => navigate(`/gallery/${slug}`),
        };
    }
  };

  return {
    clientProfile,
    stats,
    isLoading,
    refetch,
    coverPhotos,
    gallerySections,
    openStagingCount,
    isNewGallery,
    getButtonConfig,
  };
}
