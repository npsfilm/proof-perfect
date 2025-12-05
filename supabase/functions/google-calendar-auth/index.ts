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

// Build redirect URI dynamically
const getRedirectUri = () => {
  return `${SUPABASE_URL}/functions/v1/google-calendar-auth/callback`;
};

// Build frontend URL for redirects
const getFrontendUrl = () => {
  // This should be configured as an environment variable in production
  return Deno.env.get('FRONTEND_URL') || 'https://preview--immoonpoint.lovable.app';
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Step 1: Initiate OAuth flow
    if (!path.includes('/callback')) {
      console.log('Starting Google Calendar OAuth flow');
      
      if (!GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID not configured');
      }

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', getRedirectUri());
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar');
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      // Store state for security (in production, use a proper state parameter)
      const state = crypto.randomUUID();
      authUrl.searchParams.set('state', state);

      console.log('Redirecting to Google OAuth:', authUrl.toString());

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

    if (error) {
      console.error('OAuth error:', error);
      return Response.redirect(`${getFrontendUrl()}/admin/calendar?error=${error}`, 302);
    }

    if (!code) {
      throw new Error('No authorization code received');
    }

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

    console.log('Token exchange successful');

    // Get user from authorization header (if present)
    // For this flow, we'll need to get the user ID from the session
    // Since this is a redirect flow, we need to handle this differently
    
    // For now, we'll store the tokens and let the frontend handle user association
    // In a production app, you'd want to use a state parameter with the user ID
    
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Store tokens - we'll need to update this with the actual user ID
    // For now, redirect with success and handle token storage in frontend
    const redirectUrl = new URL(`${getFrontendUrl()}/admin/calendar`);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('access_token', tokenData.access_token);
    redirectUrl.searchParams.set('refresh_token', tokenData.refresh_token || '');
    redirectUrl.searchParams.set('expires_at', expiresAt);

    console.log('Redirecting to frontend with tokens');

    return Response.redirect(redirectUrl.toString(), 302);

  } catch (error: unknown) {
    console.error('Error in google-calendar-auth:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return Response.redirect(
      `${getFrontendUrl()}/admin/calendar?error=${encodeURIComponent(errorMessage)}`,
      302
    );
  }
});
