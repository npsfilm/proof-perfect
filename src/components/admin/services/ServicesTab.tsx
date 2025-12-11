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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { useServices, useCreateService, useUpdateService, useDeleteService, Service } from '@/hooks/useServices';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PRICE_TYPES = [
  { value: 'fixed', label: 'Festpreis' },
  { value: 'per_image', label: 'Pro Bild' },
  { value: 'per_room', label: 'Pro Raum' },
];

export function ServicesTab() {
  const { data: services, isLoading } = useServices();
  const { data: categories } = useServiceCategories();
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    price_cents: 0,
    price_type: 'fixed' as 'fixed' | 'per_image' | 'per_room',
    icon_name: 'Sparkles',
    gradient_class: '',
    is_popular: false,
    show_in_booking: false,
    show_in_finalize: false,
    show_in_virtual_editing: false,
    requires_photo_selection: false,
    sort_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      category_id: '',
      price_cents: 0,
      price_type: 'fixed',
      icon_name: 'Sparkles',
      gradient_class: '',
      is_popular: false,
      show_in_booking: false,
      show_in_finalize: false,
      show_in_virtual_editing: false,
      requires_photo_selection: false,
      sort_order: 0,
      is_active: true,
    });
    setEditingService(null);
  };

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        slug: service.slug,
        description: service.description || '',
        category_id: service.category_id || '',
        price_cents: service.price_cents,
        price_type: service.price_type,
        icon_name: service.icon_name || 'Sparkles',
        gradient_class: service.gradient_class || '',
        is_popular: service.is_popular ?? false,
        show_in_booking: service.show_in_booking ?? false,
        show_in_finalize: service.show_in_finalize ?? false,
        show_in_virtual_editing: service.show_in_virtual_editing ?? false,
        requires_photo_selection: service.requires_photo_selection ?? false,
        sort_order: service.sort_order || 0,
        is_active: service.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const data = {
      ...formData,
      slug,
      category_id: formData.category_id || null,
    };
    
    if (editingService) {
      await updateService.mutateAsync({ id: editingService.id, ...data });
    } else {
      await createService.mutateAsync(data);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Service wirklich löschen?')) {
      await deleteService.mutateAsync(id);
    }
  };

  const formatPrice = (cents: number, type: string) => {
    const euro = (cents / 100).toFixed(2).replace('.', ',');
    const suffix = type === 'per_image' ? '/Bild' : type === 'per_room' ? '/Raum' : '';
    return `${euro}€${suffix}`;
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    return categories?.find(c => c.id === categoryId)?.name || '-';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Services</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Service bearbeiten' : 'Neuer Service'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Virtuelles Staging"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="wird automatisch generiert"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kurze Beschreibung des Services"
                />
              </div>
              <div className="space-y-2">
                <Label>Kategorie</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preistyp</Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value: 'fixed' | 'per_image' | 'per_room') => setFormData({ ...formData, price_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="space-y-2">
                <Label htmlFor="sort_order">Reihenfolge</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon_name">Icon (Lucide)</Label>
                <Input
                  id="icon_name"
                  value={formData.icon_name}
                  onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                  placeholder="z.B. Wand2, Camera"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradient_class">Gradient Klasse</Label>
                <Input
                  id="gradient_class"
                  value={formData.gradient_class}
                  onChange={(e) => setFormData({ ...formData, gradient_class: e.target.value })}
                  placeholder="z.B. from-blue-500 to-indigo-600"
                />
              </div>
              
              <div className="col-span-2 border-t pt-4 mt-2">
                <h4 className="font-medium mb-3">Anzeigeoptionen</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_in_booking"
                      checked={formData.show_in_booking}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_booking: checked })}
                    />
                    <Label htmlFor="show_in_booking">Im Buchungs-Funnel</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_in_finalize"
                      checked={formData.show_in_finalize}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_finalize: checked })}
                    />
                    <Label htmlFor="show_in_finalize">Im Finalisierungs-Flow</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_in_virtual_editing"
                      checked={formData.show_in_virtual_editing}
                      onCheckedChange={(checked) => setFormData({ ...formData, show_in_virtual_editing: checked })}
                    />
                    <Label htmlFor="show_in_virtual_editing">Auf Virtual Editing Seite</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requires_photo_selection"
                      checked={formData.requires_photo_selection}
                      onCheckedChange={(checked) => setFormData({ ...formData, requires_photo_selection: checked })}
                    />
                    <Label htmlFor="requires_photo_selection">Benötigt Foto-Auswahl</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_popular"
                      checked={formData.is_popular}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                    />
                    <Label htmlFor="is_popular">"Beliebt" Badge</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Aktiv</Label>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={createService.isPending || updateService.isPending}
                >
                  {editingService ? 'Speichern' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Anzeige</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.name}</span>
                    {service.is_popular && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {getCategoryName(service.category_id)}
                </TableCell>
                <TableCell className="font-mono">
                  {formatPrice(service.price_cents, service.price_type)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {service.show_in_booking && <Badge variant="outline" className="text-xs">Buchung</Badge>}
                    {service.show_in_finalize && <Badge variant="outline" className="text-xs">Finalize</Badge>}
                    {service.show_in_virtual_editing && <Badge variant="outline" className="text-xs">VE</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {service.is_active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
