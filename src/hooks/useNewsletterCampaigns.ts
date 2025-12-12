import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NewsletterCampaign {
  id: string;
  name: string;
  template_id: string | null;
  target_tags: string[];
  exclude_tags: string[];
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  scheduled_for: string | null;
  sent_at: string | null;
  recipient_count: number | null;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export function useNewsletterCampaigns() {
  return useQuery({
    queryKey: ['newsletter-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NewsletterCampaign[];
    },
  });
}

export function useCampaignWithTemplate(campaignId: string | null) {
  return useQuery({
    queryKey: ['newsletter-campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;

      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .select(`
          *,
          email_templates (
            id,
            name,
            subject_du,
            subject_sie
          )
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });
}

export function useCampaignRecipientCount(targetTags: string[], excludeTags: string[]) {
  return useQuery({
    queryKey: ['campaign-recipient-count', targetTags, excludeTags],
    queryFn: async () => {
      // Get all clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, email_newsletter_marketing');

      if (clientsError) throw clientsError;

      // Filter to only marketing-opted clients
      const optedInClients = clients?.filter(c => c.email_newsletter_marketing) || [];

      if (targetTags.length === 0 && excludeTags.length === 0) {
        return optedInClients.length;
      }

      // Get tag assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('client_tag_assignments')
        .select('client_id, tag_id');

      if (assignmentsError) throw assignmentsError;

      const clientTags = new Map<string, Set<string>>();
      assignments?.forEach(a => {
        if (!clientTags.has(a.client_id)) {
          clientTags.set(a.client_id, new Set());
        }
        clientTags.get(a.client_id)!.add(a.tag_id);
      });

      let filteredClients = optedInClients;

      // Filter by target tags (must have at least one)
      if (targetTags.length > 0) {
        filteredClients = filteredClients.filter(client => {
          const tags = clientTags.get(client.id);
          return tags && targetTags.some(t => tags.has(t));
        });
      }

      // Exclude by exclude tags
      if (excludeTags.length > 0) {
        filteredClients = filteredClients.filter(client => {
          const tags = clientTags.get(client.id);
          if (!tags) return true;
          return !excludeTags.some(t => tags.has(t));
        });
      }

      return filteredClients.length;
    },
    enabled: true,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaign: Omit<NewsletterCampaign, 'id' | 'created_at' | 'updated_at' | 'open_count' | 'click_count' | 'sent_at' | 'recipient_count'>) => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({ title: 'Kampagne erstellt' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NewsletterCampaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({ title: 'Kampagne aktualisiert' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({ title: 'Kampagne gelöscht' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}

export function useSendCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.functions.invoke('send-campaign', {
        body: { campaignId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({ title: 'Kampagne wird gesendet' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler beim Senden', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCancelCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('newsletter_campaigns')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-campaigns'] });
      toast({ title: 'Kampagne abgebrochen' });
    },
    onError: (error: Error) => {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    },
  });
}
