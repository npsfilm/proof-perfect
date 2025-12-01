import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import JSZip from 'https://esm.sh/jszip@3.10.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const { gallery_id, folder_type } = await req.json();

    if (!gallery_id) {
      return new Response(
        JSON.stringify({ error: 'gallery_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify user has access to this gallery
    const { data: accessData, error: accessError } = await supabase
      .from('gallery_access')
      .select('id')
      .eq('gallery_id', gallery_id)
      .eq('user_id', user.id)
      .single();

    if (accessError || !accessData) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this gallery' }),
        { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Fetch gallery info
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('name, slug')
      .eq('id', gallery_id)
      .single();

    if (galleryError || !gallery) {
      return new Response(
        JSON.stringify({ error: 'Gallery not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Build query for delivery files
    let query = supabase
      .from('delivery_files')
      .select('*')
      .eq('gallery_id', gallery_id);

    if (folder_type) {
      query = query.eq('folder_type', folder_type);
    }

    const { data: files, error: filesError } = await query;

    if (filesError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch files' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create a service role client for storage access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create ZIP archive
    const zip = new JSZip();

    // Download and add each file to the ZIP
    for (const file of files) {
      try {
        // Download file from storage
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from('deliveries')
          .download(file.storage_url);

        if (downloadError || !fileData) {
          console.error(`Failed to download ${file.filename}:`, downloadError);
          continue;
        }

        // Add file to ZIP with folder structure
        const folderName = folder_type || file.folder_type;
        zip.file(`${folderName}/${file.filename}`, fileData);
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    // Generate filename
    const zipFilename = folder_type 
      ? `${gallery.slug}_${folder_type}.zip`
      : `${gallery.slug}_alle_dateien.zip`;

    // Return ZIP file
    return new Response(zipBlob, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
      },
    });

  } catch (error) {
    console.error('Error in download-zip function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
