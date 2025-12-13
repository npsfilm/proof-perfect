import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface DrawingOverlayProps {
  drawingData: object;
  containerWidth: number;
  containerHeight: number;
}

export function DrawingOverlay({
  drawingData,
  containerWidth,
  containerHeight,
}: DrawingOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !drawingData || containerWidth === 0 || containerHeight === 0) return;

    // Clean up previous canvas
    if (fabricRef.current) {
      fabricRef.current.dispose();
      fabricRef.current = null;
    }

    // Extract original dimensions from saved data
    const jsonData = drawingData as { 
      version?: string; 
      objects?: object[]; 
      originalWidth?: number; 
      originalHeight?: number 
    };
    
    if (!jsonData || !jsonData.objects) return;

    // Use original dimensions or fall back to current container
    const originalWidth = jsonData.originalWidth || containerWidth;
    const originalHeight = jsonData.originalHeight || containerHeight;

    // Create canvas with CURRENT container dimensions (explicit pixel values)
    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      selection: false,
      renderOnAddRemove: true,
      backgroundColor: 'transparent',
    });

    fabricRef.current = canvas;

    // Calculate scale factor for repositioning objects
    const scaleX = containerWidth / originalWidth;
    const scaleY = containerHeight / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    // Load the saved drawing data
    canvas.loadFromJSON(jsonData).then(() => {
      // Scale all objects to fit current dimensions
      canvas.getObjects().forEach((obj) => {
        // Scale size
        obj.scaleX = (obj.scaleX || 1) * scale;
        obj.scaleY = (obj.scaleY || 1) * scale;
        
        // Scale position
        obj.left = (obj.left || 0) * scale;
        obj.top = (obj.top || 0) * scale;
        
        // Make non-interactive
        obj.selectable = false;
        obj.evented = false;
        obj.hasControls = false;
        obj.hasBorders = false;
        obj.lockMovementX = true;
        obj.lockMovementY = true;
        
        obj.setCoords();
      });
      
      canvas.renderAll();
    }).catch((error) => {
      console.error('Error loading drawing:', error);
    });

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [drawingData, containerWidth, containerHeight]);

  if (!drawingData || containerWidth === 0 || containerHeight === 0) {
    return null;
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
