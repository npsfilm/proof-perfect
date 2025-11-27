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
            {selectedCount} selected
          </Badge>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDuplicate}
              disabled={isProcessing}
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowStatusDialog(true)}
              disabled={isProcessing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Change Status
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
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Gallery Status</DialogTitle>
            <DialogDescription>
              Change the status of {selectedCount} selected {selectedCount === 1 ? 'gallery' : 'galleries'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
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
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Status'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Galleries</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} {selectedCount === 1 ? 'gallery' : 'galleries'}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
