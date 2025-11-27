import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase-client.ts";
import { 
  fetchGalleryDetails, 
  fetchGalleryClients, 
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
const deliverWebhookSchema = z.object({
  gallery_id: z.string().uuid({ message: "Invalid gallery_id format" }),
  client_emails: z.array(z.string().email({ message: "Invalid email format" })).min(1, { message: "At least one client email required" }),
  download_link: z.string().url({ message: "Invalid download_link format" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // 1. Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[webhook-deliver] Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing Authorization header' }), 
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Validate user session
    const supabase = createSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('[webhook-deliver] Invalid user session:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid session' }), 
        { status: 401, headers: corsHeaders }
      );
    }

    // 3. Verify admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleError || roleData?.role !== 'admin') {
      console.error('[webhook-deliver] User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { status: 403, headers: corsHeaders }
      );
    }

    console.log('[webhook-deliver] Authenticated admin user:', user.id);

    // 4. Parse and validate input
    const body = await req.json();
    const validationResult = deliverWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('[webhook-deliver] Input validation failed:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.flatten().fieldErrors 
        }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const { gallery_id, client_emails, download_link } = validationResult.data;

    console.log('Processing delivery webhook for gallery:', gallery_id);

    // Fetch all required data
    const gallery = await fetchGalleryDetails(gallery_id);
    const galleryClients = await fetchGalleryClients(gallery_id);
    const selectedCount = await fetchSelectedPhotosCount(gallery_id);
    const stagingCount = await fetchStagingCount(gallery_id);

    // Extract client information
    const { clientNames, clientAnrede } = extractClientInfo(galleryClients);

    // Get email templates
    const templateFields = getEmailTemplateFields(gallery.salutation_type, 'deliver');
    const settings = await fetchEmailSettings(['zapier_webhook_deliver', ...templateFields]);

    if (!settings?.zapier_webhook_deliver) {
      throw new Error('Zapier delivery webhook URL not configured');
    }

    const eventId = crypto.randomUUID();
    const companyName = getCompanyName(gallery);
    
    const subjectField = templateFields[0];
    const bodyField = templateFields[1];
    
    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_delivered',
      gallery_name: gallery.name,
      gallery_address: gallery.address || '',
      package_target_count: gallery.package_target_count,
      selected_count: selectedCount,
      staging_count: stagingCount,
      client_emails: client_emails,
      client_names: clientNames,
      client_anrede: clientAnrede,
      download_link: download_link,
      salutation: gallery.salutation_type,
      company_name: companyName,
      email_subject: (settings as any)?.[subjectField] || '',
      email_body: (settings as any)?.[bodyField] || '',
    };

    console.log('Sending delivery webhook payload:', payload);

    // Send to Zapier
    const webhookResponse = await fetch(settings.zapier_webhook_deliver, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Log webhook attempt
    await logWebhookAttempt(
      gallery_id,
      'deliver',
      webhookResponse.ok ? 'success' : 'failed',
      { status: webhookResponse.status, event_id: eventId }
    );

    console.log('Delivery webhook response status:', webhookResponse.status);

    return new Response(
      JSON.stringify({ success: true, event_id: eventId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in webhook-deliver function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
