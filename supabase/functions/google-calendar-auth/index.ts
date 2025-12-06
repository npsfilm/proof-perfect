import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const getRedirectUri = () => {
  return `${SUPABASE_URL}/functions/v1/google-calendar-auth/callback`;
};

const getFrontendUrl = () => {
  const url = Deno.env.get('FRONTEND_URL') || 'https://preview--immoonpoint.lovable.app';
  // Remove trailing slash to prevent double slashes in redirects
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Step 1: Initiate OAuth flow - requires user_id in query param
    if (!path.includes('/callback')) {
      console.log('Starting Google Calendar OAuth flow');
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID not configured');
      }

      // Get user_id from query parameter (passed from frontend)
      const userId = url.searchParams.get('user_id');
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'user_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Encode user_id in state parameter for security
      const stateData = {
        user_id: userId,
        nonce: crypto.randomUUID(),
      };
      const state = btoa(JSON.stringify(stateData));

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', getRedirectUri());
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      authUrl.searchParams.set('state', state);

      console.log('Redirecting to Google OAuth for user:', userId);

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl.toString(),
        },
      });
    }

    // Step 2: Handle callback
    console.log('Handling OAuth callback');
    
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const state = url.searchParams.get('state');

    if (error) {
      console.error('OAuth error:', error);
      return Response.redirect(`${getFrontendUrl()}/admin/calendar?error=${error}`, 302);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

    if (!state) {
      throw new Error('No state parameter received');
    }

    // Decode and validate state parameter
    let stateData: { user_id: string; nonce: string };
    try {
      stateData = JSON.parse(atob(state));
      if (!stateData.user_id) {
        throw new Error('Invalid state: missing user_id');
      }
    } catch (e) {
      console.error('Failed to decode state:', e);
      throw new Error('Invalid state parameter');
    }

    const userId = stateData.user_id;
    console.log('Processing OAuth callback for user:', userId);

    if (!GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_SECRET not configured');
    }

    // Exchange code for tokens
    console.log('Exchanging code for tokens');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: getRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      throw new Error(tokenData.error_description || 'Failed to exchange code for tokens');
    }

    console.log('Token exchange successful, storing tokens server-side');

    // Store tokens directly in database using service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from('google_calendar_tokens')
      .upsert({
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || '',
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      throw new Error('Failed to store tokens');
    }

    console.log('Tokens stored successfully, redirecting to frontend');

    // Redirect with only success indicator - no tokens in URL
    return Response.redirect(`${getFrontendUrl()}/admin/calendar?google_auth=success`, 302);

  } catch (error: unknown) {
    console.error('Error in google-calendar-auth:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return Response.redirect(
      `${getFrontendUrl()}/admin/calendar?error=${encodeURIComponent(errorMessage)}`,
      302
    );
  }
});
