import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GalleryStatus } from '@/types/database';
import { Copy, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onDuplicate: () => Promise<void>;
  onBulkStatusUpdate: (status: GalleryStatus) => Promise<void>;
  onBulkDelete: () => Promise<void>;
  onClearSelection: () => void;
}

export function BatchActionsBar({
  selectedCount,
  onDuplicate,
  onBulkStatusUpdate,
  onBulkDelete,
  onClearSelection,
}: BatchActionsBarProps) {
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<GalleryStatus>('Draft');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStatusUpdate = async () => {
    setIsProcessing(true);
    try {
      await onBulkStatusUpdate(selectedStatus);
      setShowStatusDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete();
      setShowDeleteDialog(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    setIsProcessing(true);
    try {
      await onDuplicate();
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-card border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
          <Badge variant="secondary" className="font-semibold">
            {selectedCount} ausgewählt
          </Badge>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicate}
              disabled={isProcessing}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplizieren
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatusDialog(true)}
              disabled={isProcessing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Status ändern
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isProcessing}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Ausgewählte löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            Leeren
          </Button>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Galerie-Status aktualisieren</DialogTitle>
            <DialogDescription>
              Status von {selectedCount} ausgewählter {selectedCount === 1 ? 'Galerie' : 'Galerien'} ändern
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Neuer Status</Label>
              <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as GalleryStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird aktualisiert...
                </>
              ) : (
                'Status aktualisieren'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Galerien löschen</DialogTitle>
            <DialogDescription>
              Sind Sie sicher, dass Sie {selectedCount} {selectedCount === 1 ? 'Galerie' : 'Galerien'} löschen möchten? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gelöscht...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Löschen
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}