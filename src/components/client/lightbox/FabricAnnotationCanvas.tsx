import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Circle, Rect, IText, FabricObject } from 'fabric';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Pencil, Circle as CircleIcon, Square, Type, 
  Undo, Trash2, Save, X, MousePointer, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FabricAnnotationCanvasProps {
  imageUrl: string;
  imageSize: { width: number; height: number };
  existingDrawing?: object | null;
  onSave: (drawingData: object) => Promise<void>;
  onCancel: () => void;
}

type Tool = 'select' | 'draw' | 'circle' | 'rect' | 'line' | 'text';

const COLORS = [
  { value: '#ef4444', name: 'Rot' },
  { value: '#f59e0b', name: 'Orange' },
  { value: '#22c55e', name: 'Grün' },
  { value: '#3b82f6', name: 'Blau' },
  { value: '#8b5cf6', name: 'Violett' },
  { value: '#000000', name: 'Schwarz' },
  { value: '#ffffff', name: 'Weiß' },
];

export function FabricAnnotationCanvas({
  imageUrl,
  imageSize,
  existingDrawing,
  onSave,
  onCancel,
}: FabricAnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('draw');
  const [activeColor, setActiveColor] = useState('#ef4444');
  const [brushWidth, setBrushWidth] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Calculate canvas size to fit container while maintaining aspect ratio
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth - 32; // padding
      const containerHeight = container.clientHeight - 32;
      
      const imageAspect = imageSize.width / imageSize.height;
      const containerAspect = containerWidth / containerHeight;

      let width: number, height: number;
      if (imageAspect > containerAspect) {
        width = Math.min(containerWidth, imageSize.width);
        height = width / imageAspect;
      } else {
        height = Math.min(containerHeight, imageSize.height);
        width = height * imageAspect;
      }

      setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [imageSize]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || canvasSize.width === 0) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasSize.width,
      height: canvasSize.height,
      isDrawingMode: true,
      backgroundColor: 'transparent',
      selection: true,
    });

    // Configure brush
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = activeColor;
    canvas.freeDrawingBrush.width = brushWidth;

    // Load existing drawing if present
    if (existingDrawing && Object.keys(existingDrawing).length > 0) {
      canvas.loadFromJSON(existingDrawing).then(() => {
        canvas.renderAll();
      });
    }

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [canvasSize]);

  // Update brush settings when they change
  useEffect(() => {
    if (!fabricCanvas) return;
    
    fabricCanvas.isDrawingMode = activeTool === 'draw';
    
    if (fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushWidth;
    }
  }, [activeTool, activeColor, brushWidth, fabricCanvas]);

  const handleToolChange = useCallback((tool: Tool) => {
    if (!fabricCanvas) return;
    
    setActiveTool(tool);
    fabricCanvas.isDrawingMode = tool === 'draw';

    if (tool === 'select') {
      fabricCanvas.selection = true;
    } else if (tool === 'circle') {
      const circle = new Circle({
        left: canvasSize.width / 2 - 30,
        top: canvasSize.height / 2 - 30,
        radius: 30,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: brushWidth,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === 'rect') {
      const rect = new Rect({
        left: canvasSize.width / 2 - 40,
        top: canvasSize.height / 2 - 25,
        width: 80,
        height: 50,
        fill: 'transparent',
        stroke: activeColor,
        strokeWidth: brushWidth,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === 'line') {
      // Create an arrow-like line
      const line = new Rect({
        left: canvasSize.width / 2 - 50,
        top: canvasSize.height / 2,
        width: 100,
        height: brushWidth,
        fill: activeColor,
        stroke: activeColor,
        strokeWidth: 0,
        rx: brushWidth / 2,
        ry: brushWidth / 2,
      });
      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
    } else if (tool === 'text') {
      const text = new IText('Text hier...', {
        left: canvasSize.width / 2 - 40,
        top: canvasSize.height / 2 - 10,
        fill: activeColor,
        fontSize: 18,
        fontFamily: 'system-ui, sans-serif',
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
      text.enterEditing();
    }
    
    fabricCanvas.renderAll();
  }, [fabricCanvas, activeColor, brushWidth, canvasSize]);

  const handleColorChange = useCallback((color: string) => {
    setActiveColor(color);
    
    if (fabricCanvas) {
      if (fabricCanvas.freeDrawingBrush) {
        fabricCanvas.freeDrawingBrush.color = color;
      }
      
      // Update selected object color
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'i-text') {
          activeObject.set('fill', color);
        } else {
          activeObject.set('stroke', color);
        }
        fabricCanvas.renderAll();
      }
    }
  }, [fabricCanvas]);

  const handleUndo = useCallback(() => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  const handleClear = useCallback(() => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'transparent';
    fabricCanvas.renderAll();
  }, [fabricCanvas]);

  const handleSave = async () => {
    if (!fabricCanvas) return;
    
    setIsSaving(true);
    try {
      const json = fabricCanvas.toJSON();
      await onSave(json);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSelected = useCallback(() => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach(obj => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
    }
  }, [fabricCanvas]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Toolbar */}
      <div className="bg-background/95 backdrop-blur-sm p-3 flex flex-wrap items-center justify-between gap-3 border-b shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tools */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button 
              variant={activeTool === 'select' ? 'default' : 'ghost'} 
              size="icon" 
              className="h-8 w-8"
              onClick={() => handleToolChange('select')}
              title="Auswählen"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTool === 'draw' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToolChange('draw')}
              title="Freihand zeichnen"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTool === 'circle' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToolChange('circle')}
              title="Kreis"
            >
              <CircleIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTool === 'rect' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToolChange('rect')}
              title="Rechteck"
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTool === 'line' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToolChange('line')}
              title="Linie"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button 
              variant={activeTool === 'text' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => handleToolChange('text')}
              title="Text"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-border hidden sm:block" />
          
          {/* Colors */}
          <div className="flex items-center gap-1">
            {COLORS.map(({ value, name }) => (
              <button
                key={value}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                  activeColor === value 
                    ? 'border-primary ring-2 ring-primary/50 scale-110' 
                    : 'border-muted-foreground/30'
                )}
                style={{ backgroundColor: value }}
                onClick={() => handleColorChange(value)}
                title={name}
              />
            ))}
          </div>
          
          <div className="w-px h-6 bg-border hidden sm:block" />
          
          {/* Brush Width */}
          <div className="flex items-center gap-2 min-w-[100px]">
            <span className="text-xs text-muted-foreground">Stärke:</span>
            <Slider
              value={[brushWidth]}
              onValueChange={([value]) => setBrushWidth(value)}
              min={1}
              max={10}
              step={1}
              className="w-20"
            />
          </div>
          
          <div className="w-px h-6 bg-border hidden sm:block" />
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleUndo} title="Rückgängig">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleDeleteSelected} title="Auswahl löschen">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={handleClear}>
              Alles löschen
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>
      </div>
      
      {/* Canvas with Image Background */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden p-4"
      >
        <div 
          className="relative shadow-2xl rounded-lg overflow-hidden"
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          {/* Background Image */}
          <img 
            src={imageUrl} 
            alt="Hintergrund"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          
          {/* Fabric.js Canvas Overlay */}
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0"
          />
        </div>
      </div>
      
      {/* Help Text */}
      <div className="bg-background/80 backdrop-blur-sm p-2 text-center border-t shrink-0">
        <p className="text-xs text-muted-foreground">
          Zeichnen Sie direkt auf dem Bild, um Änderungswünsche zu markieren. Klicken Sie auf "Speichern" wenn fertig.
        </p>
      </div>
    </div>
  );
}