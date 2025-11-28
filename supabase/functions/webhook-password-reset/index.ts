import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
  reset_link: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, reset_link }: PasswordResetRequest = await req.json();

    console.log('[webhook-password-reset] Processing password reset webhook for:', email);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    // Fetch client data if available
    const { data: client } = await supabase
      .from('clients')
      .select('vorname, nachname, anrede, ansprache')
      .eq('email', email)
      .single();

    // Prepare webhook payload
    const webhookPayload = {
      event_type: 'password_reset_requested',
      timestamp: new Date().toISOString(),
      email: email,
      reset_link: reset_link,
      user_data: {
        profile_id: profile?.id || null,
        first_name: client?.vorname || null,
        last_name: client?.nachname || null,
        salutation: client?.anrede || null,
        address_form: client?.ansprache || null,
      }
    };

    console.log('[webhook-password-reset] Sending to Zapier:', webhookPayload);

    // Send to Zapier webhook
    const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/24798197/uk1a43v/';
    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!zapierResponse.ok) {
      console.error('[webhook-password-reset] Zapier webhook failed:', zapierResponse.status);
      throw new Error(`Zapier webhook failed with status: ${zapierResponse.status}`);
    }

    console.log('[webhook-password-reset] Webhook sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password reset webhook sent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('[webhook-password-reset] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
