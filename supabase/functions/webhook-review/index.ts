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

    const { gallery_id } = await req.json();

    console.log('Processing review webhook for gallery:', gallery_id);

    // Get gallery details
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('name, salutation_type')
      .eq('id', gallery_id)
      .single();

    if (galleryError) throw galleryError;

    // Get selected photos count
    const { count: selectedCount, error: photosError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id)
      .eq('is_selected', true);

    if (photosError) throw photosError;

    // Get staging count
    const { count: stagingCount, error: stagingError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id)
      .eq('staging_requested', true);

    if (stagingError) throw stagingError;

    // Get admin email (first admin user)
    const { data: adminRole, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError) throw adminError;

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', adminRole.user_id)
      .single();

    if (profileError) throw profileError;

    // Get webhook URL from system settings
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('zapier_webhook_send')
      .limit(1)
      .single();

    if (settingsError) throw settingsError;

    if (!settings?.zapier_webhook_send) {
      throw new Error('Zapier webhook URL not configured');
    }

    const eventId = crypto.randomUUID();
    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_reviewed',
      gallery_name: gallery.name,
      selected_count: selectedCount || 0,
      staging_count: stagingCount || 0,
      admin_email: adminProfile.email,
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
      type: 'review',
      status: webhookResponse.ok ? 'success' : 'failed',
      response_body: { status: webhookResponse.status, event_id: eventId },
    });

    console.log('Webhook response status:', webhookResponse.status);

    return new Response(
      JSON.stringify({ success: true, event_id: eventId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in webhook-review function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
