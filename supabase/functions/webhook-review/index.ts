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

    // Get gallery details with company
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
      .eq('id', gallery_id)
      .single();

    if (galleryError) throw galleryError;

    // Get total photo count
    const { count: photosCount, error: photosError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id);

    if (photosError) throw photosError;

    // Get selected photos count
    const { count: selectedCount, error: selectedError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id)
      .eq('is_selected', true);

    if (selectedError) throw selectedError;

    // Get staging count
    const { count: stagingCount, error: stagingError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', gallery_id)
      .eq('staging_requested', true);

    if (stagingError) throw stagingError;

    // Get client details
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
      .eq('gallery_id', gallery_id);

    if (clientsError) throw clientsError;

    // Build client names and emails
    const clientNames = galleryClients
      ?.map(gc => {
        const client = gc.clients as any;
        return `${client.vorname} ${client.nachname}`;
      })
      .filter(Boolean) || [];

    const clientEmails = galleryClients
      ?.map(gc => {
        const client = gc.clients as any;
        return client.email;
      })
      .filter(Boolean) || [];

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
    const adminGalleryUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/admin/galleries/${gallery.slug}`;
    const companyName = gallery.companies && !Array.isArray(gallery.companies) 
      ? (gallery.companies as any).name 
      : '';

    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_reviewed',
      gallery_name: gallery.name,
      gallery_address: gallery.address || '',
      gallery_url: adminGalleryUrl,
      package_target_count: gallery.package_target_count,
      photos_count: photosCount || 0,
      selected_count: selectedCount || 0,
      staging_count: stagingCount || 0,
      client_names: clientNames,
      client_emails: clientEmails,
      admin_email: adminProfile.email,
      company_name: companyName,
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
