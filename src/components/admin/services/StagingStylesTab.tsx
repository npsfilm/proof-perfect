import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Upload, ImageIcon, Loader2 } from 'lucide-react';
import {
  useStagingStyles,
  useCreateStagingStyle,
  useUpdateStagingStyle,
  useDeleteStagingStyle,
  StagingStyle,
} from '@/hooks/useStagingStyles';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function StagingStylesTab() {
  const { data: styles, isLoading } = useStagingStyles();
  const createStyle = useCreateStagingStyle();
  const updateStyle = useUpdateStagingStyle();
  const deleteStyle = useDeleteStagingStyle();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStyle, setEditingStyle] = useState<StagingStyle | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color_class: 'bg-primary',
    thumbnail_url: '',
    sort_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      color_class: 'bg-primary',
      thumbnail_url: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingStyle(null);
  };

  const handleOpenDialog = (style?: StagingStyle) => {
    if (style) {
      setEditingStyle(style);
      setFormData({
        name: style.name,
        slug: style.slug,
        color_class: style.color_class || 'bg-primary',
        thumbnail_url: style.thumbnail_url || '',
        sort_order: style.sort_order || 0,
        is_active: style.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!slug) {
      toast.error('Bitte zuerst einen Namen eingeben');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `staging-styles/${slug}.${fileExt}`;

      // Upload to branding bucket
      const { error: uploadError } = await supabase.storage
        .from('branding')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('branding')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, thumbnail_url: urlData.publicUrl }));
      toast.success('Bild hochgeladen');
    } catch (error: any) {
      toast.error('Fehler beim Hochladen: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (editingStyle) {
      await updateStyle.mutateAsync({ id: editingStyle.id, ...formData, slug });
    } else {
      await createStyle.mutateAsync({ ...formData, slug });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Stil wirklich löschen?')) {
      await deleteStyle.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Staging-Stile</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Stil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingStyle ? 'Stil bearbeiten' : 'Neuer Stil'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Modern"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="wird automatisch generiert"
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label>Vorschaubild</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {formData.thumbnail_url ? (
                  <div className="relative group">
                    <img
                      src={formData.thumbnail_url}
                      alt="Vorschau"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Bild ändern'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || !formData.name}
                    className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData.name ? 'Bild hochladen' : 'Erst Namen eingeben'}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Reihenfolge</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktiv</Label>
              </div>
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={createStyle.isPending || updateStyle.isPending || !formData.name}
              >
                {editingStyle ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {styles?.map((style) => (
            <div
              key={style.id}
              className={`relative group rounded-lg border overflow-hidden ${!style.is_active ? 'opacity-50' : ''}`}
            >
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move z-10">
                <GripVertical className="h-4 w-4 text-white drop-shadow-md" />
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => handleOpenDialog(style)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button variant="secondary" size="icon" className="h-6 w-6" onClick={() => handleDelete(style.id)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
              
              {style.thumbnail_url ? (
                <img
                  src={style.thumbnail_url}
                  alt={style.name}
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="p-2 bg-background">
                <p className="text-sm font-medium text-center truncate">{style.name}</p>
                {!style.is_active && (
                  <p className="text-xs text-muted-foreground text-center">Inaktiv</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
