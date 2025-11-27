import { createSupabaseClient } from './supabase-client.ts';

export interface GalleryDetails {
  name: string;
  slug: string;
  salutation_type: string;
  address: string | null;
  package_target_count: number;
  company_id: string | null;
  companies?: { name: string } | { name: string }[];
}

export interface ClientDetails {
  vorname: string;
  nachname: string;
  anrede: string | null;
  email: string;
}

export interface EmailSettings {
  zapier_webhook_send?: string;
  zapier_webhook_deliver?: string;
  email_send_subject_du?: string;
  email_send_body_du?: string;
  email_send_subject_sie?: string;
  email_send_body_sie?: string;
  email_review_subject_du?: string;
  email_review_body_du?: string;
  email_review_subject_sie?: string;
  email_review_body_sie?: string;
  email_deliver_subject_du?: string;
  email_deliver_body_du?: string;
  email_deliver_subject_sie?: string;
  email_deliver_body_sie?: string;
}

export async function fetchGalleryDetails(galleryId: string) {
  const supabase = createSupabaseClient();
  
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select(`
      name, 
      slug, 
      salutation_type, 
      address,
      package_target_count,
      company_id,
      companies (name)
    `)
    .eq('id', galleryId)
    .single();

  if (galleryError) throw galleryError;
  return gallery as GalleryDetails;
}

export async function fetchGalleryClients(galleryId: string) {
  const supabase = createSupabaseClient();
  
  const { data: galleryClients, error: clientsError } = await supabase
    .from('gallery_clients')
    .select(`
      clients (
        vorname,
        nachname,
        anrede,
        email
      )
    `)
    .eq('gallery_id', galleryId);

  if (clientsError) throw clientsError;
  return galleryClients;
}

export async function fetchPhotosCount(galleryId: string) {
  const supabase = createSupabaseClient();
  
  const { count, error } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId);

  if (error) throw error;
  return count || 0;
}

export async function fetchSelectedPhotosCount(galleryId: string) {
  const supabase = createSupabaseClient();
  
  const { count, error } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)
    .eq('is_selected', true);

  if (error) throw error;
  return count || 0;
}

export async function fetchStagingCount(galleryId: string) {
  const supabase = createSupabaseClient();
  
  const { count, error } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })
    .eq('gallery_id', galleryId)
    .eq('staging_requested', true);

  if (error) throw error;
  return count || 0;
}

export async function fetchEmailSettings(fields: string[]) {
  const supabase = createSupabaseClient();
  
  const { data: settings, error } = await supabase
    .from('system_settings')
    .select(fields.join(', '))
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return settings as EmailSettings | null;
}

export function getEmailTemplateFields(salutationType: string, templateType: 'send' | 'review' | 'deliver'): string[] {
  const subjectField = salutationType === 'Du' 
    ? `email_${templateType}_subject_du` 
    : `email_${templateType}_subject_sie`;
  const bodyField = salutationType === 'Du' 
    ? `email_${templateType}_body_du` 
    : `email_${templateType}_body_sie`;
  
  return [subjectField, bodyField];
}

export function extractClientInfo(galleryClients: any[]): { clientNames: string[]; clientAnrede: (string | null)[] } {
  const clientNames = galleryClients
    ?.map((gc: any) => {
      const client = gc.clients as ClientDetails;
      return `${client.vorname} ${client.nachname}`;
    })
    .filter(Boolean) || [];

  const clientAnrede = galleryClients
    ?.map((gc: any) => {
      const client = gc.clients as ClientDetails;
      return client.anrede;
    })
    .filter(Boolean) || [];

  return { clientNames, clientAnrede };
}

export function getCompanyName(gallery: GalleryDetails): string {
  return gallery.companies && !Array.isArray(gallery.companies) 
    ? (gallery.companies as any).name 
    : '';
}
