import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalGalleries: number;
  galleriesByStatus: { status: string; count: number }[];
  averageSelectionRate: number;
  averageReviewTime: number; // in hours
  stagingRequests: { style: string; count: number }[];
  recentActivity: {
    date: string;
    sent: number;
    reviewed: number;
    delivered: number;
  }[];
  topEngagedClients: {
    email: string;
    galleries: number;
    selections: number;
    comments: number;
  }[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async (): Promise<AnalyticsData> => {
      // Fetch all galleries
      const { data: galleries, error: galleriesError } = await supabase
        .from('galleries')
        .select('*');

      if (galleriesError) throw galleriesError;

      // Fetch all photos with selection data
      const { data: photos, error: photosError } = await supabase
        .from('photos')
        .select('gallery_id, is_selected, staging_requested, staging_style');

      if (photosError) throw photosError;

      // Fetch all feedback
      const { data: feedback, error: feedbackError } = await supabase
        .from('gallery_feedback')
        .select('gallery_id, author_user_id');

      if (feedbackError) throw feedbackError;

      // Fetch client gallery access with profiles
      const { data: galleryAccess, error: accessError } = await supabase
        .from('gallery_access')
        .select('gallery_id, user_id, profiles(email)');

      if (accessError) throw accessError;

      // Calculate metrics
      const totalGalleries = galleries?.length || 0;

      // Galleries by status
      const statusCounts = galleries?.reduce((acc, g) => {
        acc[g.status] = (acc[g.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const galleriesByStatus = Object.entries(statusCounts || {}).map(([status, count]) => ({
        status,
        count,
      }));

      // Average selection rate
      const selectionRates = galleries?.map(g => {
        const galleryPhotos = photos?.filter(p => p.gallery_id === g.id) || [];
        const selectedPhotos = galleryPhotos.filter(p => p.is_selected).length;
        return galleryPhotos.length > 0 ? (selectedPhotos / g.package_target_count) * 100 : 0;
      }) || [];

      const averageSelectionRate = selectionRates.length > 0
        ? selectionRates.reduce((a, b) => a + b, 0) / selectionRates.length
        : 0;

      // Average review time (in hours)
      const reviewTimes = galleries
        ?.filter(g => g.status === 'Reviewed' || g.status === 'Delivered')
        .map(g => {
          // For now, just calculate based on created_at to reviewed_at
          // In production, you'd track when status changed to 'Sent'
          if (g.reviewed_at) {
            const sent = new Date(g.created_at).getTime();
            const reviewed = new Date(g.reviewed_at).getTime();
            return (reviewed - sent) / (1000 * 60 * 60); // hours
          }
          return 0;
        })
        .filter(t => t > 0) || [];

      const averageReviewTime = reviewTimes.length > 0
        ? reviewTimes.reduce((a, b) => a + b, 0) / reviewTimes.length
        : 0;

      // Staging requests by style
      const stagingPhotos = photos?.filter(p => p.staging_requested) || [];
      const stagingCounts = stagingPhotos.reduce((acc, p) => {
        const style = p.staging_style || 'Modern';
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const stagingRequests = Object.entries(stagingCounts).map(([style, count]) => ({
        style,
        count,
      }));

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activityByDate = galleries?.reduce((acc, g) => {
        const date = new Date(g.created_at).toISOString().split('T')[0];
        if (new Date(g.created_at) >= thirtyDaysAgo) {
          if (!acc[date]) {
            acc[date] = { sent: 0, reviewed: 0, delivered: 0 };
          }
          if (g.status === 'Sent') acc[date].sent++;
          if (g.status === 'Reviewed') acc[date].reviewed++;
          if (g.status === 'Delivered') acc[date].delivered++;
        }
        return acc;
      }, {} as Record<string, { sent: number; reviewed: number; delivered: number }>);

      const recentActivity = Object.entries(activityByDate || {})
        .map(([date, counts]) => ({
          date,
          ...counts,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top engaged clients
      const clientEngagement = galleryAccess?.reduce((acc, access: any) => {
        const email = access.profiles?.email || 'Unknown';
        if (!acc[email]) {
          acc[email] = { galleries: 0, selections: 0, comments: 0 };
        }
        acc[email].galleries++;

        // Count selections
        const galleryPhotos = photos?.filter(p => p.gallery_id === access.gallery_id && p.is_selected) || [];
        acc[email].selections += galleryPhotos.length;

        // Count comments
        const galleryFeedback = feedback?.filter(f => f.gallery_id === access.gallery_id && f.author_user_id === access.user_id) || [];
        acc[email].comments += galleryFeedback.length;

        return acc;
      }, {} as Record<string, { galleries: number; selections: number; comments: number }>);

      const topEngagedClients = Object.entries(clientEngagement || {})
        .map(([email, stats]) => ({
          email,
          ...stats,
        }))
        .sort((a, b) => b.galleries - a.galleries)
        .slice(0, 10);

      return {
        totalGalleries,
        galleriesByStatus,
        averageSelectionRate,
        averageReviewTime,
        stagingRequests,
        recentActivity,
        topEngagedClients,
      };
    },
  });
}
