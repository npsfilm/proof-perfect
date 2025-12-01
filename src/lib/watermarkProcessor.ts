/**
 * Client-side watermark processing using Canvas API
 * Maintains original image quality by using maximum quality settings
 */

export interface WatermarkSettings {
  position_x: number; // 0-100
  position_y: number; // 0-100
  size_percent: number; // 5-50
  opacity: number; // 10-100
}

/**
 * Load an image from a blob or URL
 */
function loadImage(source: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    if (source instanceof Blob) {
      img.src = URL.createObjectURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Apply watermark to an image blob
 * Returns a new blob with watermark applied at maximum quality
 */
export async function applyWatermark(
  imageBlob: Blob,
  watermarkUrl: string,
  settings: WatermarkSettings
): Promise<Blob> {
  // Load both images
  const [originalImage, watermarkImage] = await Promise.all([
    loadImage(imageBlob),
    loadImage(watermarkUrl)
  ]);

  // Create canvas at original image size
  const canvas = document.createElement('canvas');
  canvas.width = originalImage.naturalWidth;
  canvas.height = originalImage.naturalHeight;
  
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get canvas context');

  // Draw original image
  ctx.drawImage(originalImage, 0, 0);

  // Calculate watermark dimensions
  const watermarkWidth = (canvas.width * settings.size_percent) / 100;
  const watermarkHeight = (watermarkImage.naturalHeight / watermarkImage.naturalWidth) * watermarkWidth;

  // Calculate position (convert percentage to pixels)
  const x = (canvas.width * settings.position_x) / 100 - watermarkWidth / 2;
  const y = (canvas.height * settings.position_y) / 100 - watermarkHeight / 2;

  // Apply opacity and draw watermark
  ctx.globalAlpha = settings.opacity / 100;
  ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);

  // Convert to blob at maximum quality
  return new Promise((resolve, reject) => {
    // Detect original format from blob type
    const mimeType = imageBlob.type;
    const quality = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? 1.0 : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Process multiple images with watermark
 * Returns array of { filename, blob } objects
 */
export async function applyWatermarkBatch(
  images: { filename: string; blob: Blob }[],
  watermarkUrl: string,
  settings: WatermarkSettings,
  onProgress?: (current: number, total: number) => void
): Promise<{ filename: string; blob: Blob }[]> {
  const results: { filename: string; blob: Blob }[] = [];

  for (let i = 0; i < images.length; i++) {
    const { filename, blob } = images[i];
    
    try {
      const watermarkedBlob = await applyWatermark(blob, watermarkUrl, settings);
      results.push({ filename, blob: watermarkedBlob });
      
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    } catch (error) {
      console.error(`Failed to watermark ${filename}:`, error);
      // Use original image if watermarking fails
      results.push({ filename, blob });
    }
  }

  return results;
}
