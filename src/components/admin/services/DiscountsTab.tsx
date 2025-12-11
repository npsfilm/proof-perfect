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
import { Plus, Pencil, Trash2, Percent, Tag, Gift } from 'lucide-react';
import { useDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, Discount } from '@/hooks/useDiscounts';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Prozent-Rabatt', icon: Percent },
  { value: 'fixed', label: 'Fester Betrag', icon: Tag },
  { value: 'buy_x_get_y', label: 'X kaufen, Y gratis', icon: Gift },
];

export function DiscountsTab() {
  const { data: discounts, isLoading } = useDiscounts();
  const { data: services } = useServices();
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    service_id: '',
    discount_type: 'percentage' as 'percentage' | 'fixed' | 'buy_x_get_y',
    percentage: 0,
    fixed_amount_cents: 0,
    buy_quantity: 5,
    free_quantity: 1,
    min_quantity: 1,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      service_id: '',
      discount_type: 'percentage',
      percentage: 0,
      fixed_amount_cents: 0,
      buy_quantity: 5,
      free_quantity: 1,
      min_quantity: 1,
      is_active: true,
    });
    setEditingDiscount(null);
  };

  const handleOpenDialog = (discount?: Discount) => {
    if (discount) {
      setEditingDiscount(discount);
      setFormData({
        name: discount.name,
        service_id: discount.service_id || '',
        discount_type: discount.discount_type,
        percentage: discount.percentage || 0,
        fixed_amount_cents: discount.fixed_amount_cents || 0,
        buy_quantity: discount.buy_quantity || 5,
        free_quantity: discount.free_quantity || 1,
        min_quantity: discount.min_quantity || 1,
        is_active: discount.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const data: any = {
      name: formData.name,
      service_id: formData.service_id || null,
      discount_type: formData.discount_type,
      min_quantity: formData.min_quantity,
      is_active: formData.is_active,
    };

    if (formData.discount_type === 'percentage') {
      data.percentage = formData.percentage;
    } else if (formData.discount_type === 'fixed') {
      data.fixed_amount_cents = formData.fixed_amount_cents;
    } else if (formData.discount_type === 'buy_x_get_y') {
      data.buy_quantity = formData.buy_quantity;
      data.free_quantity = formData.free_quantity;
    }
    
    if (editingDiscount) {
      await updateDiscount.mutateAsync({ id: editingDiscount.id, ...data });
    } else {
      await createDiscount.mutateAsync(data);
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Rabatt wirklich löschen?')) {
      await deleteDiscount.mutateAsync(id);
    }
  };

  const getServiceName = (serviceId: string | null) => {
    if (!serviceId) return 'Global';
    return services?.find(s => s.id === serviceId)?.name || '-';
  };

  const formatDiscountValue = (discount: Discount) => {
    switch (discount.discount_type) {
      case 'percentage':
        return `${discount.percentage}%`;
      case 'fixed':
        return `${((discount.fixed_amount_cents || 0) / 100).toFixed(2).replace('.', ',')}€`;
      case 'buy_x_get_y':
        return `${discount.buy_quantity}+${discount.free_quantity}`;
      default:
        return '-';
    }
  };

  const getDiscountTypeIcon = (type: string) => {
    const found = DISCOUNT_TYPES.find(t => t.value === type);
    return found ? found.icon : Tag;
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rabatte</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Rabatt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? 'Rabatt bearbeiten' : 'Neuer Rabatt'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Staging 5+1"
                />
              </div>
              <div className="space-y-2">
                <Label>Service (optional)</Label>
                <Select
                  value={formData.service_id || "__global__"}
                  onValueChange={(value) => setFormData({ ...formData, service_id: value === "__global__" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Global (alle Services)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__global__">Global (alle Services)</SelectItem>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Rabatt-Typ</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value: 'percentage' | 'fixed' | 'buy_x_get_y') => setFormData({ ...formData, discount_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.discount_type === 'percentage' && (
                <div className="space-y-2">
                  <Label htmlFor="percentage">Prozent</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              {formData.discount_type === 'fixed' && (
                <div className="space-y-2">
                  <Label htmlFor="fixed_amount">Betrag (in Euro)</Label>
                  <Input
                    id="fixed_amount"
                    type="number"
                    step="0.01"
                    value={(formData.fixed_amount_cents / 100).toFixed(2)}
                    onChange={(e) => setFormData({ ...formData, fixed_amount_cents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                  />
                </div>
              )}

              {formData.discount_type === 'buy_x_get_y' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buy_quantity">Kaufen</Label>
                    <Input
                      id="buy_quantity"
                      type="number"
                      value={formData.buy_quantity}
                      onChange={(e) => setFormData({ ...formData, buy_quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="free_quantity">Gratis</Label>
                    <Input
                      id="free_quantity"
                      type="number"
                      value={formData.free_quantity}
                      onChange={(e) => setFormData({ ...formData, free_quantity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="min_quantity">Mindestmenge</Label>
                <Input
                  id="min_quantity"
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 1 })}
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
                disabled={createDiscount.isPending || updateDiscount.isPending}
              >
                {editingDiscount ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Wert</TableHead>
              <TableHead>Min. Menge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts?.map((discount) => {
              const TypeIcon = getDiscountTypeIcon(discount.discount_type);
              return (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getServiceName(discount.service_id)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-4 w-4 text-muted-foreground" />
                      {DISCOUNT_TYPES.find(t => t.value === discount.discount_type)?.label}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{formatDiscountValue(discount)}</TableCell>
                  <TableCell>{discount.min_quantity}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${discount.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {discount.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(discount)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(discount.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {discounts?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Keine Rabatte vorhanden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
