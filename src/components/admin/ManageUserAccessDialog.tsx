import { useState } from 'react';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  useUserGalleryAccess,
  useAddUserGalleryAccess,
  useRemoveUserGalleryAccess,
} from '@/hooks/useUserGalleryAccess';
import { useGalleries } from '@/hooks/useGalleries';
import { UserActivity } from '@/types/database';

interface ManageUserAccessDialogProps {
  user: UserActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageUserAccessDialog({
  user,
  open,
  onOpenChange,
}: ManageUserAccessDialogProps) {
  const { data: userAccess, isLoading } = useUserGalleryAccess(user.user_id);
  const { galleries } = useGalleries();
  const addAccess = useAddUserGalleryAccess();
  const removeAccess = useRemoveUserGalleryAccess();
  const [selectedGalleryId, setSelectedGalleryId] = useState('');

  const accessedGalleryIds = userAccess?.map((a: any) => a.gallery_id) || [];
  const availableGalleries = galleries?.filter(
    (g) => !accessedGalleryIds.includes(g.id)
  );

  const handleAddAccess = async () => {
    if (!selectedGalleryId) return;

    try {
      await addAccess.mutateAsync({
        userId: user.user_id,
        galleryId: selectedGalleryId,
      });
      setSelectedGalleryId('');
    } catch (error) {
      console.error('Error adding access:', error);
    }
  };

  const handleRemoveAccess = async (galleryId: string) => {
    try {
      await removeAccess.mutateAsync({
        userId: user.user_id,
        galleryId,
      });
    } catch (error) {
      console.error('Error removing access:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Galeriezugriff verwalten</DialogTitle>
          <DialogDescription>
            Steuern Sie, auf welche Galerien {user.email} zugreifen kann
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Galeriezugriff hinzufügen</Label>
            <div className="flex gap-2">
              <Select
                value={selectedGalleryId}
                onValueChange={setSelectedGalleryId}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Galerie auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableGalleries?.map((gallery) => (
                    <SelectItem key={gallery.id} value={gallery.id}>
                      {gallery.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddAccess}
                disabled={!selectedGalleryId || addAccess.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aktueller Zugriff ({userAccess?.length || 0})</Label>
            <ScrollArea className="h-[300px] border rounded-md">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Lädt...
                </div>
              ) : userAccess?.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FolderOpen className="mx-auto h-12 w-12 mb-2 opacity-50" />
                  <p>Noch kein Galeriezugriff</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {userAccess?.map((access: any) => (
                    <div
                      key={access.gallery_id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{access.galleries.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {access.galleries.slug}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{access.galleries.status}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAccess(access.gallery_id)}
                          disabled={removeAccess.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
