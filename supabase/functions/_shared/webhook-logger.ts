import { createSupabaseClient } from './supabase-client.ts';

export async function logWebhookAttempt(
  galleryId: string,
  type: 'send' | 'review' | 'deliver',
  status: 'success' | 'failed',
  responseBody: any
) {
  const supabase = createSupabaseClient();
  
  await supabase.from('webhook_logs').insert({
    gallery_id: galleryId,
    type,
    status,
    response_body: responseBody,
  });
}
