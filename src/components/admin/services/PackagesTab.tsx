import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useBookingPackages } from '@/hooks/useBookingPackages';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PACKAGE_TYPES = ['Foto', 'Drohne', 'Kombi'];

function useCreateBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pkg: any) => {
      const { data, error } = await supabase.from('booking_packages').insert(pkg).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['booking-packages'] }); toast.success('Paket erstellt'); },
  });
}

function useUpdateBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase.from('booking_packages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['booking-packages'] }); toast.success('Paket aktualisiert'); },
  });
}

function useDeleteBookingPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('booking_packages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['booking-packages'] }); toast.success('Paket gelöscht'); },
  });
}

export function PackagesTab() {
  const { data: packages, isLoading } = useBookingPackages();
  const createPackage = useCreateBookingPackage();
  const updatePackage = useUpdateBookingPackage();
  const deletePackage = useDeleteBookingPackage();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    package_type: 'Foto',
    photo_count: 10,
    duration_minutes: 30,
    price_cents: 4900,
    requires_additional_info: false,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      package_type: 'Foto',
      photo_count: 10,
      duration_minutes: 30,
      price_cents: 4900,
      requires_additional_info: false,
      is_active: true,
    });
    setEditingPackage(null);
  };

  const handleOpenDialog = (pkg?: any) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        package_type: pkg.package_type,
        photo_count: pkg.photo_count,
        duration_minutes: pkg.duration_minutes,
        price_cents: pkg.price_cents,
        requires_additional_info: pkg.requires_additional_info ?? false,
        is_active: pkg.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingPackage) {
      await updatePackage.mutateAsync({ id: editingPackage.id, ...formData });
    } else {
      await createPackage.mutateAsync(formData);
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
    return (cents / 100).toFixed(2).replace('.', ',') + '€';
  };

  const getPackageTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Foto': return 'bg-blue-100 text-blue-800';
      case 'Drohne': return 'bg-purple-100 text-purple-800';
      case 'Kombi': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group packages by type
  const groupedPackages = PACKAGE_TYPES.map(type => ({
    type,
    packages: packages?.filter(p => p.package_type === type) || [],
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPackage ? 'Paket bearbeiten' : 'Neues Paket'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Pakettyp</Label>
                <Select
                  value={formData.package_type}
                  onValueChange={(value) => setFormData({ ...formData, package_type: value })}
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
                <Label htmlFor="photo_count">Anzahl Fotos</Label>
                <Input
                  id="photo_count"
                  type="number"
                  value={formData.photo_count}
                  onChange={(e) => setFormData({ ...formData, photo_count: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Dauer (Minuten)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preis (in Euro)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={(formData.price_cents / 100).toFixed(2)}
                  onChange={(e) => setFormData({ ...formData, price_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_additional_info"
                  checked={formData.requires_additional_info}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_additional_info: checked })}
                />
                <Label htmlFor="requires_additional_info">Zusatzinfos erforderlich</Label>
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
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Badge className={getPackageTypeBadgeColor(type)}>{type}</Badge>
              <span className="text-muted-foreground text-sm">({typePackages.length} Pakete)</span>
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fotos</TableHead>
                  <TableHead>Dauer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {typePackages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.photo_count} Fotos</TableCell>
                    <TableCell>{pkg.duration_minutes} Min.</TableCell>
                    <TableCell className="font-mono">{formatPrice(pkg.price_cents)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {pkg.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pkg)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(pkg.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {typePackages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                      Keine {type}-Pakete vorhanden
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
