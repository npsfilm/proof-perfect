import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCorsPreflightRequest } from "../_shared/cors.ts";
import { createSupabaseClient } from "../_shared/supabase-client.ts";
import { 
  fetchGalleryDetails, 
  fetchGalleryClients, 
  fetchPhotosCount,
  fetchEmailSettings,
  getEmailTemplateFields,
  extractClientInfo,
  getCompanyName 
} from "../_shared/gallery-helpers.ts";
import { logWebhookAttempt } from "../_shared/webhook-logger.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const sendWebhookSchema = z.object({
  gallery_id: z.string().uuid({ message: "Invalid gallery_id format" }),
  client_emails: z.array(z.string().email({ message: "Invalid email format" })).min(1, { message: "At least one client email required" }),
  new_passwords: z.record(z.string()).optional(),
  gallery_url: z.string().url({ message: "Invalid gallery_url format" })
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }

  try {
    // 1. Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[webhook-send] Missing Authorization header');
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
      console.error('[webhook-send] Invalid user session:', authError?.message);
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
      console.error('[webhook-send] User is not admin:', user.id);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }), 
        { status: 403, headers: corsHeaders }
      );
    }

    console.log('[webhook-send] Authenticated admin user:', user.id);

    // 4. Parse and validate input
    const body = await req.json();
    const validationResult = sendWebhookSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('[webhook-send] Input validation failed:', validationResult.error.flatten());
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.flatten().fieldErrors 
        }), 
        { status: 400, headers: corsHeaders }
      );
    }

    const { gallery_id, client_emails, new_passwords, gallery_url } = validationResult.data;

    console.log('Processing send webhook for gallery:', gallery_id);

    // Fetch all required data
    const gallery = await fetchGalleryDetails(gallery_id);
    const galleryClients = await fetchGalleryClients(gallery_id);
    const photosCount = await fetchPhotosCount(gallery_id);

    // Extract client information
    const { clientNames, clientAnrede } = extractClientInfo(galleryClients);

    // Get email templates
    const templateFields = getEmailTemplateFields(gallery.salutation_type, 'send');
    const settings = await fetchEmailSettings(['zapier_webhook_send', ...templateFields]);

    if (!settings?.zapier_webhook_send) {
      throw new Error('Zapier send webhook URL not configured');
    }

    const eventId = crypto.randomUUID();
    const companyName = getCompanyName(gallery);
    
    const subjectField = templateFields[0];
    const bodyField = templateFields[1];
    
    const payload = {
      event_id: eventId,
      timestamp: new Date().toISOString(),
      event_type: 'gallery_sent_to_client',
      gallery_name: gallery.name,
      gallery_address: gallery.address || '',
      gallery_url: gallery_url,
      package_target_count: gallery.package_target_count,
      photos_count: photosCount,
      client_emails: client_emails,
      client_names: clientNames,
      client_anrede: clientAnrede,
      new_passwords: new_passwords,
      salutation: gallery.salutation_type,
      company_name: companyName,
      email_subject: (settings as any)?.[subjectField] || '',
      email_body: (settings as any)?.[bodyField] || '',
    };

    console.log('Sending webhook payload:', payload);

    // Send to Zapier
    const webhookResponse = await fetch(settings.zapier_webhook_send, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Log webhook attempt
    await logWebhookAttempt(
      gallery_id,
      'send',
      webhookResponse.ok ? 'success' : 'failed',
      { status: webhookResponse.status, event_id: eventId }
    );

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
