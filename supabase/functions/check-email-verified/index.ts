import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('email_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Error checking email verification:", error);
      // Return generic error - don't reveal database issues
      return new Response(
        JSON.stringify({ verified: false, message: "Unable to verify at this time" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SECURITY FIX: Always return the same response structure regardless of email existence
    // This prevents email enumeration attacks
    // - If email doesn't exist: verified = false
    // - If email exists but not verified: verified = false  
    // - If email exists and verified: verified = true
    // Attackers cannot distinguish between "email doesn't exist" and "email not verified"
    
    const isVerified = profile?.email_verified ?? false;

    return new Response(
      JSON.stringify({ 
        verified: isVerified,
        // Generic message that doesn't reveal email existence
        message: isVerified 
          ? "Email verified" 
          : "Please check your email for verification link"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-email-verified:", error);
    return new Response(
      JSON.stringify({ verified: false, message: "Unable to verify at this time" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

Deno.serve(handler);
