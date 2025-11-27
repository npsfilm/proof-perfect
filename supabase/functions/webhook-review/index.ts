import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase-client.ts";
import { 
  fetchGalleryDetails, 
  fetchGalleryClients, 
  fetchPhotosCount,
  fetchSelectedPhotosCount,
  fetchStagingCount,
  fetchEmailSettings,
  getEmailTemplateFields,
  extractClientInfo,
  getCompanyName 
} from "../_shared/gallery-helpers.ts";
import { logWebhookAttempt } from "../_shared/webhook-logger.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const reviewWebhookSchema = z.object({
  gallery_id: z.string().uuid({ message: "Invalid gallery_id format" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // 1. Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[webhook-review] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing Authorization header' }), 
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Validate user session (clients can finalize their own galleries)
    const supabase = createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[webhook-review] Invalid user session:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }), 
        { status: 401, headers: corsHeaders }
      );
    }

    console.log('[webhook-review] Authenticated user:', user.id);

    // 3. Parse and validate input
    const body = await req.json();
    const validationResult = reviewWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('[webhook-review] Input validation failed:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.flatten().fieldErrors 
        }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const { gallery_id } = validationResult.data;

    console.log('Processing review webhook for gallery:', gallery_id);

    // Fetch all required data
    const gallery = await fetchGalleryDetails(gallery_id);
    const galleryClients = await fetchGalleryClients(gallery_id);
    const photosCount = await fetchPhotosCount(gallery_id);
    const selectedCount = await fetchSelectedPhotosCount(gallery_id);
    const stagingCount = await fetchStagingCount(gallery_id);

    // Extract client information
    const { clientNames, clientAnrede } = extractClientInfo(galleryClients);

    // Get admin email
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

    // Get email templates
    const templateFields = getEmailTemplateFields(gallery.salutation_type, 'review');
    const settings = await fetchEmailSettings(['zapier_webhook_send', ...templateFields]);

    if (!settings?.zapier_webhook_send) {
      throw new Error('Zapier send webhook URL not configured');
    }

    const eventId = crypto.randomUUID();
    const companyName = getCompanyName(gallery);
    const adminGalleryUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/rest/v1', '')}/admin/galleries/${gallery.slug}`;
    
    const subjectField = templateFields[0];
    const bodyField = templateFields[1];
    
    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_reviewed',
      gallery_name: gallery.name,
      gallery_address: gallery.address || '',
      gallery_url: adminGalleryUrl,
      package_target_count: gallery.package_target_count,
      photos_count: photosCount,
      selected_count: selectedCount,
      staging_count: stagingCount,
      client_names: clientNames,
      admin_email: adminProfile.email,
      salutation: gallery.salutation_type,
      company_name: companyName,
      email_subject: (settings as any)?.[subjectField] || '',
      email_body: (settings as any)?.[bodyField] || '',
    };

    console.log('Sending review webhook payload:', payload);

    // Send to Zapier
    const webhookResponse = await fetch(settings.zapier_webhook_send, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Log webhook attempt
    await logWebhookAttempt(
      gallery_id,
      'review',
      webhookResponse.ok ? 'success' : 'failed',
      { status: webhookResponse.status, event_id: eventId }
    );

    console.log('Review webhook response status:', webhookResponse.status);

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
