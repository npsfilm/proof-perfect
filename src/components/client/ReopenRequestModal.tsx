import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateReopenRequest } from '@/hooks/useReopenRequests';
import { useAnsprache } from '@/contexts/AnspracheContext';

interface ReopenRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
  galleryName: string;
}

export function ReopenRequestModal({ 
  open, 
  onOpenChange, 
  galleryId,
  galleryName 
}: ReopenRequestModalProps) {
  const [message, setMessage] = useState('');
  const createRequest = useCreateReopenRequest();
  const { t } = useAnsprache();

  const handleSubmit = () => {
    createRequest.mutate(
      { galleryId, message: message.trim() || undefined },
      {
        onSuccess: () => {
          setMessage('');
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Galerie wiedereröffnen</DialogTitle>
          <DialogDescription>
            {t(
              `Möchtest du die Galerie "${galleryName}" wiedereröffnen lassen? Deine Anfrage wird an das Team gesendet.`,
              `Möchten Sie die Galerie "${galleryName}" wiedereröffnen lassen? Ihre Anfrage wird an das Team gesendet.`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="message">
              Nachricht (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Grund für die Wiedereröffnung..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createRequest.isPending}
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createRequest.isPending}
          >
            {createRequest.isPending ? 'Wird gesendet...' : 'Anfrage senden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
