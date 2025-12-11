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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, GripVertical, Home, Bed, UtensilsCrossed, Bath, Monitor, Utensils, Sofa } from 'lucide-react';
import {
  useRoomTypes,
  useCreateRoomType,
  useUpdateRoomType,
  useDeleteRoomType,
  RoomType,
} from '@/hooks/useRoomTypes';
import { Skeleton } from '@/components/ui/skeleton';

const ICON_OPTIONS = [
  { name: 'Home', icon: Home },
  { name: 'Sofa', icon: Sofa },
  { name: 'Bed', icon: Bed },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Bath', icon: Bath },
  { name: 'Monitor', icon: Monitor },
  { name: 'Utensils', icon: Utensils },
];

const getIconComponent = (iconName: string | null) => {
  const found = ICON_OPTIONS.find(i => i.name === iconName);
  return found ? found.icon : Home;
};

export function RoomTypesTab() {
  const { data: roomTypes, isLoading } = useRoomTypes();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_name: 'Home',
    sort_order: 0,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon_name: 'Home',
      sort_order: 0,
      is_active: true,
    });
    setEditingRoomType(null);
  };

  const handleOpenDialog = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setFormData({
        name: roomType.name,
        slug: roomType.slug,
        icon_name: roomType.icon_name || 'Home',
        sort_order: roomType.sort_order || 0,
        is_active: roomType.is_active ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    if (editingRoomType) {
      await updateRoomType.mutateAsync({ id: editingRoomType.id, ...formData, slug });
    } else {
      await createRoomType.mutateAsync({ ...formData, slug });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Möchten Sie diesen Raumtyp wirklich löschen?')) {
      await deleteRoomType.mutateAsync(id);
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Raumtypen</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Neuer Raumtyp
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRoomType ? 'Raumtyp bearbeiten' : 'Neuer Raumtyp'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Wohnzimmer"
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
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((option) => {
                    const IconComp = option.icon;
                    return (
                      <Button
                        key={option.name}
                        type="button"
                        variant={formData.icon_name === option.name ? 'default' : 'outline'}
                        className="h-12"
                        onClick={() => setFormData({ ...formData, icon_name: option.name })}
                      >
                        <IconComp className="h-5 w-5" />
                      </Button>
                    );
                  })}
                </div>
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
                disabled={createRoomType.isPending || updateRoomType.isPending}
              >
                {editingRoomType ? 'Speichern' : 'Erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomTypes?.map((roomType) => {
              const IconComp = getIconComponent(roomType.icon_name);
              return (
                <TableRow key={roomType.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <IconComp className="h-4 w-4" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{roomType.name}</TableCell>
                  <TableCell className="text-muted-foreground">{roomType.slug}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${roomType.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {roomType.is_active ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(roomType)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(roomType.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
