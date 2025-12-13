import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Pencil, Trash2, Star, GripVertical } from 'lucide-react';
import { useAllBookingPackages } from '@/hooks/useBookingPackages';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PACKAGE_TYPES = ['Foto', 'Drohne', 'Kombi'] as const;

interface PackageFormData {
  package_type: string;
  name: string;
  description: string;
  photo_count: number;
  duration_minutes: number;
  price_cents: number;
  features: string[];
  requires_additional_info: boolean;
  is_active: boolean;
  is_popular: boolean;
  sort_order: number;
}

function useCreateBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: PackageFormData) => {
      const { data, error } = await supabase
        .from('booking_packages')
        .insert({
          ...pkg,
          features: pkg.features,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
      queryClient.invalidateQueries({ queryKey: ['booking-packages-all'] });
      toast.success('Paket erstellt');
    },
  });
}

function useUpdateBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: PackageFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('booking_packages')
        .update({
          ...updates,
          features: updates.features,
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
      queryClient.invalidateQueries({ queryKey: ['booking-packages-all'] });
      toast.success('Paket aktualisiert');
    },
  });
}

function useDeleteBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-packages'] });
      queryClient.invalidateQueries({ queryKey: ['booking-packages-all'] });
      toast.success('Paket gelöscht');
    },
  });
}

const defaultFormData: PackageFormData = {
  package_type: 'Foto',
  name: '',
  description: '',
  photo_count: 10,
  duration_minutes: 30,
  price_cents: 19900,
  features: [],
  requires_additional_info: false,
  is_active: true,
  is_popular: false,
  sort_order: 0,
};

export function PackagesTab() {
  const { data: packages, isLoading } = useAllBookingPackages();
  const createPackage = useCreateBookingPackage();
  const updatePackage = useUpdateBookingPackage();
  const deletePackage = useDeleteBookingPackage();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);
  const [featuresText, setFeaturesText] = useState('');

  const resetForm = () => {
    setFormData(defaultFormData);
    setFeaturesText('');
    setEditingPackage(null);
  };

  const handleOpenDialog = (pkg?: any) => {
    if (pkg) {
      setEditingPackage(pkg);
      const features = Array.isArray(pkg.features) ? pkg.features : [];
      setFormData({
        package_type: pkg.package_type,
        name: pkg.name || '',
        description: pkg.description || '',
        photo_count: pkg.photo_count,
        duration_minutes: pkg.duration_minutes,
        price_cents: pkg.price_cents,
        features,
        requires_additional_info: pkg.requires_additional_info ?? false,
        is_active: pkg.is_active ?? true,
        is_popular: pkg.is_popular ?? false,
        sort_order: pkg.sort_order ?? 0,
      });
      setFeaturesText(features.join('\n'));
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const features = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const data = { ...formData, features };

    if (editingPackage) {
      await updatePackage.mutateAsync({ id: editingPackage.id, ...data });
    } else {
      await createPackage.mutateAsync(data);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie dieses Paket wirklich löschen?')) {
      await deletePackage.mutateAsync(id);
    }
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  };

  const getPackageTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Foto':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Drohne':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Kombi':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedPackages = PACKAGE_TYPES.map((type) => ({
    type,
    packages: packages?.filter((p) => p.package_type === type) || [],
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shooting-Pakete</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neues Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Paket bearbeiten' : 'Neues Paket'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pakettyp</Label>
                  <Select
                    value={formData.package_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, package_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PACKAGE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Paketname</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Home S"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Input
                  id="description"
                  placeholder="Kurze Beschreibung"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="photo_count">Anzahl Fotos</Label>
                  <Input
                    id="photo_count"
                    type="number"
                    value={formData.photo_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        photo_count: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Dauer (Minuten)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_minutes: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preis (in Euro)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={(formData.price_cents / 100).toFixed(2)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_cents: Math.round(
                          parseFloat(e.target.value || '0') * 100
                        ),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Reihenfolge</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Features (eine pro Zeile)</Label>
                <Textarea
                  id="features"
                  placeholder="Professionelle Innenaufnahmen&#10;Optimale Bildbearbeitung&#10;48h Lieferung"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_popular: checked })
                    }
                  />
                  <Label htmlFor="is_popular" className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Beliebt
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">Aktiv</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_additional_info"
                  checked={formData.requires_additional_info}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requires_additional_info: checked })
                  }
                />
                <Label htmlFor="requires_additional_info">
                  Zusatzinfos erforderlich
                </Label>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={createPackage.isPending || updatePackage.isPending}
              >
                {editingPackage ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedPackages.map(({ type, packages: typePackages }) => (
          <div key={type}>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Badge className={getPackageTypeBadgeColor(type)}>{type}</Badge>
              <span className="text-muted-foreground text-sm">
                ({typePackages.length} Pakete)
              </span>
            </h3>
            <div className="space-y-2">
              {typePackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {pkg.name || `${pkg.photo_count} Fotos`}
                      </span>
                      {pkg.is_popular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          Beliebt
                        </Badge>
                      )}
                      {!pkg.is_active && (
                        <Badge variant="outline" className="text-xs">
                          Inaktiv
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {pkg.photo_count} Fotos · {pkg.duration_minutes} Min. · {formatPrice(pkg.price_cents)}
                    </div>
                    {pkg.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {pkg.description}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(pkg)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(pkg.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {typePackages.length === 0 && (
                <div className="text-center text-muted-foreground py-6 border rounded-lg border-dashed">
                  Keine {type}-Pakete vorhanden
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
