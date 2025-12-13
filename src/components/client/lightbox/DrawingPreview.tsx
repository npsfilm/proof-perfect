import { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DrawingPreviewProps {
  drawingData: object;
  className?: string;
}

export function DrawingPreview({ drawingData, className }: DrawingPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !drawingData) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = new FabricCanvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'transparent',
      selection: false,
      interactive: false,
    });

    canvas.loadFromJSON(drawingData).then(() => {
      // Scale to fit container
      const objects = canvas.getObjects();
      if (objects.length > 0) {
        // Calculate bounding box of all objects
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        objects.forEach(obj => {
          const bounds = obj.getBoundingRect();
          minX = Math.min(minX, bounds.left);
          minY = Math.min(minY, bounds.top);
          maxX = Math.max(maxX, bounds.left + bounds.width);
          maxY = Math.max(maxY, bounds.top + bounds.height);
        });

        const drawingWidth = maxX - minX;
        const drawingHeight = maxY - minY;
        
        if (drawingWidth > 0 && drawingHeight > 0) {
          const scaleX = (width - 20) / drawingWidth;
          const scaleY = (height - 20) / drawingHeight;
          const scale = Math.min(scaleX, scaleY, 1);

          objects.forEach(obj => {
            obj.scaleX = (obj.scaleX || 1) * scale;
            obj.scaleY = (obj.scaleY || 1) * scale;
            obj.left = ((obj.left || 0) - minX) * scale + 10;
            obj.top = ((obj.top || 0) - minY) * scale + 10;
            obj.setCoords();
          });
        }
      }
      
      canvas.renderAll();
      setIsLoaded(true);
    });

    return () => {
      canvas.dispose();
    };
  }, [drawingData]);

  if (!drawingData || Object.keys(drawingData).length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative bg-muted/50 rounded overflow-hidden ${className || 'w-full h-24'}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            <Pencil className="h-4 w-4" />
          </div>
        </div>
      )}
      
      <Badge 
        variant="secondary" 
        className="absolute top-1 right-1 text-[9px] px-1 py-0"
      >
        <Pencil className="h-2 w-2 mr-0.5" />
        Zeichnung
      </Badge>
    </div>
  );
}