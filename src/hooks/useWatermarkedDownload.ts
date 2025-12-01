import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { applyWatermark, applyWatermarkBatch } from '@/lib/watermarkProcessor';
import { useClientWatermark } from './useClientWatermark';
import { DeliveryFile } from '@/types/database';
import JSZip from 'jszip';

/**
 * Hook for downloading delivery files with optional watermark
 */
export function useWatermarkedDownload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { data: watermark } = useClientWatermark();

  /**
   * Download a single file with watermark
   */
  const downloadSingleFile = async (file: DeliveryFile, applyWatermarkFlag: boolean = false) => {
    try {
      // Get signed URL
      const { data, error } = await supabase.storage
        .from('deliveries')
        .createSignedUrl(file.storage_url, 3600);

      if (error) throw error;

      // Fetch the file
      const response = await fetch(data.signedUrl);
      const blob = await response.blob();

      let finalBlob = blob;

      // Apply watermark if requested and available
      if (applyWatermarkFlag && watermark) {
        try {
          finalBlob = await applyWatermark(blob, watermark.storage_url, {
            position_x: watermark.position_x,
            position_y: watermark.position_y,
            size_percent: watermark.size_percent,
            opacity: watermark.opacity,
          });
        } catch (error) {
          console.error('Watermarking failed, using original:', error);
          toast({
            title: 'Wasserzeichen-Fehler',
            description: 'Original-Datei wird heruntergeladen',
            variant: 'destructive',
          });
        }
      }

      // Trigger download
      const url = window.URL.createObjectURL(finalBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  };

  /**
   * Download multiple files individually with watermark
   */
  const downloadMultipleFiles = async (files: DeliveryFile[], applyWatermarkFlag: boolean = false) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    try {
      for (let i = 0; i < files.length; i++) {
        await downloadSingleFile(files[i], applyWatermarkFlag);
        setProgress({ current: i + 1, total: files.length });
        
        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast({
        title: 'Downloads abgeschlossen',
        description: `${files.length} Datei${files.length !== 1 ? 'en' : ''} heruntergeladen${
          applyWatermarkFlag ? ' (mit Wasserzeichen)' : ''
        }`,
      });
    } catch (error) {
      toast({
        title: 'Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  /**
   * Download files as ZIP with watermark
   */
  const downloadAsZip = async (
    files: DeliveryFile[],
    zipFilename: string,
    applyWatermarkFlag: boolean = false
  ) => {
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    try {
      const zip = new JSZip();

      // Fetch all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Get signed URL
        const { data, error } = await supabase.storage
          .from('deliveries')
          .createSignedUrl(file.storage_url, 3600);

        if (error) throw error;

        // Fetch the file
        const response = await fetch(data.signedUrl);
        const blob = await response.blob();

        let finalBlob = blob;

        // Apply watermark if requested and available
        if (applyWatermarkFlag && watermark) {
          try {
            finalBlob = await applyWatermark(blob, watermark.storage_url, {
              position_x: watermark.position_x,
              position_y: watermark.position_y,
              size_percent: watermark.size_percent,
              opacity: watermark.opacity,
            });
          } catch (error) {
            console.error(`Watermarking failed for ${file.filename}, using original:`, error);
          }
        }

        // Add to zip
        zip.file(file.filename, finalBlob);
        setProgress({ current: i + 1, total: files.length });
      }

      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // Trigger download
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'ZIP-Download abgeschlossen',
        description: `${files.length} Datei${files.length !== 1 ? 'en' : ''} als ZIP heruntergeladen${
          applyWatermarkFlag ? ' (mit Wasserzeichen)' : ''
        }`,
      });
    } catch (error) {
      console.error('ZIP creation failed:', error);
      toast({
        title: 'ZIP-Download fehlgeschlagen',
        description: error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    downloadSingleFile,
    downloadMultipleFiles,
    downloadAsZip,
    isProcessing,
    progress,
    hasWatermark: !!watermark,
  };
}
