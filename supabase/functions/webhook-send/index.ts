import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { gallery_id, client_emails, new_passwords, gallery_url } = await req.json();

    console.log('Processing send webhook for gallery:', gallery_id);

    // Get gallery details
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('name, slug, salutation_type')
      .eq('id', gallery_id)
      .single();

    if (galleryError) throw galleryError;

    // Get webhook URL from system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('zapier_webhook_send')
      .limit(1)
      .maybeSingle();

    if (settingsError) throw settingsError;

    if (!settings?.zapier_webhook_send) {
      throw new Error('Zapier send webhook URL not configured');
    }

    const eventId = crypto.randomUUID();
    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_sent_to_client',
      gallery_name: gallery.name,
      gallery_url: gallery_url,
      client_emails: client_emails,
      new_passwords: new_passwords,
      salutation: gallery.salutation_type,
    };

    console.log('Sending webhook payload:', payload);

    // Send to Zapier
    const webhookResponse = await fetch(settings.zapier_webhook_send, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Log webhook attempt
    await supabase.from('webhook_logs').insert({
      gallery_id,
      type: 'send',
      status: webhookResponse.ok ? 'success' : 'failed',
      response_body: { status: webhookResponse.status, event_id: eventId },
    });

    console.log('Send webhook response status:', webhookResponse.status);

    return new Response(
      JSON.stringify({ success: true, event_id: eventId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in webhook-send function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
