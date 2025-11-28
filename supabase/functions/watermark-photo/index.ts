import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";
import { createSupabaseClient } from "../_shared/supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photoPath } = await req.json();
    
    if (!photoPath) {
      return new Response(
        JSON.stringify({ error: 'Photo path is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[watermark-photo] Processing:', photoPath);
    
    const supabase = createSupabaseClient();

    // Download the original image from storage
    const { data: imageData, error: downloadError } = await supabase
      .storage
      .from('proofs')
      .download(photoPath);

    if (downloadError) {
      console.error('[watermark-photo] Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download the watermark logo from storage
    const { data: watermarkData, error: watermarkError } = await supabase
      .storage
      .from('proofs')
      .download('_assets/immoonpoint-watermark.png');

    if (watermarkError) {
      console.error('[watermark-photo] Watermark download error:', watermarkError);
      return new Response(
        JSON.stringify({ error: 'Failed to download watermark' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert blobs to array buffers
    const imageBuffer = await imageData.arrayBuffer();
    const watermarkBuffer = await watermarkData.arrayBuffer();

    // Decode images using imagescript
    const baseImage = await Image.decode(new Uint8Array(imageBuffer));
    const watermarkImage = await Image.decode(new Uint8Array(watermarkBuffer));

    // Calculate watermark dimensions (maintain aspect ratio, max 20% of base image width)
    const maxWatermarkWidth = Math.floor(baseImage.width * 0.15);
    const watermarkScale = maxWatermarkWidth / watermarkImage.width;
    const scaledWatermarkWidth = Math.floor(watermarkImage.width * watermarkScale);
    const scaledWatermarkHeight = Math.floor(watermarkImage.height * watermarkScale);

    // Resize watermark
    const resizedWatermark = watermarkImage.resize(scaledWatermarkWidth, scaledWatermarkHeight);

    // Apply opacity to watermark (70%)
    for (let i = 0; i < resizedWatermark.bitmap.length; i += 4) {
      resizedWatermark.bitmap[i + 3] = Math.floor(resizedWatermark.bitmap[i + 3] * 0.7);
    }

    // Calculate position (bottom center, with 3% padding from bottom)
    const x = Math.floor((baseImage.width - scaledWatermarkWidth) / 2);
    const y = Math.floor(baseImage.height - scaledWatermarkHeight - (baseImage.height * 0.03));

    // Composite watermark onto base image
    baseImage.composite(resizedWatermark, x, y);

    // Encode as JPEG
    const watermarkedImageBytes = await baseImage.encodeJPEG(85);

    console.log('[watermark-photo] Success');

    // Convert to ArrayBuffer with proper type
    const buffer = new Uint8Array(watermarkedImageBytes).buffer as ArrayBuffer;
    
    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    console.error('[watermark-photo] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
