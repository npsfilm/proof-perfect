import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Upload, Save, Trash2 } from 'lucide-react';
import { useClientWatermark, useUpdateWatermarkSettings, useDeleteWatermark } from '@/hooks/useClientWatermark';
import { WatermarkUploader } from './WatermarkUploader';

interface WatermarkEditorProps {
  previewImageUrl?: string;
}

export function WatermarkEditor({ previewImageUrl }: WatermarkEditorProps) {
  const { data: watermark, isLoading } = useClientWatermark();
  const updateSettings = useUpdateWatermarkSettings();
  const deleteWatermark = useDeleteWatermark();
  
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 90 });
  const [size, setSize] = useState(15);
  const [opacity, setOpacity] = useState(70);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with database values
  useEffect(() => {
    if (watermark) {
      setPosition({ x: watermark.position_x, y: watermark.position_y });
      setSize(watermark.size_percent);
      setOpacity(watermark.opacity);
    }
  }, [watermark]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!watermark) return;
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !watermark) return;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      position_x: position.x,
      position_y: position.y,
      size_percent: size,
      opacity: opacity,
    });
  };

  const handleDelete = async () => {
    if (confirm('Möchten Sie Ihr Wasserzeichen wirklich entfernen?')) {
      await deleteWatermark.mutateAsync();
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">Lädt...</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="space-y-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle>Wasserzeichen-Editor</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Positionieren Sie Ihr Logo und passen Sie die Größe an
              </p>
            </div>
            {!watermark ? (
              <Button onClick={() => setUploaderOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Logo hochladen
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setUploaderOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Ändern
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Controls in Header */}
          {watermark && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Position X: {Math.round(position.x)}%</Label>
                  <Slider
                    value={[position.x]}
                    onValueChange={([value]) => setPosition(prev => ({ ...prev, x: value }))}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Position Y: {Math.round(position.y)}%</Label>
                  <Slider
                    value={[position.y]}
                    onValueChange={([value]) => setPosition(prev => ({ ...prev, y: value }))}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Größe: {size}%</Label>
                  <Slider
                    value={[size]}
                    onValueChange={([value]) => setSize(value)}
                    min={5}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Transparenz: {opacity}%</Label>
                  <Slider
                    value={[opacity]}
                    onValueChange={([value]) => setOpacity(value)}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSave}
                disabled={updateSettings.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? 'Speichert...' : 'Einstellungen speichern'}
              </Button>
            </div>
          )}
        </CardHeader>

        {watermark && (
          <CardContent>
            {/* Preview Area */}
            <div
              ref={containerRef}
              className="relative bg-muted/50 rounded-2xl overflow-hidden cursor-crosshair select-none"
              style={{ aspectRatio: '16/9', minHeight: '300px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Background Image */}
              {previewImageUrl ? (
                <img
                  src={previewImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Vorschaubild wird geladen...
                </div>
              )}

              {/* Watermark Overlay */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${size}%`,
                  opacity: opacity / 100,
                }}
              >
                <img
                  src={watermark.storage_url}
                  alt="Watermark"
                  className="w-full h-auto"
                  draggable={false}
                />
              </div>

              {/* Drag Hint */}
              {isDragging && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <p className="text-sm font-medium">Ziehen Sie, um zu positionieren</p>
                </div>
              )}
            </div>
          </CardContent>
        )}

        {!watermark && (
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">
                Laden Sie zuerst ein Logo hoch, um es zu positionieren
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <WatermarkUploader open={uploaderOpen} onOpenChange={setUploaderOpen} />
    </>
  );
}
