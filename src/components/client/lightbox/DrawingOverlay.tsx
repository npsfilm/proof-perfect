import { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';

interface DrawingOverlayProps {
  drawingData: object;
  containerWidth: number;
  containerHeight: number;
  zoom?: number;
  panX?: number;
  panY?: number;
}

export function DrawingOverlay({
  drawingData,
  containerWidth,
  containerHeight,
  zoom = 1,
  panX = 0,
  panY = 0,
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

    // Create canvas for display
    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerWidth,
      height: containerHeight,
      selection: false,
      renderOnAddRemove: true,
    });

    fabricRef.current = canvas;

    // Load the saved drawing data
    const jsonData = drawingData as { version?: string; objects?: object[]; originalWidth?: number; originalHeight?: number };
    
    if (jsonData && jsonData.objects) {
      // Calculate scale factor if original dimensions are stored
      const originalWidth = jsonData.originalWidth || containerWidth;
      const originalHeight = jsonData.originalHeight || containerHeight;
      const scaleX = containerWidth / originalWidth;
      const scaleY = containerHeight / originalHeight;
      const scale = Math.min(scaleX, scaleY);

      canvas.loadFromJSON(jsonData, () => {
        // Scale all objects if dimensions changed
        if (scale !== 1) {
          canvas.getObjects().forEach((obj) => {
            obj.scaleX = (obj.scaleX || 1) * scale;
            obj.scaleY = (obj.scaleY || 1) * scale;
            obj.left = (obj.left || 0) * scale;
            obj.top = (obj.top || 0) * scale;
            obj.setCoords();
          });
        }
        
        // Make all objects non-interactive
        canvas.getObjects().forEach((obj) => {
          obj.selectable = false;
          obj.evented = false;
          obj.hasControls = false;
          obj.hasBorders = false;
          obj.lockMovementX = true;
          obj.lockMovementY = true;
        });
        
        canvas.renderAll();
      });
    }

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
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: containerWidth,
          height: containerHeight,
          transform: `scale(${zoom}) translate(${panX / zoom}px, ${panY / zoom}px)`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
}
