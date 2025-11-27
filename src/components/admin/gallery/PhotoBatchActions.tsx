import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PhotoBatchActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onDownload: () => void;
  onClearSelection: () => void;
  isDeleting?: boolean;
}

export function PhotoBatchActions({
  selectedCount,
  onDelete,
  onDownload,
  onClearSelection,
  isDeleting = false,
}: PhotoBatchActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
      <Card className="shadow-lg border-border bg-card">
        <div className="flex items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {selectedCount}
            </div>
            <span className="text-sm font-medium text-foreground">
              {selectedCount} {selectedCount === 1 ? 'Foto' : 'Fotos'} ausgewählt
            </span>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Herunterladen
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeleting}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Löschen
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Fotos löschen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dies wird {selectedCount} Foto{selectedCount > 1 ? 's' : ''} dauerhaft löschen.
                    Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Wird gelöscht...' : 'Löschen'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Abbrechen
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
